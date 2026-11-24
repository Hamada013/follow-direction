/* Goal bank for «اتبع التعليمات», in the same shape as the other apps (كلمة, جملة, مقطع): long-term goals,
 * each with short-term goals the therapist adds to the child's plan (assets/intervention.js), ready plans,
 * the 20/40/60/80% ratings, and estimates the app fills in from the child's screening and practice answers.
 * The children's accounts dashboard in the tools site loads this file on its own, so it needs no other script:
 * it reads the directions bank when present and otherwise falls back to the answer's skill (its item id). */
((root) => {
    'use strict';
    // This app: name for reports, the therapist-mode key (assets/app.js uses the same one), its store, and
    // how the shared plan window words the achievement rule and draws the PDF.
    const APP = {
        id: 'follow-direction', name: 'اتبع التعليمات', therapistKey: 'follow-direction-therapist-v1', unlocksLevels: true,
        progress: () => root.FollowProgress, font: 'system-ui, -apple-system, "Segoe UI", Tahoma, Arial, sans-serif', pdfLibrary: 'assets/jspdf.umd.min.js',
        rule: '8 من آخر 10 تعليمات بدون مساعدة في يومين على الأقل'
    };
    const SOURCES = {
        'asha-sld': {
            label: 'ASHA Practice Portal: Spoken Language Disorders',
            url: 'https://www.asha.org/practice-portal/clinical-topics/spoken-language-disorders/',
            note: 'Following directions is part of language comprehension; targets are chosen for the child and practised in play and daily routines.'
        },
        'tomlin-2007': {
            label: 'Tomlin, K. J. (2007). Just for Adults: Following Directions. LinguiSystems.',
            url: '',
            note: 'Source of the task structures (one, two and three steps, concepts, conditions), adapted here for preschool children; not a norm.'
        }
    };

    const GOALS = [
        {
            id: 'L1', title: 'تعليمة من خطوة واحدة', text: 'ينفّذ الطفل تعليمة قصيرة من خطوة واحدة.', sources: ['asha-sld', 'tomlin-2007'],
            short: [
                { id: 'S1.1', text: 'ينفّذ حركة واحدة: «صفّق، لوّح، ارفع يديك».', where: 'حركة واحدة' },
                { id: 'S1.2', text: 'يلمس جزءاً من جسمه عند الطلب: «المس أنفك».', where: 'حركة واحدة · المس' },
                { id: 'S1.3', text: 'يشير إلى شيء مألوف عند سماع اسمه.', where: 'أشياء مألوفة' },
                { id: 'S1.4', text: 'يختار الشيء حسب استعماله: «شيء نأكله».', where: 'استخدام الأشياء' }
            ]
        },
        {
            id: 'L2', title: 'اللون والحجم والعدد', text: 'يفهم الطفل اللون والحجم والعدد في التعليمة.', sources: ['asha-sld', 'tomlin-2007'],
            short: [
                { id: 'S2.1', text: 'يختار حسب اللون: «المربع الأحمر».', where: 'لون وحجم' },
                { id: 'S2.2', text: 'يختار حسب الحجم: «الدائرة الكبيرة».', where: 'لون وحجم' },
                { id: 'S2.3', text: 'يختار حسب اللون والحجم معاً.', where: 'لون وحجم' },
                { id: 'S2.4', text: 'يختار العدد المطلوب: واحد، اثنان، ثلاثة.', where: 'واحد واثنان وثلاثة' }
            ]
        },
        {
            id: 'L3', title: 'المكان', text: 'يضع الطفل الشيء في المكان المطلوب.', sources: ['asha-sld', 'tomlin-2007'],
            short: [
                { id: 'S3.1', text: 'يضع الشيء داخل أو فوق.', where: 'المكان' },
                { id: 'S3.2', text: 'يضع الشيء تحت أو بجانب.', where: 'المكان' },
                { id: 'S3.3', text: 'يضع الشيء أمام أو خلف أو خارج أو بين.', where: 'المكان' }
            ]
        },
        {
            id: 'L4', title: 'خطوتان وأكثر', text: 'ينفّذ الطفل تعليمات أطول بالترتيب.', sources: ['asha-sld', 'tomlin-2007'],
            short: [
                { id: 'S4.1', text: 'ينفّذ حركتين بالترتيب.', where: 'حركتان بالترتيب' },
                { id: 'S4.2', text: 'يشير إلى شيئين بالترتيب المطلوب.', where: 'أشياء بالترتيب' },
                { id: 'S4.3', text: 'ينفّذ خطوتين أثناء اللعب.', where: 'خطوتان في اللعب' },
                { id: 'S4.4', text: 'ينفّذ ثلاث خطوات بالترتيب.', where: 'ثلاث خطوات' }
            ]
        },
        {
            id: 'L5', title: 'تعليمات «إذا…»', text: 'ينفّذ الطفل التعليمة عندما يرى شرطها.', sources: ['tomlin-2007'],
            short: [
                { id: 'S5.1', text: 'ينفّذ «إذا…» بشرط واحد يراه.', where: 'إذا…' },
                { id: 'S5.2', text: 'يختار بين أمرين حسب ما يراه: «إذا… وإذا…».', where: 'إذا…' }
            ]
        },
        {
            id: 'L6', title: 'الاستعمال اليومي', text: 'ينفّذ الطفل التعليمات من أول مرة وخارج الجلسة.', sources: ['asha-sld'],
            short: [
                { id: 'S6.1', text: 'ينفّذ التعليمة من أول مرة بدون مساعدة.', where: 'كل التعليمات' },
                { id: 'S6.2', text: 'ينفّذ تعليمات البيت اليومية (حسب الأهل).', where: 'خارج التطبيق' },
                { id: 'S6.3', text: 'ينفّذ التعليمة من شخص غير المعالج.', where: 'خارج التطبيق' }
            ]
        }
    ];

    // Ready-made plans: one tap adds their short-term goals to the child's plan.
    const PLANS = [
        { id: 'P1', title: 'بداية', text: 'حركة واحدة وأشياء مألوفة', goals: ['S1.1', 'S1.2', 'S1.3', 'S2.1', 'S3.1'] },
        { id: 'P2', title: 'متوسط', text: 'مفاهيم ومكان وخطوتان', goals: ['S1.4', 'S2.2', 'S2.4', 'S3.2', 'S4.1', 'S4.2'] },
        { id: 'P3', title: 'متقدم', text: 'خطوات أكثر وشروط', goals: ['S2.3', 'S3.3', 'S4.3', 'S4.4', 'S5.1', 'S5.2', 'S6.1'] }
    ];
    const LEVELS = [20, 40, 60, 80];
    const ACHIEVED = 80;
    const byId = new Map(GOALS.flatMap(goal => goal.short.map(item => [item.id, { ...item, long: goal }])));

    // ---- Estimates from the child's answers ----
    // Which answers count for each goal. Each check gets the direction { id, group, prompt }.
    // S6.2 and S6.3 happen outside the app and are rated by the therapist only.
    const skillOf = id => String(id || '').replace(/[-_]?\d+$/, '');
    const bank = () => root.FollowBank || (typeof module !== 'undefined' && typeof require === 'function' ? require('./bank.js') : null);
    const promptOf = id => bank()?.items?.find(item => item.id === id)?.prompt || '';
    const COLOR = /(أحمر|حمراء|أزرق|زرقاء|أصفر|صفراء|أخضر|خضراء)/, SIZE = /(كبير|صغير)/;
    const MEASURES = {
        'S1.1': d => d.group === 'one' && !d.prompt.startsWith('المس'),
        'S1.2': d => d.group === 'one' && d.prompt.startsWith('المس'),
        'S1.3': d => d.group === 'objects',
        'S1.4': d => d.group === 'function',
        'S2.1': d => d.group === 'attributes' && COLOR.test(d.prompt) && !SIZE.test(d.prompt),
        'S2.2': d => d.group === 'attributes' && SIZE.test(d.prompt) && !COLOR.test(d.prompt),
        'S2.3': d => d.group === 'attributes' && SIZE.test(d.prompt) && COLOR.test(d.prompt),
        'S2.4': d => d.group === 'quantity',
        'S3.1': d => d.group === 'space' && /(داخل|فوق)/.test(d.prompt),
        'S3.2': d => d.group === 'space' && /(تحت|بجانب)/.test(d.prompt),
        'S3.3': d => d.group === 'space' && /(أمام|خلف|خارج|بين)/.test(d.prompt),
        'S4.1': d => d.group === 'two',
        'S4.2': d => d.group === 'order',
        'S4.3': d => d.group === 'play',
        'S4.4': d => d.group === 'three',
        'S5.1': d => d.group === 'condition' && !d.prompt.includes('وإذا'),
        'S5.2': d => d.group === 'condition' && d.prompt.includes('وإذا'),
        'S6.1': () => true
    };
    /** Estimates for every measured goal, from the child's screening and practice answers in date order.
     *  Each session moves the estimate halfway toward that session's independent rate, so it builds up or
     *  falls back over time. A goal is achieved with the app's own rule: 8 of its last 10 answers independent,
     *  on at least two different days. Skipped answers do not count. */
    function estimate(child) {
        const out = {}, recent = {};
        const sessions = (child?.sessions || []).filter(s => Array.isArray(s.results) && s.results.length)
            .map(s => ({ ...s, time: Date.parse(s.started || s.finished) || 0 })).sort((a, b) => a.time - b.time);
        for (const session of sessions) {
            const answers = session.results.filter(r => r.outcome !== 'skip').map(r => ({ ...r, group: skillOf(r.item), prompt: promptOf(r.item) }));
            for (const [id, counts] of Object.entries(MEASURES)) {
                const rows = answers.filter(counts); if (!rows.length) continue;
                const score = Math.round(rows.filter(r => r.outcome === 'independent').length / rows.length * 100);
                const goal = out[id] ||= { percent: null, sessions: 0, streak: 0, achieved: null, history: [] };
                goal.percent = goal.percent == null ? score : Math.round((goal.percent + score) / 2);
                goal.sessions++; goal.streak = score >= ACHIEVED ? goal.streak + 1 : 0;
                goal.last = new Date(session.time).toISOString(); goal.history.push({ date: goal.last, score, percent: goal.percent });
                const last = (recent[id] = [...(recent[id] || []), ...rows]).slice(-10);
                if (!goal.achieved && last.length === 10 && last.filter(r => r.outcome === 'independent').length >= 8 && new Set(last.map(r => String(r.at || goal.last).slice(0, 10))).size >= 2) goal.achieved = goal.last;
            }
        }
        return out;
    }
    /** Suggested next goals: after an achieved goal, the next goal of the same long-term goal that is not in the plan yet. */
    function suggest(planIds, achievedIds, limit = 4) {
        const inPlan = new Set(planIds), done = new Set(achievedIds), out = [];
        for (const goal of GOALS) {
            const ids = goal.short.map(item => item.id);
            if (!ids.some(id => done.has(id))) continue;
            const next = ids.find(id => !inPlan.has(id));
            if (next) out.push(next);
        }
        return out.slice(0, limit);
    }
    const api = { APP, SOURCES, GOALS, PLANS, LEVELS, ACHIEVED, MEASURES, estimate, suggest, short: id => byId.get(id) || null };
    if (typeof module !== 'undefined') module.exports = api;
    root.InterventionGoals = api;
})(globalThis);
