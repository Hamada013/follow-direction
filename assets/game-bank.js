((root)=>{
 'use strict';
 // Mini-game rounds, one game per skill. Games practise the idea of the skill in play;
 // they are not scored as screening or practice. Every round has a numbered optional recording
 // (assets/audio/301.mp3 onwards) listed in assets/audio/MAPPING.txt.
 const PART={head:'رأس',nose:'أنف',tummy:'بطن',ear:'أذن',foot:'قدم',hand:'يد',mouth:'فم',eye:'عين'};
 const PRON={head:'رأسه',nose:'أنفه',tummy:'بطنه',ear:'أذنه',foot:'قدمه',hand:'يده',mouth:'فمه',eye:'عينه'};
 const OBJ={ball:'الكرة',cup:'الكوب',spoon:'الملعقة',car:'السيارة',bear:'الدب',box:'الصندوق',cat:'القطة',banana:'الموزة',apple:'التفاحة',chair:'الكرسي',shoe:'الحذاء',book:'الكتاب',hat:'القبعة',comb:'المشط',toothbrush:'فرشاة الأسنان',towel:'المنشفة',bed:'السرير',soap:'الصابونة',plate:'الطبق'};
 const PREP={in:'داخل',on:'فوق',under:'تحت',beside:'بجانب'};
 const COLOR={red:['الأحمر','#e07a6f'],blue:['الأزرق','#5f9fd1'],yellow:['الأصفر','#efc24f'],green:['الأخضر','#6fb391']};
 const PLACE={house:'البيت',tree:'الشجرة',flower:'الزهرة',pond:'البحيرة'};
 const NUM={apple:['تفاحة واحدة','تفاحتين','ثلاث تفاحات'],banana:['موزة واحدة','موزتين','ثلاث موزات']};
 const games=[
  {group:'one',type:'bear',title:'الدب يقول',rounds:['head','nose','tummy','ear','foot','hand','mouth','eye'].map(p=>({prompt:`المس ${PART[p]} الدب.`,steps:[{tap:p}]}))},
  {group:'objects',type:'find',title:'صندوق الألعاب',rounds:[['ball',['cup','ball','car','spoon']],['cup',['cup','bear','book','shoe']],['car',['apple','car','hat','ball']],['bear',['bear','spoon','cup','chair']],['shoe',['book','shoe','banana','car']],['hat',['hat','ball','apple','cup']],['book',['comb','car','book','bear']],['banana',['banana','shoe','spoon','hat']]].map(([t,o])=>({prompt:`المس ${OBJ[t]}.`,options:o,steps:[{tap:t}]}))},
  {group:'attributes',type:'balloons',title:'البالونات',rounds:[
   [['red','large'],[['red','large'],['blue','large'],['yellow','large'],['green','large']],'color'],
   [['blue','large'],[['red','large'],['blue','large'],['green','large'],['yellow','large']],'color'],
   [['yellow','large'],[['yellow','large'],['blue','large'],['red','large'],['green','large']],'color'],
   [['green','large'],[['red','large'],['yellow','large'],['green','large'],['blue','large']],'color'],
   [['blue','small'],[['blue','large'],['blue','small'],['blue','large'],['blue','large']],'size'],
   [['red','large'],[['red','small'],['red','small'],['red','large'],['red','small']],'size'],
   [['red','small'],[['red','large'],['red','small'],['blue','small'],['blue','large']],'both'],
   [['yellow','large'],[['yellow','small'],['green','large'],['yellow','large'],['green','small']],'both']
  ].map(([target,options,kind])=>{const [c,s]=target,size=s==='large'?'الكبير':'الصغير',words=kind==='color'?COLOR[c][0]:kind==='size'?size:`${COLOR[c][0]} ${size}`;return {prompt:`فرقع البالون ${words}.`,options:options.map(([color,size])=>({color,size})),steps:[{tap:options.findIndex(([a,b])=>a===c&&b===s)}]};})},
  {group:'quantity',type:'feed',title:'أطعم الدب',rounds:[['apple',1],['apple',2],['apple',3],['banana',1],['banana',2],['banana',3]].map(([fruit,n])=>({prompt:`أعطِ الدب ${NUM[fruit][n-1]}.`,fruit,steps:[{count:n}]}))},
  {group:'function',type:'need',title:'من يحتاج ماذا؟',rounds:[
   ['cup','أعطِ الدب شيئًا يشرب منه.',['cup','shoe','book']],['spoon','أعطِ الدب شيئًا يأكل به الحساء.',['hat','spoon','ball']],['bed','أعطِ الدب شيئًا ينام عليه.',['bed','cup','car']],['toothbrush','أعطِ الدب شيئًا ينظّف به أسنانه.',['comb','toothbrush','apple']],
   ['comb','أعطِ الدب شيئًا يمشّط به شعره.',['comb','spoon','book']],['towel','أعطِ الدب شيئًا ينشّف به يديه.',['ball','towel','cup']],['hat','أعطِ الدب شيئًا يلبسه على رأسه.',['shoe','banana','hat']],['chair','أعطِ الدب شيئًا يجلس عليه.',['chair','plate','car']]
  ].map(([t,prompt,options])=>({prompt,options,steps:[{give:t}]}))},
  {group:'space',type:'place',title:'أين تختبئ الكرة؟',rounds:[['ball','in','box'],['ball','on','chair'],['bear','under','chair'],['car','beside','box'],['bear','in','box'],['cup','on','box'],['ball','under','chair'],['car','on','chair']].map(([item,prep,ref])=>({prompt:`ضع ${OBJ[item]} ${PREP[prep]} ${OBJ[ref]}.`,item,ref,steps:[{place:item,prep}]}))},
  {group:'two',type:'bear',title:'الدب يقول مرتين',rounds:[['nose','tummy'],['head','foot'],['ear','hand'],['tummy','head'],['mouth','nose'],['foot','ear'],['hand','eye'],['eye','tummy']].map(([a,b])=>({prompt:`المس ${PART[a]} الدب، ثم ${PRON[b]}.`,steps:[{tap:a},{tap:b}]}))},
  {group:'order',type:'train',title:'القطار',rounds:[['cup','ball'],['bear','car'],['apple','shoe'],['book','hat'],['ball','bear'],['spoon','cup'],['car','apple'],['hat','book']].map(([a,b])=>{const others=['ball','cup','bear','car','apple','shoe','book','hat','spoon'].filter(x=>x!==a&&x!==b);return {prompt:`حمّل ${OBJ[a]} في القطار، ثم ${OBJ[b]}.`,options:[b,others[(a.length+b.length)%others.length],a,others[(a.length*3)%others.length]].filter((x,i,l)=>l.indexOf(x)===i),steps:[{tap:a},{tap:b}]};})},
  {group:'play',type:'playroom',title:'وقت اللعب',rounds:[
   [{place:'ball',prep:'in',ref:'box'},{tap:'cat'}],[{tap:'bear'},{place:'cup',prep:'on',ref:'chair'}],[{place:'car',prep:'beside',ref:'box'},{tap:'bear'}],[{tap:'cat'},{place:'ball',prep:'under',ref:'chair'}],
   [{place:'cup',prep:'in',ref:'box'},{tap:'bear'}],[{tap:'bear'},{place:'car',prep:'on',ref:'chair'}],[{place:'ball',prep:'on',ref:'box'},{tap:'cat'}],[{tap:'cat'},{place:'cup',prep:'beside',ref:'chair'}]
  ].map(steps=>({prompt:steps.map(s=>s.place?`ضع ${OBJ[s.place]} ${PREP[s.prep]} ${OBJ[s.ref]}`:`المس ${OBJ[s.tap]}`).join('، ثم ')+'.',refs:[...new Set(steps.filter(s=>s.place).map(s=>s.ref))],steps}))},
  {group:'condition',type:'signal',title:'إشارة المرور',rounds:[
   ['light','green','إذا كان الضوء أخضر، المس السيارة. وإذا كان أحمر، المس الدب.',{green:'car',red:'bear'}],
   ['light','red','إذا كان الضوء أخضر، المس السيارة. وإذا كان أحمر، المس الدب.',{green:'car',red:'bear'}],
   ['light','red','إذا كان الضوء أحمر، المس القطة. وإذا كان أخضر، المس الكرة.',{red:'cat',green:'ball'}],
   ['light','green','إذا كان الضوء أحمر، المس القطة. وإذا كان أخضر، المس الكرة.',{red:'cat',green:'ball'}],
   ['ball','blue','إذا كانت الكرة زرقاء، المس الكوب. وإذا كانت حمراء، المس الحذاء.',{blue:'cup',red:'shoe'}],
   ['ball','red','إذا كانت الكرة زرقاء، المس الكوب. وإذا كانت حمراء، المس الحذاء.',{blue:'cup',red:'shoe'}],
   ['catbox','in','إذا كانت القطة داخل الصندوق، المس الكرة. وإذا كانت خارجه، المس الكوب.',{in:'ball',out:'cup'}],
   ['catbox','out','إذا كانت القطة داخل الصندوق، المس الكرة. وإذا كانت خارجه، المس الكوب.',{in:'ball',out:'cup'}]
  ].map(([show,value,prompt,branches])=>({prompt,show,value,options:Object.values(branches),steps:[{tap:branches[value]}]}))},
  {group:'three',type:'trip',title:'رحلة السيارة',rounds:[['house','tree','flower'],['tree','pond','house'],['flower','house','pond'],['pond','flower','tree'],['house','pond','tree'],['tree','flower','pond'],['flower','tree','house'],['pond','house','flower']].map(stops=>({prompt:`سُق السيارة إلى ${PLACE[stops[0]]}، ثم ${PLACE[stops[1]]}، ثم ${PLACE[stops[2]]}.`,steps:stops.map(tap=>({tap}))}))}
 ];
 let audio=301;for(const game of games)for(const round of game.rounds)round.audio=String(audio++);
 const api={games,OBJ,COLOR,PLACE,PART,ROUNDS_PER_PLAY:5,byGroup:group=>games.find(g=>g.group===group)};
 if(typeof module!=='undefined')module.exports=api;else root.FollowGameBank=api;
})(globalThis);
