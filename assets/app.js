(()=>{
 'use strict';
 const B=FollowBank,M=FollowModel,PR=FollowProgram,PIC=FollowPictures,GB=FollowGameBank,$=s=>document.querySelector(s),app=$('#app');
 const paths={home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',chart:'<path d="M4 3v18h18M8 16v-5m5 5V6m5 10V9"/>',check:'<path d="m5 12 4 4L20 5"/>',cross:'<path d="m6 6 12 12M18 6 6 18"/>',help:'<path d="M8 9V5a2 2 0 0 1 4 0v7-3a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v6c0 6-11 6-13 1l-4-6a2 2 0 0 1 3-2l2 2Z"/>',skip:'<path d="m5 5 10 7L5 19ZM19 5v14"/>',play:'<path d="m8 4 13 8-13 8Z"/>',ear:'<path d="M6 10C6-1 22 0 20 10c-1 5-6 4-6 9-1 5-7 3-7 0m3-9c0-6 7-5 6 0-1 3-3 2-3 5"/>',screen:'<path d="M9 4h11v18H4V4h5m0-2h6v4H9ZM8 11l1 1 2-3m3 2h3M8 17l1 1 2-3m3 2h3"/>',flag:'<path d="M5 22V3c5-4 9 4 16 0v12c-7 4-11-4-16 0"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M3 17v5h18v-5"/>',upload:'<path d="M12 17V5m-5 5 5-5 5 5M3 17v5h18v-5"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',back:'<path d="M5 12h15m-6-6 6 6-6 6"/>',repeat:'<path d="M4 8a9 9 0 1 1-1 9M4 2v6h6"/>',print:'<path d="M6 8V2h12v6M6 18H2V8h20v10h-4M6 14h12v8H6Z"/>',save:'<path d="M4 2h14l4 4v16H2V2Zm3 0v7h10V2M7 22v-8h10v8"/>',book:'<path d="M12 5C8 1 2 3 2 3v17s6-2 10 2c4-4 10-2 10-2V3s-6-2-10 2Zm0 0v17"/>',
  star:'<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9Z"/>',road:'<path d="M9 3c-6 4 6 6 0 9s6 6 0 9M15 3c6 4-6 6 0 9s-6 6 0 9"/>',game:'<rect x="2" y="7" width="20" height="11" rx="5.5"/><path d="M7 10v5m-2.5-2.5h5M16 11h.01M18 14h.01"/>',picture:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',moon:'<path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'};
 const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.play}</svg>`;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=x=>{const d=new Date(x);return Number.isFinite(+d)?d.toLocaleString('ar-SY'):'';};
 const shortDate=x=>{const d=new Date(x);return Number.isFinite(+d)?d.toLocaleDateString('ar-SY',{day:'numeric',month:'short'}):'';};
 const num=n=>Number(n).toLocaleString('ar-SY');
 const label=group=>B.groups.find(g=>g.id===group)?.label||'';
 const celebrated=new Set();let store,view='home',reportId=null,audio=null,toastTimer,dayView=0,gameCtx=null,gameHandle=null;
 function alert(message){$('#status').textContent=message;$('#status').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('#status').hidden=true;},9000);}
 function run(fn){try{return fn();}catch(e){alert(e.message||'تعذّر حفظ التقدم.');return null;}}
 function button(name,text,fn,cls=''){const b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',text);b.title=text;b.innerHTML=icon(name);b.onclick=fn;return b;}
 function stop(){if(audio){audio.pause();audio=null;}gameHandle?.stop();gameHandle=null;}
 function showModal(title,html,actions=[]){$('#modal-title').textContent=title;$('#modal-body').innerHTML=html;const row=document.createElement('div');row.className='dialog-actions';for(const [text,fn]of actions){const b=document.createElement('button');b.className='primary';b.textContent=text;b.onclick=()=>{$('#modal').close();fn();};row.append(b);}$('#modal-body').append(row);$('#modal').showModal();}
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
 function toolbar(){const t=$('#toolbar');t.replaceChildren();t.append(button('home','الرئيسية',()=>go('home')),button('user','حساب الطفل',profiles),button('chart','التقرير',()=>needAccount(()=>{reportId=null;go('report');})),button('info','دليل الأهل',guide),button('download','تنزيل للاستخدام دون إنترنت',()=>window.FollowOffline?.open()));}
 function needAccount(fn){if(store.active())fn();else profiles();}
 function go(next){stop();view=next;render();app.focus({preventScroll:true});window.scrollTo(0,0);}
 function render(){toolbar();if(!store.active()){home();return;}({task,practice,report,road,day,games,game}[view]||home)();}

 // ---------- Dashboard ----------
 function today(){const program=store.program(),day=PR.currentDay(program),lock=PR.lockReason(program,day),finished=PR.isDayDone(program.done,PR.DAYS.length-1);return {program,day,lock,finished,next:PR.nextStep(program,day)};}
 const stepTitle=s=>s.type==='game'?GB.byGroup(s.group).title:`تدريب · ${label(s.group)}`;
 const stepIcon=s=>s.type==='game'?'game':'ear';
 function dayName(day){return day<PR.ORDER.length?label(PR.focus(day)):'يوم الاحتفال';}
 function home(){const child=store.active(),draft=child&&store.draft();
  app.innerHTML=`<section class="hero dash-hero"><img src="assets/logo.webp" alt="" width="164" height="164"><h1>اتبع التعليمات</h1><p>${child?'مرحبًا، '+esc(child.name):'Follow Direction'}</p></section><div class="today-slot"></div><div class="actions"></div>`;
  if(child)todayCard(app.querySelector('.today-slot'),draft);
  const grid=app.querySelector('.actions'),card=(i,text,fn)=>{const b=button(i,text,()=>needAccount(fn),'action');b.insertAdjacentHTML('beforeend',`<span>${text}</span>`);grid.append(b);};
  card(draft?'play':'screen',draft?'متابعة الجلسة':'الفرز',()=>{if(store.draft())go('task');else confirmStart('screen');});
  card('road','الطريق',()=>go('road'));card('game','الألعاب',()=>go('games'));card('ear','التدريب',()=>go('practice'));
 }
 function todayCard(host,draft){const t=today(),done=PR.daysDone(t.program);
  const section=document.createElement('section');section.className='card today';
  const head=`<div class="today-head"><span class="day-badge">${t.finished?icon('star'):num(t.day+1)}</span><div><p class="muted">${t.finished?'أكملت الطريق':`تمرين اليوم ${num(t.day+1)} من ${num(PR.DAYS.length)}`}</p><h2>${esc(t.finished?'أحسنت! يمكنك اللعب متى شئت':dayName(t.day))}</h2></div><div class="mini-road" role="img" aria-label="أيام مكتملة: ${done} من ${PR.DAYS.length}">${PR.DAYS.map((_,d)=>`<i class="${PR.isDayDone(t.program.done,d)?'done':d===t.day?'now':''}"></i>`).join('')}</div></div>`;
  if(t.finished){section.innerHTML=head;host.append(section);return;}
  if(t.lock==='tomorrow'){section.innerHTML=head+`<p class="rest">${icon('moon')}<span>أحسنت اليوم! التمرين التالي يُفتح غدًا. يمكنك اللعب بالألعاب الآن.</span></p>`;host.append(section);return;}
  section.innerHTML=head+`<ol class="today-steps">${PR.DAYS[t.day].map((s,i)=>`<li class="${PR.isStepDone(t.program.done,t.day,i)?'done':i===t.next?'now':''}">${icon(PR.isStepDone(t.program.done,t.day,i)?'check':stepIcon(s))}<span>${esc(stepTitle(s))}</span></li>`).join('')}</ol>`;
  const start=button('play',t.next>0?'تابع تمرين اليوم':'ابدأ تمرين اليوم',()=>runStep(t.day,t.next),'primary big start');start.insertAdjacentHTML('beforeend',`<span>${t.next>0?'تابع تمرين اليوم':'ابدأ تمرين اليوم'}</span>`);section.append(start);host.append(section);
 }
 function confirmStart(mode,group){if(store.draft()){showModal('جلسة محفوظة','<p>تابع الجلسة الحالية أو أنهها قبل بدء جلسة جديدة.</p>',[['متابعة',()=>go('task')],['إنهاء الجلسة',endSession]]);return;}
  if(mode==='screen')showModal('الفرز','<p>٣٣ مهمة قصيرة. يمكنك التوقف والمتابعة لاحقًا. لا تستخدم نموذجًا أو تلميحًا أو بطاقات مصوّرة عند تسجيل الاستجابة المستقلة.</p>',[['ابدأ',()=>start(mode,group)]]);
  else if(store.passes().has(group))showModal('تم التحقق في الفرز','<p>هذه المهارة محددة للتجاوز. هل تريد إعادة تدريبها؟</p>',[['تدريبها',()=>start(mode,group)]]);else start(mode,group);
 }
 function start(mode,group,options){if(run(()=>store.start(mode,group,options)))go('task');}

 // ---------- Road and days ----------
 function runStep(day,i){const s=PR.DAYS[day][i];if(!s)return;
  if(s.type==='game'){gameCtx={group:s.group,day,step:i};go('game');return;}
  if(store.draft()){showModal('جلسة محفوظة','<p>تابع الجلسة الحالية أو أنهها قبل بدء تدريب اليوم.</p>',[['متابعة',()=>go('task')],['إنهاء الجلسة',endSession]]);return;}
  start('practice',s.group,{items:store.nextPractice(s.group,s.count),day,step:i});
 }
 function openDay(d){const program=store.program(),lock=PR.lockReason(program,d);
  if(lock==='earlier'){showModal(`اليوم ${num(d+1)}`,'<p>أكمل الأيام السابقة أولًا.</p>',[['فتح اليوم (للأهل)',()=>adultOpen(d)]]);return;}
  if(lock==='tomorrow'){showModal(`اليوم ${num(d+1)}`,'<p>يُفتح يوم جديد كل يوم. عُد غدًا، أو افتحه الآن بإذن الأهل.</p>',[['فتح اليوم (للأهل)',()=>adultOpen(d)]]);return;}
  dayView=d;go('day');
 }
 async function adultOpen(d){if(!(await ChildAccountGate.request()))return;if(run(()=>store.unlockDay(d))!==null){dayView=d;go('day');}}
 function road(){const program=store.program(),current=PR.currentDay(program),child=store.active();
  app.innerHTML=`<div class="section-heading"><h1>الطريق</h1><p class="muted">${num(PR.daysDone(program))} من ${num(PR.DAYS.length)} أيام</p></div><div class="road" role="group" aria-label="أيام الطريق"></div>`;
  const host=app.querySelector('.road'),xs=[30,62,78,50,22,38],points=PR.DAYS.map((_,d)=>[xs[d%xs.length],80+d*100]),height=points.at(-1)[1]+80;
  host.style.height=height+'px';
  host.innerHTML=`<svg class="road-line" viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true"><path d="${points.map(([x,y],i)=>i?`C${points[i-1][0]} ${points[i-1][1]+55} ${x} ${y-55} ${x} ${y}`:`M${x} ${y}`).join(' ')}"/></svg>`;
  PR.DAYS.forEach((_,d)=>{const done=PR.isDayDone(program.done,d),lock=PR.lockReason(program,d),[x,y]=points[d];
   const b=document.createElement('button');b.type='button';b.className='station'+(done?' done':'')+(d===current?' now':'')+(lock?' locked':'');
   b.setAttribute('aria-label',`اليوم ${d+1}: ${dayName(d)}${done?'، مكتمل':lock?'، مقفل':d===current?'، اليوم الحالي':''}`);b.style.left=x+'%';b.style.top=y+'px';
   b.innerHTML=`<span class="dot">${done?icon('star'):lock?icon('lock'):`<b>${num(d+1)}</b>`}</span><span class="station-label">${esc(dayName(d))}</span>`;b.onclick=()=>openDay(d);host.append(b);
   if(d===current&&child){const pin=document.createElement('span');pin.className='pin';pin.setAttribute('aria-hidden','true');const avatar=SuiteAccounts.badge?.(child);if(avatar)pin.append(avatar);b.append(pin);}
  });
  host.querySelector('.now')?.scrollIntoView({block:'center'});
 }
 function day(){const program=store.program(),d=dayView,next=PR.nextStep(program,d),lock=PR.lockReason(program,d);
  app.innerHTML=`<div class="section-heading"><h1>اليوم ${num(d+1)}</h1></div><p class="muted day-sub">${esc(dayName(d))}</p><div class="day-steps"></div>`;
  const host=app.querySelector('.day-steps');
  PR.DAYS[d].forEach((s,i)=>{const done=PR.isStepDone(program.done,d,i),open=!lock&&(done||i===next);
   const b=button(done?'check':stepIcon(s),`${stepTitle(s)}${done?'، مكتمل':open?'':'، بعد الخطوة السابقة'}`,()=>runStep(d,i),'day-step'+(done?' done':'')+(i===next?' now':''));b.disabled=!open;
   b.insertAdjacentHTML('beforeend',`<span><b>${esc(stepTitle(s))}</b><small>${s.type==='game'?(s.warmup?'لعبة تسخين':'لعبة اليوم'):'خمس تعليمات قصيرة'}</small></span>`);host.append(b);});
  if(program.unlocked[d]&&!PR.DAYS[d].some((_,i)=>PR.isStepDone(program.done,d,i))){const relock=button('lock','إقفال هذا اليوم مرة أخرى',()=>run(()=>{store.unlockDay(d,false);go('road');}),'ghost');relock.insertAdjacentHTML('beforeend','<span>إقفال هذا اليوم مرة أخرى</span>');app.append(relock);}
 }

 // ---------- Games ----------
 function games(){app.innerHTML='<div class="section-heading"><h1>الألعاب</h1></div><div class="game-grid"></div>';const grid=app.querySelector('.game-grid'),played=store.active().games||[];
  for(const g of GB.games){const count=played.filter(p=>p.group===g.group).length,b=button('game',`${g.title} · ${label(g.group)}`,()=>{gameCtx={group:g.group};go('game');},'game-card');
   b.innerHTML=`${gameArt(g.type)}<b>${esc(g.title)}</b><small>${esc(label(g.group))}</small>${count?`<span class="plays" aria-hidden="true">${icon('star')}${num(count)}</span>`:''}`;grid.append(b);}
 }
 function gameArt(type){const a=(k,c)=>PIC.art(k,c),n=PIC.nest,body={bear:n(a('bear'),15,15,70),find:n(a('ball'),6,40,40)+n(a('cup'),54,40,40),balloons:'<ellipse cx="35" cy="40" rx="18" ry="22" fill="#e07a6f"/><ellipse cx="66" cy="36" rx="14" ry="17" fill="#5f9fd1"/><path d="M35 62q-3 12 2 26M66 53q4 14-2 30"/>',feed:n(a('plate'),20,40,60)+n(a('apple'),36,30,30),need:n(a('bear'),4,24,52)+n(a('cup'),58,40,38),place:n(a('box'),26,34,58)+n(a('ball'),40,8,26),train:'<path d="M6 66V40h24V28h10v12h10l10 16v10Zm58-20h30v20H64Z" fill="#e07a6f"/><circle cx="18" cy="72" r="6" fill="#6c8290"/><circle cx="48" cy="72" r="6" fill="#6c8290"/><circle cx="78" cy="72" r="6" fill="#6c8290"/>',playroom:n(a('chair'),46,22,52)+n(a('cat'),4,44,44),signal:'<rect x="34" y="8" width="32" height="74" rx="12" fill="#5c7285"/><circle cx="50" cy="28" r="10" fill="#e07a6f"/><circle cx="50" cy="60" r="10" fill="#6fb391"/>',trip:'<path d="M14 80C30 40 70 70 86 20" stroke-dasharray="6 6"/>'+n('<path d="M18 50 50 20l32 30v34H18Z" fill="#f2c9a5"/>',2,52,36)+n('<circle cx="50" cy="40" r="26" fill="#94c4a1"/><path d="M46 86V62h8v24Z" fill="#b48a62"/>',64,2,36)}[type];return `<svg class="game-art" viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;}
 function game(){const ctx=gameCtx;if(!ctx){go('games');return;}
  const back=()=>{if(Number.isInteger(ctx.day))celebrate(ctx.day);else go('games');};
  gameHandle=FollowGames.play({host:app,group:ctx.group,icon,media:window.FollowMedia||[],label:alert,
   onFinish:({rounds,firstTry})=>run(()=>{store.recordGame(ctx.group,rounds,firstTry);if(Number.isInteger(ctx.day))store.markStep(ctx.day,ctx.step);}),onExit:back});
 }

 // ---------- Practice and tasks ----------
 function practice(){const passed=store.passes();app.innerHTML='<div class="section-heading"><h1>التدريب</h1></div><div class="skills"></div>';const grid=app.querySelector('.skills');for(const g of B.groups){const done=passed.has(g.id),b=button(done?'check':'ear',`${g.label}${done?'، تم التحقق في الفرز، إعادة التدريب':''}`,()=>confirmStart('practice',g.id),`skill${done?' passed':''}`);if(done)b.querySelector('svg').classList.add('check');b.insertAdjacentHTML('beforeend',`<span>${esc(g.label)}</span>`);grid.append(b);}}
 function objectArt(key){const o=B.objects[key];if(o){const src=`assets/images/${o.image}.webp`;if(window.FollowMedia?.includes(src))return `<img src="${src}" alt="" width="140" height="140">`;return `<svg viewBox="0 0 100 100" aria-hidden="true">${o.drawing}</svg>`;}
  if(key.startsWith('count-')){const [,number,object]=key.split('-'),n=Number(number);
   if(object&&B.objects[object])return `<svg viewBox="0 0 100 100" aria-hidden="true">${Array.from({length:n},(_,i)=>`<svg x="${(100-n*30)/2+i*30}" y="35" width="30" height="30" viewBox="0 0 100 100">${B.objects[object].drawing}</svg>`).join('')}</svg>`;
   return `<svg viewBox="0 0 100 100" aria-hidden="true">${Array.from({length:n},(_,i)=>`<circle cx="${n===1?50:20+i*60/(n-1)}" cy="50" r="${n===1?22:13}" fill="#e7ba61"/>`).join('')}</svg>`;
  }
  const tokens=key.split('-'),color=({red:'#c97c7c',blue:'#6299c4',yellow:'#e1b74d',green:'#79a998'})[tokens[0]]||'#79a998',size=tokens.includes('small')?18:33;
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${key.endsWith('circle')?`<circle cx="50" cy="50" r="${size}" fill="${color}"/>`:`<rect x="${50-size}" y="${50-size}" width="${size*2}" height="${size*2}" rx="4" fill="${color}"/>`}</svg>`;
 }
 function objectLabel(key){if(B.objects[key])return B.objects[key].label;
  if(key.startsWith('count-')&&key.split('-')[2]){const [,n,object]=key.split('-');return `${B.objects[object]?.label||object}، العدد ${n}`;}
  if(/-(circle|square)$/.test(key)){const tokens=key.split('-'),circle=tokens.at(-1)==='circle',color=({red:['حمراء','أحمر'],blue:['زرقاء','أزرق'],yellow:['صفراء','أصفر'],green:['خضراء','أخضر']})[tokens[0]]?.[circle?0:1],size=tokens.includes('small')?(circle?'صغيرة':'صغير'):tokens.includes('large')?(circle?'كبيرة':'كبير'):'';return [circle?'دائرة':'مربع',color,size].filter(Boolean).join(' ');}
  const names={'count-1':'كرة واحدة','count-2':'كرتان','count-3':'ثلاث كرات','red-circle':'دائرة حمراء','blue-circle':'دائرة زرقاء','yellow-circle':'دائرة صفراء','red-square':'مربع أحمر','blue-square':'مربع أزرق','yellow-square':'مربع أصفر','small-circle':'دائرة صغيرة','large-circle':'دائرة كبيرة','small-square':'مربع صغير','large-square':'مربع كبير'};return names[key]||key;}
 // Numbered picture cards, first step on the right; "if" directions show each branch as a row.
 function pictureStrip(item){const d=PIC.describe(item.prompt),card=(c,n)=>`<figure class="pic-card">${n?`<span class="pic-n">${num(n)}</span>`:''}${c.svg}<figcaption>${esc(c.text)}</figcaption></figure>`;
  if(d.type==='steps')return `<div class="pictures" aria-label="بطاقات مصوّرة">${d.steps.map((s,i)=>card(s,d.steps.length>1?i+1:0)).join(`<span class="pic-then" aria-hidden="true">${icon('back')}</span>`)}</div>`;
  return `<div class="pictures branches" aria-label="بطاقات مصوّرة">${d.branches.map(b=>`<div class="branch">${card(b.when)}<span class="pic-then" aria-hidden="true">${icon('back')}</span>${card(b.then)}</div>`).join('')}</div>`;}
 function task(){const s=store.draft();if(!s){reportId=store.active().sessions.at(-1)?.id;view='report';report();return;}const item=B.items.find(i=>i.id===s.items[s.results.length]),g=B.groups.find(g=>g.id===item.group),choice=item.kind!=='observe';
  const where=Number.isInteger(s.day)?`اليوم ${num(s.day+1)} · ${esc(g.label)}`:`${s.mode==='screen'?'الفرز':'التدريب'} · ${esc(g.label)}`;
  app.innerHTML=`<section class="card task"><div class="task-top"><p>${where}</p><span>${s.results.length+1} / ${s.items.length}</span></div><progress class="task-progress" value="${s.results.length}" max="${s.items.length}" aria-label="تقدم الجلسة"></progress><h2>${esc(item.prompt)}</h2>${!choice&&s.pictures?pictureStrip(item):''}<div class="${choice?'options':'observe-art'}">${choice||s.pictures?'':icon('ear')}</div><div class="result-mark" role="status"></div><div class="task-controls"></div><p class="help-state">${s.pictures?'عُرضت بطاقات مصوّرة: تُسجَّل مساعدة':s.helped?'تم تسجيل تكرار أو مساعدة':''}</p><div class="ratings" aria-label="تسجيل استجابة الطفل"></div></section>`;
  const controls=app.querySelector('.task-controls'),ratings=app.querySelector('.ratings');
  controls.append(button('play','تشغيل التعليمات',()=>play(item)),button('repeat','تكرار أو إعادة المحاولة (مساعدة)',()=>{if(run(()=>store.retry())!==null)task();}));
  if(!choice&&!s.pictures)controls.append(button('picture','عرض بطاقات مصوّرة (مساعدة)',()=>{if(run(()=>store.showPictures())!==null)task();}));
  controls.append(button('book','تجهيز المهمة',()=>showModal('تجهيز المهمة',`<p>${esc(item.setup||(choice?'اعرض الخيارات واقرأ التعليمات دون الإشارة إلى الجواب.':'نفّذ أمام الطفل فقط في التدريب؛ سجّل أي نموذج أو تكييف كمساعدة.'))}</p>`)),button('flag','إنهاء الجلسة',endSession));
  if(choice){const options=app.querySelector('.options');for(const key of item.options){const b=document.createElement('button');b.className='option'+(s.selection.includes(key)?' selected':'');b.setAttribute('aria-label',objectLabel(key));b.innerHTML=objectArt(key);const indexes=s.selection.map((v,i)=>v===key?i+1:0).filter(Boolean);if(indexes.length)b.insertAdjacentHTML('beforeend',`<span class="step">${indexes.join('،')}</span>`);b.disabled=s.selection.length>=item.answer.length;b.onclick=()=>{run(()=>{store.selectAnswer(key);task();});};options.append(b);}
   if(s.selection.length===item.answer.length){const correct=s.selection.every((v,i)=>v===item.answer[i]);const mark=app.querySelector('.result-mark');mark.dataset.correct=correct;mark.innerHTML=icon(correct?'check':'cross');mark.setAttribute('aria-label',correct?'استجابة مطابقة':'استجابة غير مطابقة');
    // Incorrect first choices remain incorrect even after retry. Retry marks help.
    const score=correct?(s.helped?'help':'independent'):'incorrect';const b=button('back','تسجيل والمتابعة',()=>scoreItem(score));b.className='primary';ratings.append(b);
   }
   ratings.append(button('skip','لم يُقيّم',()=>scoreItem('skip')));
  }else for(const [key,text,i]of [['independent','استجابة مستقلة','check'],['help','مع مساعدة','help'],['incorrect','استجابة غير صحيحة','cross'],['skip','لم يُقيّم','skip']]){const b=button(i,text,()=>scoreItem(key));b.dataset.score=key;ratings.append(b);}
 }
 function scoreItem(outcome){stop();run(()=>{const s=store.draft(),id=s.id;store.score(outcome);if(store.draft()){task();return;}
  const saved=store.active().sessions.find(x=>x.id===id);
  if(Number.isInteger(saved.day)&&saved.complete){store.markStep(saved.day,saved.step);celebrate(saved.day);return;}
  reportId=id;go('report');});}
 function celebrate(d){dayView=d;const done=PR.isDayDone(store.program().done,d);go(done?'home':'day');if(done&&!celebrated.has(d)){celebrated.add(d);showModal('أحسنت!',`<p class="cheer">${icon('star')}</p><p>اكتمل تمرين اليوم ${num(d+1)}. نلتقي غدًا في محطة جديدة على الطريق.</p>`,[['تم',()=>{}]]);}}
 function endSession(){const s=store.draft();if(!s)return;showModal('إنهاء الجلسة','<p>تُحفظ الاستجابات الحالية. الفرز غير المكتمل لا يغيّر المهارات المحددة للتجاوز، وتدريب اليوم غير المكتمل لا يُحسب.</p>',[['إنهاء',()=>run(()=>{const id=s.id;store.finish();reportId=id;go('report');})],['متابعة',()=>go('task')]]);}
 function play(item){stop();const s=store.draft();if(!s)return;
  // Every extra delivery after the first one is assistance, including recorded playback.
  if(s.delivered){if(run(()=>store.help())===null)return;}else if(run(()=>store.change(d=>{d.delivered=true;}))===null)return;
  const src=`assets/audio/${item.audio}.mp3`;
  if(!window.FollowMedia?.includes(src)){alert('التسجيل غير مضاف بعد. اقرأ التعليمات الظاهرة للطفل.');task();return;}
  audio=new Audio(src);audio.play().catch(()=>alert('تعذّر تشغيل التسجيل. اقرأ التعليمات للطفل.'));task();
 }

 // ---------- Accounts ----------
 function download(name,text,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function profiles(){stop();(async()=>{if(store.data.children.length&&!(await ChildAccountGate.request()))return;const dialog=$('#profiles');$('#account-list').replaceChildren();SuiteAccounts.render($('#account-list'),store.data.children,c=>SuiteAccounts.row(c,button('user',c.name,()=>run(()=>{store.select(c.id);dialog.close();reportId=null;go('home');}))));dialog.querySelector('[role=alert]').textContent='';dialog.showModal();$('#child-name').focus();})();}
 $('#name-form').onsubmit=e=>{e.preventDefault();try{store.signIn($('#child-name').value);$('#child-name').value='';$('#profiles').close();reportId=null;go('home');}catch(err){$('#profiles [role=alert]').textContent=err.message;}};
 $('#backup').innerHTML=icon('download');$('#backup').onclick=()=>download('follow-direction-backup.json',JSON.stringify(store.data,null,2),'application/json');
 $('#research-export').innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12m6-12v12M3 15h18"/></svg>';
 const RESEARCH_EXCLUDED='follow-direction-research-excluded-v1';
 WorkbookReset.attach({anchor:$('#research-export'),label:'اتباع التعليمات',reset:async()=>{const data=store.prepareResearch(),ids=data.children.flatMap(c=>c.sessions.map(s=>s.id));data.children=[];const snapshot=FollowResearch.collect(data,B),bytes=FollowWorkbook.build(snapshot,FollowWorkbookTemplate);localStorage.setItem(RESEARCH_EXCLUDED,JSON.stringify(ids));download('follow-direction-research-empty.xlsx',bytes,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');}});
 function researchData(){const data=store.prepareResearch(),rawExcluded=localStorage.getItem(RESEARCH_EXCLUDED);if(rawExcluded===null)return data;const excluded=new Set(JSON.parse(rawExcluded));data.children=data.children.map(c=>({...c,sessions:c.sessions.filter(s=>!excluded.has(s.id))})).filter(c=>c.sessions.length);return data;}
 $('#research-export').onclick=async()=>{const b=$('#research-export'),error=$('#profiles [role=alert]');b.disabled=true;error.textContent='';try{await new Promise(resolve=>setTimeout(resolve,0));const snapshot=FollowResearch.collect(researchData(),B),bytes=FollowWorkbook.build(snapshot,FollowWorkbookTemplate);download('follow-direction-research-'+snapshot.exported.slice(0,10)+'.xlsx',bytes,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');}catch(e){error.textContent=e.message||'تعذّر إنشاء ملف Excel. حاول مجددًا.';}finally{b.disabled=false;}};
 $('#restore').innerHTML=icon('upload');$('#restore').onclick=()=>$('#restore-file').click();
 $('#restore-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(file.size>20*1024*1024){alert('الملف أكبر من الحد المسموح.');return;}try{const text=await file.text();M.validate(JSON.parse(text),B);showModal('استعادة النسخة','<p>ستحل النسخة محل حسابات هذا التطبيق وتقدمها على هذا الجهاز. احفظ نسخة من بياناتك الحالية أولًا.</p>',[['استعادة',()=>run(()=>{store.import(text);$('#profiles').close();reportId=null;go('home');})]]);}catch{alert('تعذّر قراءة ملف النسخة الاحتياطية.');}};

 // ---------- Report ----------
 const OUT=[['independent','مستقل','#79a68c'],['help','بمساعدة','#d6b063'],['incorrect','غير صحيح','#cd8b82'],['skip','لم يُقيّم','#a1b3c2']];
 // One row per skill: the latest completed screen, recent practice, and play.
 function skillProfile(c){const screen=c.sessions.filter(s=>s.mode==='screen'&&s.complete).at(-1),passes=store.passes(),games=c.games||[];
  return B.groups.map(g=>{const ids=new Set(g.items.map(i=>i.id)),screenResults=screen?g.items.filter(i=>i.phase==='screen').map(i=>screen.results.find(r=>r.item===i.id)?.outcome||'skip'):[];
   const recent=c.sessions.filter(s=>s.mode==='practice').flatMap(s=>s.results.filter(r=>ids.has(r.item)&&r.outcome!=='skip').map(r=>({...r,session:s.id}))).slice(-10);
   const sessions=[...new Set(c.sessions.filter(s=>s.mode==='practice'&&s.results.some(r=>ids.has(r.item)&&r.outcome!=='skip')).map(s=>s.id))].slice(-6).map(id=>{const rs=c.sessions.find(s=>s.id===id).results.filter(r=>ids.has(r.item)&&r.outcome!=='skip');return Math.round(100*rs.filter(r=>r.outcome==='independent').length/rs.length);});
   const independent=recent.filter(r=>r.outcome==='independent').length,plays=games.filter(x=>x.group===g.id);
   const status=passes.has(g.id)?['checked','تم التحقق']:recent.length?['practising','قيد التدريب']:screen?['next','للتدريب']:['new','لم يبدأ'];
   return {g,screenResults,recent,independent,sessions,plays,status};});}
 function report(){const c=store.active(),sessions=c.sessions.filter(s=>s.results.length||s.ended),s=sessions.find(s=>s.id===reportId)||sessions.at(-1),program=store.program(),games=c.games||[];
  app.innerHTML=`<div class="section-heading"><h1>التقرير</h1><div class="no-print" id="report-tools"></div></div><p class="report-name">${esc(c.name)} · ${shortDate(Date.now())}</p>`;
  if(!s&&!games.length){app.insertAdjacentHTML('beforeend','<div class="card empty">لا توجد استجابات مسجلة بعد.</div>');return;}
  $('#report-tools').append(button('print','طباعة التقرير أو حفظ PDF',()=>window.print()));
  const practiced=c.sessions.filter(x=>x.mode==='practice').flatMap(x=>x.results).filter(r=>r.outcome!=='skip'),indep=practiced.filter(r=>r.outcome==='independent').length;
  app.insertAdjacentHTML('beforeend',`<section class="card overview"><h2>نظرة عامة</h2><div class="tiles"><span>${icon('road')}<b>${num(PR.daysDone(program))}/${num(PR.DAYS.length)}</b>أيام الطريق</span><span>${icon('ear')}<b>${num(practiced.length)}</b>تعليمات في التدريب</span><span>${icon('check')}<b>${practiced.length?num(Math.round(100*indep/practiced.length))+'٪':'—'}</b>استجابة مستقلة في التدريب</span><span>${icon('game')}<b>${num(games.length)}</b>ألعاب مكتملة</span></div><p class="muted">الألعاب للعب والتعزيز فقط ولا تدخل في نسب الفرز أو التدريب.</p></section>`);
  const rows=skillProfile(c),dot=o=>`<i class="dot-${o}" title="${OUT.find(x=>x[0]===o)[1]}"></i>`;
  app.insertAdjacentHTML('beforeend',`<section class="card profile"><h2>ملف المهارات</h2><div class="legend">${OUT.map(([,t,color])=>`<span><i style="--color:${color}"></i>${t}</span>`).join('')}</div><div class="profile-table" role="table" aria-label="ملف المهارات"><div class="profile-row head" role="row"><span role="columnheader">المهارة</span><span role="columnheader">آخر فرز</span><span role="columnheader">آخر ١٠ في التدريب</span><span role="columnheader">الجلسات</span><span role="columnheader">الحالة</span></div>${rows.map(r=>`<div class="profile-row" role="row"><span role="cell"><b>${esc(r.g.label)}</b>${r.plays.length?`<small>${icon('game')} ${num(r.plays.length)}</small>`:''}</span><span role="cell" class="dots" aria-label="${r.screenResults.length?r.screenResults.map(o=>OUT.find(x=>x[0]===o)[1]).join('، '):'لا يوجد فرز مكتمل'}">${r.screenResults.length?r.screenResults.map(dot).join(''):'<small>—</small>'}</span><span role="cell">${r.recent.length?`<span class="meter" aria-hidden="true"><i style="width:${100*r.independent/r.recent.length}%"></i></span><small>${num(r.independent)} مستقل من ${num(r.recent.length)}</small>`:'<small>—</small>'}</span><span role="cell" class="spark" aria-label="نسبة الاستجابة المستقلة في آخر الجلسات: ${r.sessions.map(v=>v+'٪').join('، ')||'لا يوجد'}">${r.sessions.map(v=>`<i style="height:${Math.max(8,v)}%"></i>`).join('')||'<small>—</small>'}</span><span role="cell"><em class="status ${r.status[0]}">${r.status[1]}</em></span></div>`).join('')}</div></section>`);
  if(s)sessionReport(c,sessions,s);
  const latestScreen=c.sessions.filter(x=>x.mode==='screen'&&x.complete).at(-1),passes=store.passes(),focus=PR.ORDER.find(id=>!passes.has(id));
  app.insertAdjacentHTML('beforeend',`<section class="card"><h2>خطة التدريب</h2><p>${latestScreen?`آخر فرز مكتمل: ${date(latestScreen.finished)}`:'لم يكتمل فرز بعد.'}</p><p>${passes.size?'محدّد للتجاوز: '+B.groups.filter(g=>passes.has(g.id)).map(g=>esc(g.label)).join('، '):'لا توجد مهارات محددة للتجاوز.'}</p><p>للتدريب أو إعادة التحقق: ${B.groups.filter(g=>!passes.has(g.id)).map(g=>esc(g.label)).join('، ')||'يمكن إعادة تدريب أي مهارة عند الحاجة.'}</p>${focus?`<p>اقتراح للبيت: العبوا لعبة «${esc(GB.byGroup(focus).title)}» وتدرّبوا على «${esc(label(focus))}» بأشياء حقيقية من البيت.</p>`:''}</section>`);
 }
 function sessionReport(c,sessions,s){reportId=s.id;
  const wrap=document.createElement('div');wrap.className='session-pick no-print';wrap.innerHTML='<label for="session-choice">الجلسة</label>';const chooser=document.createElement('select');chooser.id='session-choice';for(const entry of [...sessions].reverse()){const o=document.createElement('option');o.value=entry.id;o.textContent=`${entry.mode==='screen'?'فرز':Number.isInteger(entry.day)?'اليوم '+num(entry.day+1):'تدريب'} · ${date(entry.started)}${entry.complete?'':' · غير مكتمل'}`;o.selected=entry.id===s.id;chooser.append(o);}chooser.onchange=()=>{reportId=chooser.value;report();};wrap.append(chooser);app.append(wrap);window.StyledDropdowns?.enhance(wrap);
  const counts=M.counts(s.results),n=counts.independent+counts.help+counts.incorrect,remaining=s.items.length-s.results.length;
  app.insertAdjacentHTML('beforeend',`<section class="card"><h2>${s.mode==='screen'?'الفرز':'التدريب'}${s.group?' · '+esc(label(s.group)):''}</h2><p class="muted">${date(s.started)} · ${s.complete?'مكتمل':s.ended?'أُنهي مبكرًا':'قيد المتابعة'}</p><div class="report-summary"><span><b>${counts.independent}</b>مستقل</span><span><b>${counts.help}</b>بمساعدة</span><span><b>${counts.incorrect}</b>غير صحيح</span><span><b>${counts.skip+remaining}</b>لم يُقيّم</span></div><p class="muted" style="margin:14px 0 0">${counts.independent} مستقل من ${n} مُقيّم · ${remaining} دون استجابة مسجلة</p></section>`);
  const sessionGroups=B.groups.filter(g=>s.items.some(id=>g.items.some(i=>i.id===id))),chartMax=Math.max(1,...sessionGroups.map(g=>s.items.filter(id=>g.items.some(i=>i.id===id)).length)),ticks=chartMax<=6?Array.from({length:chartMax+1},(_,i)=>i):Array.from({length:5},(_,i)=>Math.round(chartMax*i/4));
  app.insertAdjacentHTML('beforeend',`<section class="card report-chart"><h2>المهارات في هذه الجلسة</h2><div class="legend">${OUT.map(([,t,color])=>`<span><i style="--color:${color}"></i>${t}</span>`).join('')}</div><div id="chart"></div><div class="chart-axis">${ticks.map(n=>`<span>${n}</span>`).join('')}</div></section>`);
  for(const g of sessionGroups){const results=s.results.filter(r=>g.items.some(i=>i.id===r.item)),k=M.counts(results);k.skip+=s.items.filter(id=>g.items.some(i=>i.id===id)).length-results.length;$('#chart').insertAdjacentHTML('beforeend',`<div class="chart-row"><span>${esc(g.label)}</span><div class="bars" role="img" aria-label="${esc(g.label)}: ${OUT.map(([key,t])=>`${t} ${k[key]}`).join('،')}">${OUT.map(([key,,color])=>`<div class="bar" style="--width:${100*k[key]/chartMax}%;--color:${color}">${k[key]?`<span>${k[key]}</span>`:''}</div>`).join('')}</div></div>`);}
 }

 // ---------- Parent guide ----------
 function guide(){const legend=[['home','الرئيسية: لوحة الطفل وتمرين اليوم'],['user','حساب الطفل: اختيار طفل أو إضافة طفل (بسؤال حسابي للأهل)'],['chart','التقرير: التقدم وطباعته PDF'],['info','هذا الدليل'],['download','تنزيل التطبيق ليعمل دون إنترنت'],['road','الطريق: محطة لكل يوم'],['game','الألعاب: لعبة لكل مهارة'],['ear','التدريب: تعليمات قصيرة لمهارة واحدة'],['screen','الفرز: ٣٣ مهمة يقرؤها الأخصائي مرة واحدة'],['play','تشغيل التعليمات المسجّلة'],['repeat','تكرار أو إعادة المحاولة: تُسجَّل مساعدة'],['picture','بطاقات مصوّرة لخطوات التعليمات: تُسجَّل مساعدة'],['book','ما تحتاجه من ألعاب وأشياء للمهمة'],['flag','إنهاء الجلسة وحفظها'],['check','استجابة مستقلة'],['help','استجابة مع مساعدة'],['cross','استجابة غير صحيحة'],['skip','لم يُقيّم / الجولة التالية'],['star','نجمة: جولة أو يوم مكتمل'],['lock','يوم مقفل: يُفتح يوم جديد كل يوم']];
  showModal('دليل الأهل',`<div class="guide"><h3>كيف نستخدم التطبيق؟</h3><ol><li>اختاروا حساب الطفل أو أضيفوا اسمه.</li><li>من الرئيسية اضغطوا «ابدأ تمرين اليوم»: لعبة قصيرة، ثم خمس تعليمات، ثم لعبة اليوم. يكفي ٥–١٠ دقائق.</li><li>اقرؤوا التعليمات للطفل مرة واحدة بصوت هادئ، وانتظروا قليلًا قبل المساعدة.</li><li>بعد كل تعليمة سجّلوا ما حدث: مستقل، أو بمساعدة، أو غير صحيح.</li><li>يُفتح يوم جديد على الطريق كل يوم. الألعاب متاحة دائمًا للعب الحر.</li></ol>
  <h3>نصائح</h3><ul><li>حضّروا الأشياء الحقيقية (كرة، كوب، صندوق…) قبل البدء؛ أيقونة الكتاب تذكر ما تحتاجونه.</li><li>إن احتاج الطفل مساعدة فاعرضوا البطاقات المصوّرة أو كرّروا التعليمات، فهذا جزء من التعلّم ويُسجَّل مساعدة.</li><li>امدحوا المحاولة، وتوقّفوا عندما يتعب الطفل؛ التقدم محفوظ.</li><li>التطبيق ليس اختبارًا مقننًا ولا يعطي تشخيصًا. الفرز يقوم به الأخصائي.</li></ul>
  <h3>معاني الأيقونات</h3><dl class="legend-list">${legend.map(([i,t])=>`<div><dt>${icon(i)}</dt><dd>${esc(t)}</dd></div>`).join('')}</dl>
  <h3>للأخصائي</h3><p>في الفرز: اقرأ مرة واحدة دون نموذج أو تلميح أو بطاقات. سجّل التكرار أو المساعدة قبل تقييم الاستجابة. ثلاث استجابات مستقلة في الفرز المكتمل تضع علامة على المهارة؛ يمكن إعادة تدريبها. الحسابات محفوظة في هذا المتصفح على هذا الجهاز فقط؛ نزّل نسخة احتياطية من نافذة الحسابات.</p></div>`);}

 // ---------- Start-up ----------
 // The logo animation plays on a fresh opening only; automatic update reloads skip it.
 function splash(done){let skip=false;try{skip=sessionStorage.getItem('fd-skip-splash')==='1';sessionStorage.removeItem('fd-skip-splash');}catch{}
  if(skip){done();return;}const child=store?.active(),el=document.createElement('div');el.id='splash';el.setAttribute('aria-hidden','true');
  el.innerHTML=`<div class="splash-inner"><img src="assets/logo.webp" alt="" width="180" height="180"><div class="splash-title">اتبع التعليمات</div><p>${child?'مرحبًا، '+esc(child.name):'مرحبًا'}</p><div class="splash-dots" aria-hidden="true"><i></i><i></i><i></i></div></div>`;
  document.body.append(el);let closed=false;const close=()=>{if(closed)return;closed=true;el.classList.add('leave');setTimeout(()=>el.remove(),350);done();};
  el.onclick=close;setTimeout(close,matchMedia('(prefers-reduced-motion: reduce)').matches?500:1900);}
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&audio){audio.pause();audio=null;}});window.addEventListener('pagehide',stop);
 window.addEventListener('storage',e=>{if(e.key===M.KEY){stop();alert('تغيّرت البيانات في نافذة أخرى. أعد فتح التطبيق للمتابعة.');app.querySelectorAll('button').forEach(b=>b.disabled=true);}});
 try{store=new M.Store(localStorage,B);window.FollowProgress={active:()=>store.active()};render();splash(()=>{if(!store.active())profiles();});}catch(e){toolbar();app.innerHTML='<section class="card"><h1>تعذّر فتح الحسابات</h1><p>لم تُحذف البيانات. تحقق من إتاحة التخزين أو استعد نسخة سليمة.</p><button id="recover-data" class="primary">حفظ البيانات الحالية</button></section>';$('#recover-data').onclick=()=>run(()=>download('follow-direction-recovery.txt',localStorage.getItem(M.KEY)||'', 'text/plain'));alert(e.message);}
})();
