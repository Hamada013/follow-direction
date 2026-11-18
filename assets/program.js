((root)=>{
 'use strict';
 // The daily plan is a road of rounds. Round 1 walks every skill once, easiest first, then a review day.
 // Each later round repeats only the skills the child has not mastered yet, two days per skill, so the
 // child keeps practising until directions are followed independently. No interface code here.
 const ORDER=['one','objects','attributes','quantity','function','space','two','order','play','condition','three'];
 const COUNT=5;
 const game=(group,warmup=false)=>({type:'game',group,warmup});
 const practice=group=>({type:'practice',group,count:COUNT});
 const review=groups=>groups.slice(-3).map(g=>game(g));
 // Round 1, kept exactly as before so saved progress keeps its day numbers.
 const DAYS=[
  ...ORDER.map((group,day)=>day===0?[practice(group),game(group)]:[game(ORDER[day-1],true),practice(group),game(group)]),
  [game('order'),game('condition'),game('three')]
 ];
 // A later round: two days per skill (a warm-up game from the day before, practice, the skill's game),
 // then a review day of games.
 function roundDays(groups){
  const days=[];let previous=null;
  for(const group of groups)for(let rep=0;rep<2;rep++){days.push([...(previous?[game(previous,true)]:[]),practice(group),game(group)]);previous=group;}
  days.push(review(groups));
  return days;
 }
 // Every day of the road: {round, steps, focus}. Round numbers start at 1.
 function days(program){
  const out=DAYS.map((steps,i)=>({round:1,steps,focus:ORDER[i]||null}));
  (program?.rounds||[]).forEach((groups,r)=>{const list=roundDays(groups);list.forEach((steps,i)=>out.push({round:r+2,steps,focus:i<list.length-1?groups[Math.floor(i/2)]:null}));});
  return out;
 }
 const key=(day,step)=>day+':'+step;
 const isStepDone=(done,day,step)=>Boolean(done?.[key(day,step)]);
 const stepsOf=(program,day)=>days(program)[day]?.steps||[];
 const isDayDone=(program,day)=>{const s=stepsOf(program,day);return s.length>0&&s.every((_,step)=>isStepDone(program.done,day,step));};
 const dayFinishedAt=(program,day)=>isDayDone(program,day)?Math.max(...stepsOf(program,day).map((_,step)=>Date.parse(program.done[key(day,step)]))):null;
 const sameDate=(a,b)=>new Date(a).toDateString()===new Date(b).toDateString();
 // One new day per calendar date on this device. An adult can open any day behind the parent gate.
 // Returns null when the day is open, otherwise why it is not: 'earlier' or 'tomorrow'.
 function lockReason(program,day,now=Date.now()){
  if(day===0||program.unlocked?.[day])return null;
  if(!isDayDone(program,day-1))return 'earlier';
  return sameDate(dayFinishedAt(program,day-1),now)?'tomorrow':null;
 }
 // The furthest day reached; a finished day moves the child to the next one.
 function currentDay(program){
  const all=days(program),reached=all.map((d,day)=>program.unlocked?.[day]||d.steps.some((_,step)=>isStepDone(program.done,day,step))?day:-1),furthest=Math.max(...reached);
  if(furthest<0)return 0;
  return isDayDone(program,furthest)?Math.min(furthest+1,all.length-1):furthest;
 }
 const nextStep=(program,day)=>stepsOf(program,day).findIndex((_,step)=>!isStepDone(program.done,day,step));
 const daysDone=program=>days(program).filter((_,day)=>isDayDone(program,day)).length;
 const focus=(program,day)=>days(program)[day]?.focus??null;
 const roundCount=program=>1+(program?.rounds?.length||0);
 const roundOf=(program,day)=>days(program)[day]?.round||1;
 // Day indexes of one round: [first, last+1).
 function roundRange(program,round){const all=days(program),first=all.findIndex(d=>d.round===round);return [first,first+all.filter(d=>d.round===round).length];}
 const roundDone=program=>{const all=days(program);return isDayDone(program,all.length-1);};
 // The skills the next round should repeat, in road order, or [] when every skill is mastered.
 const nextRound=(program,mastered)=>roundDone(program)?ORDER.filter(g=>!mastered.has(g)):null;
 const api={ORDER,DAYS,COUNT,days,roundDays,isStepDone,isDayDone,lockReason,currentDay,nextStep,daysDone,focus,roundCount,roundOf,roundRange,roundDone,nextRound};
 if(typeof module!=='undefined')module.exports=api;else root.FollowProgram=api;
})(globalThis);
