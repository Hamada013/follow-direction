'use strict';
// The goal bank, its estimates and the plan stored with each child.
const test=require('node:test'),assert=require('node:assert/strict');
const bank=require('../assets/bank.js'),G=require('../assets/intervention-goals.js'),M=require('../assets/model.js');
const session=(group,day,outcomes)=>{const items=bank.items.filter(i=>i.phase==='practice'&&i.group===group).slice(0,outcomes.length).map(i=>i.id),at=`2026-11-${day}T10:00:00.000Z`;
 return {id:group+day,mode:'practice',group,started:at,finished:at,items,results:items.map((item,i)=>({item,outcome:outcomes[i],at})),helped:false,selection:[],ended:true,complete:true};};
test('every ready plan and every measured goal is in the bank, and every measured goal has directions',()=>{
 for(const plan of G.PLANS)for(const id of plan.goals)assert.ok(G.short(id),id);
 assert.deepEqual(G.PLANS.map(p=>p.title),['بداية','متوسط','متقدم']);
 for(const [id,counts]of Object.entries(G.MEASURES)){assert.ok(G.short(id),id);assert.ok(bank.items.some(i=>counts({group:i.group,prompt:i.prompt})),id+' has no directions');}
});
test('estimates build up per session and use the app rule: 8 of the last 10 independent on two days',()=>{
 const I='independent',H='help';
 const one=G.estimate({sessions:[session('one','20',[I,I,I,I,I,I,I,I,I,I,I,I])]});
 assert.equal(one['S1.1'].percent,100);assert.equal(one['S1.1'].achieved,null,'one day is not enough');
 const two=G.estimate({sessions:[session('one','20',Array(12).fill(I)),session('one','21',Array(12).fill(H))]});
 assert.equal(two['S1.1'].percent,50,'falls back halfway');assert.equal(two['S1.1'].achieved,null);
 const done=G.estimate({sessions:[session('one','20',Array(12).fill(I)),session('one','21',Array(12).fill(I))]});
 assert.ok(done['S1.1'].achieved&&done['S1.2'].achieved);
 assert.equal(done['S2.1'],undefined,'goals without answers stay unrated');
 assert.equal(G.estimate({sessions:[session('one','20',Array(12).fill('skip'))]})['S1.1'],undefined,'skips do not count');
});
test('suggested goals follow an achieved goal in the same long-term goal',()=>{
 assert.deepEqual(G.suggest(['S1.1','S1.2'],['S1.1']),['S1.3']);
 assert.deepEqual(G.suggest(['S1.1'],[]),[]);
});
test('the plan is saved with the active child and checked',()=>{
 const mem=new Map(),storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,String(v))};
 const store=new M.Store(storage,bank);store.signIn('سما');assert.equal(store.intervention(),null);
 assert.equal(store.saveIntervention({childName:'سما',goals:[{id:'S1.1',rating:60,history:[{date:'2026-11-24',rating:60}]}]}),true);
 assert.equal(new M.Store(storage,bank).intervention().goals[0].rating,60);
 assert.equal(store.saveIntervention({goals:[{id:'S1.1',rating:55}]}),false,'only 20/40/60/80 ratings');
 store.signIn('علي');assert.equal(store.intervention(),null,'each child has their own plan');
});
