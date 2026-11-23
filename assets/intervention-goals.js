/* Goals for «اتبع التعليمات»: each skill on the road is a short-term goal. The app keeps its own rule for
 * mastery (8 of the last 10 practice directions independent, on at least two days); this file adds the estimate
 * that builds up or falls back session by session, and the red / green / yellow groups used by the report and
 * by the children's accounts dashboard in the tools site. It stands alone: an answer's item id starts with its skill. */
((root) => {
    'use strict';
    const APP = { id: 'follow-direction', name: 'اتبع التعليمات' };
    // The road's order (assets/program.js): suggested next goals follow it.
    const ORDER = ['one', 'objects', 'attributes', 'quantity', 'function', 'space', 'two', 'order', 'play', 'condition', 'three'];
    const GOALS = [
        {
            id: 'L1', title: 'تعليمة من خطوة واحدة', text: 'ينفّذ الطفل تعليمة من خطوة واحدة بدون مساعدة.',
            short: [
                { id: 'one', text: 'ينفّذ حركة واحدة.', where: 'حركة واحدة' },
                { id: 'objects', text: 'يحضر أو يشير لشيء مألوف.', where: 'أشياء مألوفة' },
                { id: 'attributes', text: 'يختار حسب اللون والحجم.', where: 'لون وحجم' },
                { id: 'quantity', text: 'يعطي واحداً أو اثنين أو ثلاثة.', where: 'واحد واثنان وثلاثة' },
                { id: 'function', text: 'يختار الشيء حسب استعماله.', where: 'استخدام الأشياء' },
                { id: 'space', text: 'يضع الشيء في المكان المطلوب.', where: 'المكان' }
            ]
        },
        {
            id: 'L2', title: 'تعليمات من خطوتين وأكثر', text: 'ينفّذ الطفل تعليمات أطول بالترتيب.',
            short: [
                { id: 'two', text: 'ينفّذ حركتين بالترتيب.', where: 'حركتان بالترتيب' },
                { id: 'order', text: 'يحضر أشياء بالترتيب المطلوب.', where: 'أشياء بالترتيب' },
                { id: 'play', text: 'ينفّذ خطوتين أثناء اللعب.', where: 'خطوتان في اللعب' },
                { id: 'condition', text: 'ينفّذ تعليمة فيها «إذا…».', where: 'إذا…' },
                { id: 'three', text: 'ينفّذ ثلاث خطوات بالترتيب.', where: 'ثلاث خطوات' }
            ]
        }
    ];
    const ACHIEVED = 80, DAY = 864e5;
    const byId = new Map(GOALS.flatMap(goal => goal.short.map(item => [item.id, { ...item, long: goal }])));
    const skillOf = item => String(item || '').replace(/[-_]?\d+$/, '');
    /** Per skill: each practice session moves the estimate halfway toward that session's independent rate.
     *  Achieved uses the app's own rule: 8 of the last 10 practice directions independent, on two days or more. */
    function estimate(child) {
        const out = {}, recent = {};
        const sessions = (child?.sessions || []).filter(s => s.mode === 'practice').map(s => ({ ...s, time: Date.parse(s.started || s.finished) || 0 })).sort((a, b) => a.time - b.time);
        for (const session of sessions) {
            const bySkill = new Map();
            for (const r of session.results || []) { if (r.outcome === 'skip') continue; const id = skillOf(r.item); if (!byId.has(id)) continue; (bySkill.get(id) || bySkill.set(id, []).get(id)).push(r); }
            for (const [id, rows] of bySkill) {
                const score = Math.round(rows.filter(r => r.outcome === 'independent').length / rows.length * 100);
                const goal = out[id] ||= { percent: null, sessions: 0, streak: 0, achieved: null, history: [] };
                goal.percent = goal.percent == null ? score : Math.round((goal.percent + score) / 2);
                goal.sessions++; goal.streak = score >= ACHIEVED ? goal.streak + 1 : 0;
                goal.last = new Date(session.time).toISOString(); goal.history.push({ date: goal.last, score, percent: goal.percent });
                const last = (recent[id] = [...(recent[id] || []), ...rows]).slice(-10);
                if (!goal.achieved && last.length === 10 && last.filter(r => r.outcome === 'independent').length >= 8 && new Set(last.map(r => String(r.at).slice(0, 10))).size >= 2) goal.achieved = goal.last;
            }
        }
        return out;
    }
    /** Suggested next goals: the next skills on the road that are not achieved or being worked on yet. */
    function suggest(planIds, achievedIds, limit = 3) {
        const busy = new Set([...planIds, ...achievedIds]);
        return ORDER.filter(id => !busy.has(id)).slice(0, limit);
    }
    /** The plan is the road itself: every skill the child has practised. */
    const planOf = child => ({ goals: ORDER.filter(id => estimate(child)[id]).map(id => ({ id })) });
    const api = { APP, GOALS, ORDER, ACHIEVED, LEVELS: [20, 40, 60, 80], PLANS: [], SOURCES: {}, estimate, suggest, planOf, short: id => byId.get(id) || null };
    if (typeof module !== 'undefined') module.exports = api;
    root.InterventionGoals = api;
})(globalThis);
