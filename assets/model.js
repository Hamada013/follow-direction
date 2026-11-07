((root)=>{
 'use strict';
 const KEY='follow-direction-children-v1';
 const clone=x=>JSON.parse(JSON.stringify(x));
 const nameKey=x=>x.normalize('NFKC').trim().toLocaleLowerCase();
 const admin=c=>c.role==='admin'||nameKey(c.name)==='hamada';
 const GENDERS=['boy','girl'];
 // Birth dates are optional calendar dates (YYYY-MM-DD), never in the future.
 const validBirth=x=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;const d=new Date(x+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===x&&x>='1990-01-01'&&+d<=Date.now();};
 function validate(d,bank){
  if(d?.schema!==1||!Number.isInteger(d.revision)||!Array.isArray(d.children)||d.children.length>1000)throw Error('ملف الحسابات غير صالح.');
  const ids=new Set();
  for(const c of d.children){
   if(!c||typeof c.id!=='string'||ids.has(c.id)||typeof c.name!=='string'||!c.name.trim()||c.name.length>60||!Array.isArray(c.sessions))throw Error('بيانات حساب غير صالحة.');
   ids.add(c.id);
   if(c.gender!==undefined&&!GENDERS.includes(c.gender))throw Error('الجنس غير صالح.');
   if(c.birth!==undefined&&!validBirth(c.birth))throw Error('تاريخ الميلاد غير صالح.');
   for(const s of c.sessions){
    if(!s||typeof s.id!=='string'||!['screen','practice'].includes(s.mode)||!Array.isArray(s.items)||!s.items.length||s.items.length>bank.items.length||new Set(s.items).size!==s.items.length||s.items.some(id=>!bank.items.some(i=>i.id===id&&i.phase===s.mode))||!Array.isArray(s.results)||s.results.length>s.items.length||!s.results.every((r,i)=>r.item===s.items[i]&&['independent','help','incorrect','skip'].includes(r.outcome))||typeof s.helped!=='boolean'||typeof s.ended!=='boolean'||typeof s.complete!=='boolean'||!Array.isArray(s.selection))throw Error('بيانات جلسة غير صالحة.');
    if(s.complete&&(!s.ended||s.results.length!==s.items.length))throw Error('جلسة غير مكتملة.');
   }
   if(c.games!==undefined&&(!Array.isArray(c.games)||c.games.length>2000||!c.games.every(g=>g&&bank.groups.some(x=>x.id===g.group)&&Number.isInteger(g.rounds)&&Number.isInteger(g.firstTry)&&g.firstTry>=0&&g.firstTry<=g.rounds)))throw Error('بيانات الألعاب غير صالحة.');
   if(c.program!==undefined&&(!c.program||typeof c.program.done!=='object'||typeof c.program.unlocked!=='object'))throw Error('بيانات الخطة اليومية غير صالحة.');
  }
  if(d.active!==null&&!ids.has(d.active))throw Error('الحساب النشط غير موجود.');
  return d;
 }
 class Store{
  constructor(storage,bank){this.storage=storage;this.bank=bank;this.raw=storage.getItem(KEY);this.data=this.raw?validate(JSON.parse(this.raw),bank):{schema:1,revision:0,active:null,children:[],deletedChildren:{}};}
  active(){return this.data.children.find(c=>c.id===this.data.active)||null;}
  commit(fn){
   if(this.storage.getItem(KEY)!==this.raw)throw Error('تغيّرت البيانات في نافذة أخرى. أعد فتح التطبيق قبل المتابعة.');
   const next=clone(this.data);fn(next);next.revision++;validate(next,this.bank);const raw=JSON.stringify(next);this.storage.setItem(KEY,raw);this.data=next;this.raw=raw;return this.active();
  }
  // New accounts may carry gender and birth date; an existing account only gains what it lacks.
  signIn(name,profile={}){name=String(name).trim();if(!name||name.length>60)throw Error('أدخل اسمًا من ١ إلى ٦٠ حرفًا.');const extra=cleanProfile(profile);return this.commit(d=>{let c=d.children.find(c=>nameKey(c.name)===nameKey(name));if(!c){c={id:crypto.randomUUID(),name,role:nameKey(name)==='hamada'?'admin':'child',created:new Date().toISOString(),sessions:[]};d.children.push(c);}if(!admin(c))for(const [k,v]of Object.entries(extra))if(c[k]===undefined)c[k]=v;d.active=c.id;});}
  // Sets or clears gender and birth date for one child; an empty value clears it.
  setProfile(id,profile){const extra=cleanProfile(profile,true);return this.commit(d=>{const c=d.children.find(c=>c.id===id);if(!c||admin(c))throw Error('الحساب غير موجود.');for(const [k,v]of Object.entries(extra)){if(v===null)delete c[k];else c[k]=v;}});}
  select(id){return this.commit(d=>{if(!d.children.some(c=>c.id===id))throw Error('الحساب غير موجود.');d.active=id;});}
  draft(){return this.active()?.sessions.find(s=>!s.ended)||null;}
  // A daily-plan step passes a short item list and its day; otherwise the whole skill or screen is used.
  start(mode,group,options={}){if(!this.active())throw Error('اختر حسابًا.');if(this.draft())throw Error('أكمل الجلسة الحالية أو أنهها أولًا.');
   const pool=this.bank.items.filter(i=>i.phase===mode&&(!group||i.group===group)).map(i=>i.id);
   const items=options.items?options.items.filter(id=>pool.includes(id)):pool;
   if(!['screen','practice'].includes(mode)||!items.length)throw Error('لا توجد مهام.');
   this.commit(d=>{const session={id:crypto.randomUUID(),mode,group:group||null,started:new Date().toISOString(),items,results:[],helped:false,selection:[],ended:false,complete:false};if(Number.isInteger(options.day))Object.assign(session,{day:options.day,step:options.step});d.children.find(c=>c.id===d.active).sessions.push(session);});return this.draft();
  }
  // Least-practised items first, so short daily sets move through the whole skill.
  nextPractice(group,count){const tally=new Map();for(const s of this.active()?.sessions||[])for(const r of s.results)tally.set(r.item,(tally.get(r.item)||0)+1);
   return this.bank.items.filter(i=>i.phase==='practice'&&i.group===group).map((i,order)=>({id:i.id,order,n:tally.get(i.id)||0})).sort((a,b)=>a.n-b.n||a.order-b.order).slice(0,count).map(x=>x.id);}
  program(){const p=this.active()?.program;return {done:{...p?.done},unlocked:{...p?.unlocked}};}
  markStep(day,step){this.commit(d=>{const c=d.children.find(c=>c.id===d.active);c.program||={done:{},unlocked:{}};c.program.done[day+':'+step]||=new Date().toISOString();});}
  unlockDay(day,open=true){this.commit(d=>{const c=d.children.find(c=>c.id===d.active);c.program||={done:{},unlocked:{}};if(open)c.program.unlocked[day]=true;else delete c.program.unlocked[day];});}
  recordGame(group,rounds,firstTry){this.commit(d=>{const c=d.children.find(c=>c.id===d.active);c.games||=[];c.games.push({group,at:new Date().toISOString(),rounds,firstTry});if(c.games.length>2000)c.games.splice(0,c.games.length-2000);});}
  // Picture cards are a cue: showing them records help for the current item.
  showPictures(){this.change(s=>{s.helped=true;s.pictures=true;});}
  change(fn){this.commit(d=>{const s=d.children.find(c=>c.id===d.active).sessions.find(s=>!s.ended);if(!s)throw Error('لا توجد جلسة نشطة.');fn(s);});}
  help(){this.change(s=>{s.helped=true;});}
  selectAnswer(key){const s=this.draft(),item=this.bank.items.find(i=>i.id===s?.items[s.results.length]);if(!item||!item.options.includes(key)||s.selection.length>=item.answer.length)return null;
   this.change(s=>{s.selection.push(key);});return this.draft().selection.length===item.answer.length?this.draft().selection.every((v,i)=>v===item.answer[i]):null;
  }
  retry(){this.change(s=>{s.helped=true;s.selection=[];});}
  score(outcome){if(!['independent','help','incorrect','skip'].includes(outcome))throw Error('نتيجة غير صالحة.');this.change(s=>{
   const item=this.bank.items.find(i=>i.id===s.items[s.results.length]);
   if(item.kind!=='observe'&&outcome==='independent'&&(s.selection.length!==item.answer.length||!s.selection.every((v,i)=>v===item.answer[i])))throw Error('أكمل الاستجابة أولًا.');
   if(outcome==='independent'&&s.helped)outcome='help';
   s.results.push({item:item.id,outcome,at:new Date().toISOString()});s.helped=false;s.delivered=false;s.pictures=false;s.selection=[];
   if(s.results.length===s.items.length){s.ended=true;s.complete=true;s.finished=new Date().toISOString();}
  });}
  finish(){this.change(s=>{s.ended=true;s.complete=false;s.finished=new Date().toISOString();});}
  passes(child=this.active()){return checked(child,this.bank);}
 }
 function cleanProfile(profile={},clearing=false){const out={};
  if('gender' in profile){const g=profile.gender||null;if(g!==null&&!GENDERS.includes(g))throw Error('الجنس غير صالح.');if(g!==null||clearing)out.gender=g;}
  if('birth' in profile){const b=profile.birth||null;if(b!==null&&!validBirth(b))throw Error('تاريخ الميلاد غير صالح.');if(b!==null||clearing)out.birth=b;}
  return out;}
 // Skills with all screening directions independent in the latest completed screen.
 function checked(child,bank){const s=child?.sessions.filter(s=>s.mode==='screen'&&s.complete).at(-1);
  return new Set(bank.groups.filter(g=>g.items.filter(i=>i.phase==='screen').every(i=>s?.results.some(r=>r.item===i.id&&r.outcome==='independent'))).map(g=>g.id));}
 // Age in whole months on a given day, or null without a birth date.
 function ageMonths(birth,on=new Date()){if(!birth)return null;const [y,m,d]=birth.split('-').map(Number);let months=(on.getFullYear()-y)*12+on.getMonth()+1-m;if(on.getDate()<d)months--;return Math.max(0,months);}
 // One child's figures for the comparison table. Rates are independent / assessed (skips excluded).
 function summary(child,bank,on=new Date()){
  const rate=list=>{const assessed=list.filter(r=>r.outcome!=='skip');return assessed.length?assessed.filter(r=>r.outcome==='independent').length/assessed.length:null;};
  const screen=child.sessions.filter(s=>s.mode==='screen'&&s.complete).at(-1),practice=child.sessions.filter(s=>s.mode==='practice').flatMap(s=>s.results);
  const times=[...child.sessions.flatMap(s=>[s.started,s.finished,...s.results.map(r=>r.at)]),...(child.games||[]).map(g=>g.at)].filter(Boolean).sort();
  return {age:ageMonths(child.birth,on),gender:child.gender||null,screened:!!screen,checked:checked(child,bank).size,screenRate:screen?rate(screen.results):null,practiceRate:rate(practice),practiced:practice.filter(r=>r.outcome!=='skip').length,games:(child.games||[]).length,last:times.at(-1)||null};
 }
 function counts(results=[]){return results.reduce((a,r)=>{a[r.outcome]++;return a;},{independent:0,help:0,incorrect:0,skip:0});}
 const api={Store,KEY,counts,validate,summary,ageMonths,GENDERS,isAdmin:admin};if(typeof module!=='undefined')module.exports=api;else root.FollowModel=api;
})(globalThis);
