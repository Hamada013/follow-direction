'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../assets/program.js'),bank=require('../assets/bank.js'),GB=require('../assets/game-bank.js'),M=require('../assets/model.js');
test('every skill has a day, a game and five practice directions',()=>{
 assert.equal(P.DAYS.length,12);assert.deepEqual([...P.ORDER].sort(),bank.groups.map(g=>g.id).sort());
 for(const g of bank.groups){assert.ok(GB.byGroup(g.id),g.id);assert.ok(GB.byGroup(g.id).rounds.length>=GB.ROUNDS_PER_PLAY);}
 for(const day of P.DAYS)for(const s of day)assert.ok(bank.groups.some(g=>g.id===s.group));
 const audio=GB.games.flatMap(g=>g.rounds.map(r=>Number(r.audio)));assert.equal(new Set(audio).size,audio.length);assert.ok(Math.min(...audio)>Math.max(...bank.items.map(i=>Number(i.audio))));
});
test('one new day per date, and an adult can open a day early',()=>{
 const yesterday=new Date(Date.now()-864e5).toISOString(),now=new Date().toISOString(),done=(day,at)=>Object.fromEntries(P.DAYS[day].map((_,i)=>[day+':'+i,at]));
 assert.equal(P.lockReason({done:{},unlocked:{}},0),null);assert.equal(P.lockReason({done:{},unlocked:{}},1),'earlier');
 assert.equal(P.lockReason({done:done(0,now),unlocked:{}},1),'tomorrow');assert.equal(P.lockReason({done:done(0,yesterday),unlocked:{}},1),null);
 assert.equal(P.lockReason({done:{},unlocked:{3:true}},3),null);assert.equal(P.currentDay({done:done(0,now),unlocked:{}}),1);
});
test('daily practice uses least-practised items, brings back helped ones, and pictures count as help',()=>{
 const mem=new Map(),storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)},store=new M.Store(storage,bank);store.signIn('أ');
 const first=store.nextPractice('one',5);assert.equal(first.length,5);store.start('practice','one',{items:first,day:0,step:0});
 store.showPictures();store.score('independent');assert.equal(store.draft().results[0].outcome,'help');for(let i=0;i<4;i++)store.score('independent');
 assert.equal(store.active().sessions[0].day,0);assert.deepEqual(store.nextPractice('one',5).filter(id=>first.includes(id)),[first[0]],'only the helped item returns');
 store.markStep(0,0);store.recordGame('one',5,4);assert.ok(store.program().done['0:0']);assert.equal(store.active().games[0].firstTry,4);
 assert.doesNotThrow(()=>M.validate(JSON.parse(mem.get(M.KEY)),bank));
});
test('later rounds repeat only unmastered skills, two days each, then a review day',()=>{
 const program={done:{},unlocked:{},rounds:[['two','three']]},all=P.days(program);
 assert.equal(all.length,12+5);assert.equal(P.roundCount(program),2);assert.deepEqual(P.roundRange(program,2),[12,17]);
 assert.deepEqual(all.slice(12,16).map(d=>d.focus),['two','two','three','three']);assert.equal(all[16].focus,null);
 assert.ok(all[13].steps[0].warmup);assert.equal(P.nextRound(program,new Set()),null);
 const done=Object.fromEntries(all.flatMap((d,day)=>d.steps.map((_,i)=>[day+':'+i,new Date(0).toISOString()])));
 assert.deepEqual(P.nextRound({...program,done},new Set(['two'])),P.ORDER.filter(g=>g!=='two'));
 assert.deepEqual(P.nextRound({...program,done},new Set(P.ORDER)),[]);
});
test('mastery needs 8 of the last 10 independent on two days; support fades; missed items return',()=>{
 const mem=new Map(),storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)},store=new M.Store(storage,bank);store.signIn('ب');
 assert.equal(store.support('one'),'delay');
 const run=(outcomes)=>{store.start('practice','one',{items:store.nextPractice('one',outcomes.length),support:store.support('one')});for(const o of outcomes)store.score(o);};
 run(['incorrect','incorrect','incorrect','help','incorrect']);assert.equal(store.support('one'),'pictures');
 const missed=store.active().sessions[0].results.filter(r=>r.outcome!=='independent').map(r=>r.item);
 const next=store.nextPractice('one',5);assert.equal(next.filter(id=>missed.includes(id)).length,2);
 run(['independent','independent','independent','independent','independent']);assert.equal(store.support('one'),'none');
 run(['independent','independent','independent','independent','independent']);assert.ok(!store.mastered().has('one'),'same day only');
 const d=JSON.parse(mem.get(M.KEY));d.children[0].sessions.at(-1).results.forEach(r=>{r.at='2020-01-01T10:00:00.000Z';});mem.set(M.KEY,JSON.stringify(d));
 const again=new M.Store(storage,bank);assert.ok(again.mastered().has('one'));
 again.startRound(['two']);assert.deepEqual(again.program().rounds,[['two']]);assert.doesNotThrow(()=>M.validate(JSON.parse(mem.get(M.KEY)),bank));
 assert.equal(again.active().sessions[0].support,'delay');
});
