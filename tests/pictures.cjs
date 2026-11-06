'use strict';
// Every spoken (observed) direction must have a picture card for each step.
const test=require('node:test'),assert=require('node:assert/strict');
const bank=require('../assets/bank.js'),P=require('../assets/pictures.js');
test('every observed direction is drawable step by step',()=>{
 const failures=[];
 for(const item of bank.items.filter(i=>i.kind==='observe')){
  try{const d=P.describe(item.prompt),cards=d.type==='steps'?d.steps:d.branches.flatMap(b=>[b.when,b.then]);
   assert.ok(cards.length>=1);for(const c of cards){assert.match(c.svg,/^<svg class="picture"/);assert.ok(c.text.length>1);}
   if(d.type==='steps')assert.equal(d.steps.length,item.prompt.split('ثم').length,item.prompt);
  }catch(e){failures.push(item.id+' '+item.prompt+' → '+e.message);}
 }
 assert.deepEqual(failures,[]);
});
test('conditions keep both branches and their own words',()=>{
 const d=P.describe('إذا كانت الكرة حمراء، صفّق. وإذا كانت زرقاء، لوّح.');
 assert.equal(d.type,'condition');assert.equal(d.branches.length,2);
 assert.equal(d.branches[1].when.text,'وإذا كانت زرقاء');assert.equal(d.branches[1].then.text,'لوّح');
});
