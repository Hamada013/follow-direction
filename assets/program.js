((root)=>{
 'use strict';
 // The daily plan: one skill per day, easiest first. Each day is a warm-up game, five practice
 // directions and the day's own game. No interface code here.
 const ORDER=['one','objects','attributes','quantity','function','space','two','order','play','condition','three'];
 const game=(group,warmup=false)=>({type:'game',group,warmup});
 const practice=group=>({type:'practice',group,count:5});
 const DAYS=[
  ...ORDER.map((group,day)=>day===0?[practice(group),game(group)]:[game(ORDER[day-1],true),practice(group),game(group)]),
  [game('order'),game('condition'),game('three')]
 ];
 const key=(day,step)=>day+':'+step;
 const isStepDone=(done,day,step)=>Boolean(done?.[key(day,step)]);
 const isDayDone=(done,day)=>DAYS[day].every((_,step)=>isStepDone(done,day,step));
 const dayFinishedAt=(done,day)=>isDayDone(done,day)?Math.max(...DAYS[day].map((_,step)=>Date.parse(done[key(day,step)]))):null;
 const sameDate=(a,b)=>new Date(a).toDateString()===new Date(b).toDateString();
 // One new day per calendar date on this device. An adult can open any day behind the parent gate.
 // Returns null when the day is open, otherwise why it is not: 'earlier' or 'tomorrow'.
 function lockReason(program,day,now=Date.now()){
  if(day===0||program.unlocked?.[day])return null;
  if(!isDayDone(program.done,day-1))return 'earlier';
  return sameDate(dayFinishedAt(program.done,day-1),now)?'tomorrow':null;
 }
 // The furthest day reached; a finished day moves the child to the next one.
 function currentDay(program){
  const reached=DAYS.map((steps,day)=>program.unlocked?.[day]||steps.some((_,step)=>isStepDone(program.done,day,step))?day:-1),furthest=Math.max(...reached);
  if(furthest<0)return 0;
  return isDayDone(program.done,furthest)?Math.min(furthest+1,DAYS.length-1):furthest;
 }
 const nextStep=(program,day)=>DAYS[day].findIndex((_,step)=>!isStepDone(program.done,day,step));
 const daysDone=program=>DAYS.filter((_,day)=>isDayDone(program.done,day)).length;
 const focus=day=>day<ORDER.length?ORDER[day]:null;
 const api={ORDER,DAYS,isStepDone,isDayDone,lockReason,currentDay,nextStep,daysDone,focus};
 if(typeof module!=='undefined')module.exports=api;else root.FollowProgram=api;
})(globalThis);
