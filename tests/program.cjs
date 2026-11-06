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
test('daily practice uses least-practised items and pictures count as help',()=>{
 const mem=new Map(),storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)},store=new M.Store(storage,bank);store.signIn('أ');
 const first=store.nextPractice('one',5);assert.equal(first.length,5);store.start('practice','one',{items:first,day:0,step:0});
 store.showPictures();store.score('independent');assert.equal(store.draft().results[0].outcome,'help');for(let i=0;i<4;i++)store.score('independent');
 assert.equal(store.active().sessions[0].day,0);assert.deepEqual(store.nextPractice('one',5).filter(id=>first.includes(id)),[]);
 store.markStep(0,0);store.recordGame('one',5,4);assert.ok(store.program().done['0:0']);assert.equal(store.active().games[0].firstTry,4);
 assert.doesNotThrow(()=>M.validate(JSON.parse(mem.get(M.KEY)),bank));
});
