(()=>{
 'use strict';
 const B=FollowBank,M=FollowModel,PR=FollowProgram,PIC=FollowPictures,GB=FollowGameBank,$=s=>document.querySelector(s),app=$('#app');
 const paths={home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',chart:'<path d="M4 3v18h18M8 16v-5m5 5V6m5 10V9"/>',check:'<path d="m5 12 4 4L20 5"/>',cross:'<path d="m6 6 12 12M18 6 6 18"/>',help:'<path d="M8 9V5a2 2 0 0 1 4 0v7-3a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v6c0 6-11 6-13 1l-4-6a2 2 0 0 1 3-2l2 2Z"/>',skip:'<path d="m5 5 10 7L5 19ZM19 5v14"/>',play:'<path d="m8 4 13 8-13 8Z"/>',ear:'<path d="M6 10C6-1 22 0 20 10c-1 5-6 4-6 9-1 5-7 3-7 0m3-9c0-6 7-5 6 0-1 3-3 2-3 5"/>',screen:'<path d="M9 4h11v18H4V4h5m0-2h6v4H9ZM8 11l1 1 2-3m3 2h3M8 17l1 1 2-3m3 2h3"/>',flag:'<path d="M5 22V3c5-4 9 4 16 0v12c-7 4-11-4-16 0"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M3 17v5h18v-5"/>',upload:'<path d="M12 17V5m-5 5 5-5 5 5M3 17v5h18v-5"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',back:'<path d="M5 12h15m-6-6 6 6-6 6"/>',repeat:'<path d="M4 8a9 9 0 1 1-1 9M4 2v6h6"/>',print:'<path d="M6 8V2h12v6M6 18H2V8h20v10h-4M6 14h12v8H6Z"/>',save:'<path d="M4 2h14l4 4v16H2V2Zm3 0v7h10V2M7 22v-8h10v8"/>',book:'<path d="M12 5C8 1 2 3 2 3v17s6-2 10 2c4-4 10-2 10-2V3s-6-2-10 2Zm0 0v17"/>',
  star:'<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9Z"/>',road:'<path d="M9 3c-6 4 6 6 0 9s6 6 0 9M15 3c6 4-6 6 0 9s-6 6 0 9"/>',game:'<rect x="2" y="7" width="20" height="11" rx="5.5"/><path d="M7 10v5m-2.5-2.5h5M16 11h.01M18 14h.01"/>',picture:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',moon:'<path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',key:'<circle cx="8" cy="15" r="5"/><path d="m12 11 9-9m-4 4 3 3m-6 0 2 2"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 9v11"/>'};
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
 // Header keeps account, guide and offline download; the bottom bar moves between screens.
 function toolbar(){const t=$('#toolbar');t.replaceChildren();t.append(button('user','حساب الطفل',profiles),button('info','دليل الأهل',guide),button('download','تنزيل للاستخدام دون إنترنت',()=>window.FollowOffline?.open()));tabbar();}
 function tabbar(){const bar=$('#tabbar'),draft=store.active()&&store.draft(),here={home:'home',road:'road',day:'road',games:'games',game:'games',practice:'practice',task:'screen',report:'report',compare:'report'}[view];
  const item=(id,name,text,fn)=>{const b=button(name,text,fn,'tab');b.insertAdjacentHTML('beforeend',`<span>${text}</span>`);if(id===here)b.setAttribute('aria-current','page');bar.append(b);return b;};
  bar.replaceChildren();
  item('home','home','الرئيسية',()=>go('home'));item('road','road','الطريق',()=>needAccount(()=>go('road')));item('games','game','الألعاب',()=>needAccount(()=>go('games')));item('practice','ear','التدريب',()=>needAccount(()=>go('practice')));
  item('screen',draft?'play':'screen',draft?'متابعة الجلسة':'الفرز',()=>needAccount(()=>{if(store.draft())go('task');else confirmStart('screen');}));
  item('report','chart','التقرير',()=>needAccount(()=>{reportId=null;go('report');}));
  const t=item('therapist','key','وضع المعالج',therapistToggle);t.classList.add('therapist');t.setAttribute('aria-pressed',String(therapist));if(therapist){t.title='وضع المعالج مفعّل: كل الأيام مفتوحة. اضغط للإيقاف.';t.querySelector('span').textContent='المعالج ✓';}
 }
 function needAccount(fn){if(store.active())fn();else profiles();}
 function go(next){stop();view=next;render();app.focus({preventScroll:true});app.scrollTop=0;window.scrollTo(0,0);}
 function render(){document.body.dataset.view=view;toolbar();if(view==='compare'){compare();return;}if(!store.active()){home();return;}({task,practice,report,road,day,games,game}[view]||home)();}

 // ---------- Therapist mode ----------
 // A therapist can open every day and step on this device with the code 013. It stays on until turned off.
 const THERAPIST_KEY='follow-direction-therapist-v1',THERAPIST_CODE='013';
 let therapist=false;try{therapist=localStorage.getItem(THERAPIST_KEY)==='1';}catch{}
 const lockOf=(program,d)=>therapist?null:PR.lockReason(program,d);
 function setTherapist(on){therapist=on;try{if(on)localStorage.setItem(THERAPIST_KEY,'1');else localStorage.removeItem(THERAPIST_KEY);}catch{}render();alert(on?'وضع المعالج مفعّل: كل الأيام والخطوات مفتوحة.':'أُوقف وضع المعالج.');}
 function therapistToggle(){
  if(therapist){showModal('وضع المعالج','<p>وضع المعالج مفعّل وكل الأيام مفتوحة. هل تريد إيقافه؟</p>',[['إيقاف وضع المعالج',()=>setTherapist(false)]]);return;}
  $('#modal-title').textContent='وضع المعالج';
  $('#modal-body').innerHTML='<form id="therapist-form"><p>أدخل رمز المعالج لفتح كل الأيام والخطوات على هذا الجهاز.</p><label for="therapist-code">الرمز</label><input id="therapist-code" type="password" inputmode="numeric" autocomplete="off" maxlength="12" required><p class="form-error" role="alert"></p><div class="dialog-actions"><button type="submit" class="primary">فتح الكل</button></div></form>';
  $('#therapist-form').onsubmit=e=>{e.preventDefault();if($('#therapist-code').value.trim()===THERAPIST_CODE){$('#modal').close();setTherapist(true);}else{$('#therapist-form [role=alert]').textContent='الرمز غير صحيح.';$('#therapist-code').select();}};
  $('#modal').showModal();$('#therapist-code').focus();
 }

 // ---------- Dashboard ----------
 function today(){const program=store.program(),day=PR.currentDay(program),lock=lockOf(program,day),finished=PR.isDayDone(program.done,PR.DAYS.length-1);return {program,day,lock,finished,next:PR.nextStep(program,day)};}
 const stepTitle=s=>s.type==='game'?GB.byGroup(s.group).title:`تدريب · ${label(s.group)}`;
 const stepIcon=s=>s.type==='game'?'game':'ear';
 function dayName(day){return day<PR.ORDER.length?label(PR.focus(day)):'يوم الاحتفال';}
 // The dashboard: greeting and today's workout. Moving between screens is the bottom bar's job.
 function home(){const child=store.active(),draft=child&&store.draft();
  app.innerHTML=`<section class="hero dash-hero"><img src="assets/logo.webp" alt="" width="164" height="164"><div><h1>اتبع التعليمات</h1><p>${child?'مرحبًا، '+esc(child.name):'Follow Direction'}</p></div></section><div class="today-slot"></div>`;
  if(child)todayCard(app.querySelector('.today-slot'),draft);
  else{const b=button('user','اختيار حساب الطفل',profiles,'primary big start');b.insertAdjacentHTML('beforeend','<span>اختر حساب الطفل للبدء</span>');app.querySelector('.today-slot').append(b);}
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
 function openDay(d){const program=store.program(),lock=lockOf(program,d);
  if(lock==='earlier'){showModal(`اليوم ${num(d+1)}`,'<p>أكمل الأيام السابقة أولًا.</p>',[['فتح اليوم (للأهل)',()=>adultOpen(d)]]);return;}
  if(lock==='tomorrow'){showModal(`اليوم ${num(d+1)}`,'<p>يُفتح يوم جديد كل يوم. عُد غدًا، أو افتحه الآن بإذن الأهل.</p>',[['فتح اليوم (للأهل)',()=>adultOpen(d)]]);return;}
  dayView=d;go('day');
 }
 async function adultOpen(d){if(!(await ChildAccountGate.request()))return;if(run(()=>store.unlockDay(d))!==null){dayView=d;go('day');}}
 // Twelve stations on a winding road that always fits the screen: rows of 4 (3 on narrow screens),
 // read right to left, each row turning back under the one above.
 function road(){const program=store.program(),current=PR.currentDay(program),child=store.active();
  app.innerHTML=`<div class="section-heading"><h1>الطريق</h1><p class="muted">${num(PR.daysDone(program))} من ${num(PR.DAYS.length)} أيام${therapist?' · وضع المعالج: كل الأيام مفتوحة':''}</p></div><div class="road" role="group" aria-label="أيام الطريق"></div>`;
  const host=app.querySelector('.road'),w=host.clientWidth||600,h=host.clientHeight||600,cols=w>=560?4:3,rows=Math.ceil(PR.DAYS.length/cols),cw=w/cols,ch=h/rows;
  const points=PR.DAYS.map((_,d)=>{const r=Math.floor(d/cols),c=d%cols,fromRight=r%2?cols-1-c:c;return [w-(fromRight+.5)*cw,(r+.5)*ch];});
  host.style.setProperty('--dot',Math.round(Math.max(38,Math.min(68,ch*.42,cw*.5)))+'px');
  const turn=Math.min(cw*.45,60),path=points.map(([x,y],i)=>{if(!i)return `M${x} ${y}`;const [px,py]=points[i-1];if(py===y)return `L${x} ${y}`;const out=Math.floor(i/cols)%2?-turn:turn;return `C${px+out} ${py} ${x+out} ${y} ${x} ${y}`;}).join(' ');
  host.innerHTML=`<svg class="road-line" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${path}"/></svg>`;
  PR.DAYS.forEach((_,d)=>{const done=PR.isDayDone(program.done,d),lock=lockOf(program,d),[x,y]=points[d];
   const b=document.createElement('button');b.type='button';b.className='station'+(done?' done':'')+(d===current?' now':'')+(lock?' locked':'');
   b.setAttribute('aria-label',`اليوم ${d+1}: ${dayName(d)}${done?'، مكتمل':lock?'، مقفل':d===current?'، اليوم الحالي':''}`);b.style.left=100*x/w+'%';b.style.top=100*y/h+'%';b.style.width=Math.min(cw-6,130)+'px';
   b.innerHTML=`<span class="dot">${done?icon('star'):lock?icon('lock'):`<b>${num(d+1)}</b>`}</span><span class="station-label">${esc(dayName(d))}</span>`;b.onclick=()=>openDay(d);host.append(b);
   if(d===current&&child){const pin=document.createElement('span');pin.className='pin';pin.setAttribute('aria-hidden','true');const avatar=SuiteAccounts.badge?.(child);if(avatar)pin.append(avatar);b.append(pin);}
  });
 }
 function day(){const program=store.program(),d=dayView,next=PR.nextStep(program,d),lock=lockOf(program,d);
  app.innerHTML=`<div class="section-heading"><h1>اليوم ${num(d+1)}</h1></div><p class="muted day-sub">${esc(dayName(d))}</p><div class="day-steps"></div>`;
  const host=app.querySelector('.day-steps');
  PR.DAYS[d].forEach((s,i)=>{const done=PR.isStepDone(program.done,d,i),open=therapist||(!lock&&(done||i===next));
   const b=button(done?'check':stepIcon(s),`${stepTitle(s)}${done?'، مكتمل':open?'':'، بعد الخطوة السابقة'}`,()=>runStep(d,i),'day-step'+(done?' done':'')+(i===next?' now':''));b.disabled=!open;
   b.insertAdjacentHTML('beforeend',`<span><b>${esc(stepTitle(s))}</b><small>${s.type==='game'?(s.warmup?'لعبة تسخين':'لعبة اليوم'):'خمس تعليمات قصيرة'}</small></span>`);host.append(b);});
  if(program.unlocked[d]&&!PR.DAYS[d].some((_,i)=>PR.isStepDone(program.done,d,i))){const relock=button('lock','إقفال هذا اليوم مرة أخرى',()=>run(()=>{store.unlockDay(d,false);go('road');}),'ghost');relock.insertAdjacentHTML('beforeend','<span>إقفال هذا اليوم مرة أخرى</span>');app.append(relock);}
 }

 // ---------- Games ----------
 function games(){app.innerHTML='<div class="section-heading"><h1>الألعاب</h1></div><div class="game-grid"></div>';const grid=app.querySelector('.game-grid'),played=store.active().games||[];
  for(const g of GB.games){const count=played.filter(p=>p.group===g.group).length,b=button('game',`${g.title} · ${label(g.group)}`,()=>{gameCtx={group:g.group};go('game');},'game-card');
   b.innerHTML=`${gameArt(g.type)}<b>${esc(g.title)}</b><small>${esc(label(g.group))}</small>${count?`<span class="plays" aria-hidden="true">${icon('star')}${num(count)}</span>`:''}`;grid.append(b);}
 }
 function gameArt(type){const a=(k,c)=>PIC.art(k,c),n=PIC.nest,G=FollowGames.art,[boxBack,boxFront]=PIC.layers('box');
  const balloon=(x,y,rx,ry,color)=>`<path d="M${x} ${y+ry+2}q-4 8 1 16"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}"/><ellipse cx="${x-rx*.4}" cy="${y-ry*.4}" rx="${rx*.18}" ry="${ry*.28}" fill="#fff" opacity=".7" stroke="none"/>`;
  const body={bear:n(a('bear'),10,10,80),find:n(a('ball'),4,44,42)+n(a('cup'),52,40,44)+n(a('car'),24,6,46),balloons:balloon(34,38,20,24,'#e57b6e')+balloon(68,34,15,18,'#5f9fd1'),feed:n(a('plate'),12,34,76)+n(a('apple'),30,22,40),need:n(a('bear'),2,22,56)+n(a('cup'),56,40,40),place:n(boxBack,14,30,72)+n(a('ball'),32,20,36)+n(boxFront,14,30,72),train:n(G.ENGINE,0,16,70)+'<rect x="68" y="44" width="28" height="26" rx="4" fill="#f2c28c"/><circle cx="76" cy="72" r="5" fill="#3d5566"/><circle cx="90" cy="72" r="5" fill="#3d5566"/>',playroom:n(a('chair'),44,26,54)+n(a('cat'),2,40,48),signal:'<rect x="34" y="6" width="32" height="80" rx="13" fill="#5c7285"/><circle cx="50" cy="28" r="10" fill="#e57b6e"/><circle cx="50" cy="62" r="10" fill="#6fb391"/><path d="M50 86v10"/>',trip:'<path d="M18 82C34 44 66 72 84 24" stroke-dasharray="5 6"/>'+n(G.PLACES.house,0,52,42)+n(G.PLACES.tree,58,0,42)}[type];return `<svg class="game-art" viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;}
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
  if(d.type==='steps')return `<div class="pictures" style="--n:${d.steps.length}" aria-label="بطاقات مصوّرة">${d.steps.map((s,i)=>card(s,d.steps.length>1?i+1:0)).join(`<span class="pic-then" aria-hidden="true">${icon('back')}</span>`)}</div>`;
  return `<div class="pictures branches" aria-label="بطاقات مصوّرة">${d.branches.map(b=>`<div class="branch">${card(b.when)}<span class="pic-then" aria-hidden="true">${icon('back')}</span>${card(b.then)}</div>`).join('')}</div>`;}
 function task(){const s=store.draft();if(!s){reportId=store.active().sessions.at(-1)?.id;view='report';report();return;}const item=B.items.find(i=>i.id===s.items[s.results.length]),g=B.groups.find(g=>g.id===item.group),choice=item.kind!=='observe';
  const where=Number.isInteger(s.day)?`اليوم ${num(s.day+1)} · ${esc(g.label)}`:`${s.mode==='screen'?'الفرز':'التدريب'} · ${esc(g.label)}`;
  app.innerHTML=`<section class="card task"><div class="task-top"><p>${where}</p><span>${s.results.length+1} / ${s.items.length}</span></div><progress class="task-progress" value="${s.results.length}" max="${s.items.length}" aria-label="تقدم الجلسة"></progress><h2>${esc(item.prompt)}</h2>${!choice&&s.pictures?pictureStrip(item):''}<div class="${choice?'options':'observe-art'}">${choice||s.pictures?'':icon('ear')}</div><div class="result-mark" role="status"></div><div class="task-controls"></div><p class="help-state">${s.pictures?'عُرضت بطاقات مصوّرة: تُسجَّل مساعدة':s.helped?'تم تسجيل تكرار أو مساعدة':''}</p><div class="ratings" aria-label="تسجيل استجابة الطفل"></div></section>`;
  const controls=app.querySelector('.task-controls'),ratings=app.querySelector('.ratings');
  controls.append(button('play','تشغيل التعليمات',()=>play(item)),button('repeat','تكرار أو إعادة المحاولة (مساعدة)',()=>{if(run(()=>store.retry())!==null)task();}));
  if(!choice&&!s.pictures)controls.append(button('picture','عرض بطاقات مصوّرة (مساعدة)',()=>{if(run(()=>store.showPictures())!==null)task();}));
  controls.append(button('book','تجهيز المهمة',()=>showModal('تجهيز المهمة',`<p>${esc(item.setup||(choice?'اعرض الخيارات واقرأ التعليمات دون الإشارة إلى الجواب.':'نفّذ أمام الطفل فقط في التدريب؛ سجّل أي نموذج أو تكييف كمساعدة.'))}</p>`)),button('flag','إنهاء الجلسة',endSession));
  if(choice){const options=app.querySelector('.options');options.style.setProperty('--n',item.options.length);for(const key of item.options){const b=document.createElement('button');b.className='option'+(s.selection.includes(key)?' selected':'');b.setAttribute('aria-label',objectLabel(key));b.innerHTML=objectArt(key);const indexes=s.selection.map((v,i)=>v===key?i+1:0).filter(Boolean);if(indexes.length)b.insertAdjacentHTML('beforeend',`<span class="step">${indexes.join('،')}</span>`);b.disabled=s.selection.length>=item.answer.length;b.onclick=()=>{run(()=>{store.selectAnswer(key);task();});};options.append(b);}
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
 function profiles(){stop();(async()=>{if(store.data.children.length&&!(await ChildAccountGate.request()))return;const dialog=$('#profiles');$('#account-list').replaceChildren();SuiteAccounts.render($('#account-list'),store.data.children,c=>SuiteAccounts.row(c,button('user',c.name,()=>run(()=>{store.select(c.id);dialog.close();reportId=null;go('home');}))));dialog.querySelector('[role=alert]').textContent='';$('#compare-open').hidden=!store.data.children.some(c=>!M.isAdmin(c));$('#child-birth').max=new Date().toISOString().slice(0,10);dialog.showModal();window.StyledDropdowns?.enhance($('#name-form'));$('#child-name').focus();})();}
 $('#name-form').onsubmit=e=>{e.preventDefault();try{store.signIn($('#child-name').value,{gender:$('#child-gender').value,birth:$('#child-birth').value});$('#name-form').reset();$('#profiles').close();reportId=null;go('home');}catch(err){$('#profiles [role=alert]').textContent=err.message;}};
 $('#compare-open').innerHTML=icon('table')+'<span>جدول المقارنة</span>';$('#compare-open').onclick=()=>{$('#profiles').close();go('compare');};

 // ---------- Comparison table ----------
 // All children on this device side by side, filtered and averaged by age and gender.
 // Opened from Accounts, behind the parent gate. Gender and birth date can be edited in the table.
 const GENDER_LABEL={boy:'ولد',girl:'بنت'};
 const compareView={gender:'all',band:'all',sort:'age'};
 const bandOf=months=>months===null?'none':String(Math.min(7,Math.max(2,Math.floor(months/12))));
 const bandLabel=b=>b==='none'?'العمر غير مسجّل':b==='2'?'أقل من ٣ سنوات':b==='7'?'٧ سنوات فأكثر':`${num(+b)} سنوات`;
 const ageText=m=>m===null?'—':`${num(Math.floor(m/12))} س ${m%12?`و${num(m%12)} ش`:''}`.trim();
 const pct=x=>x===null||x===undefined?'—':num(Math.round(100*x))+'٪';
 const mean=list=>{const v=list.filter(x=>x!==null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;};
 function compareRows(){return store.data.children.filter(c=>!M.isAdmin(c)).map(c=>{const sum=M.summary(c,B),program={done:{...c.program?.done},unlocked:{...c.program?.unlocked}};return {c,...sum,band:bandOf(sum.age),days:PR.daysDone(program)};});}
 function compare(){
  const all=compareRows(),bands=[...new Set(all.map(r=>r.band))].sort((a,b)=>a==='none'?1:b==='none'?-1:a-b);
  if(compareView.band!=='all'&&!bands.includes(compareView.band))compareView.band='all';
  app.innerHTML=`<div class="section-heading"><h1>مقارنة الأطفال</h1><div class="no-print" id="compare-tools"></div></div><p class="muted compare-intro">كل الأطفال المسجّلين على هذا الجهاز. النسب = الاستجابات المستقلة من الاستجابات المقيّمة. عدّل الجنس وتاريخ الميلاد من الجدول مباشرة.</p>`;
  $('#compare-tools').append(button('print','طباعة الجدول أو حفظ PDF',()=>window.print()));
  if(!all.length){app.insertAdjacentHTML('beforeend','<div class="card empty">لا توجد حسابات أطفال بعد.</div>');return;}
  const filters=document.createElement('div');filters.className='compare-filters no-print';
  const select=(id,text,options,value,onChange)=>{const wrap=document.createElement('div');wrap.innerHTML=`<label for="${id}">${text}</label><select id="${id}">${options.map(([v,t])=>`<option value="${v}"${v===value?' selected':''}>${esc(t)}</option>`).join('')}</select>`;wrap.querySelector('select').onchange=e=>{onChange(e.target.value);compare();};filters.append(wrap);};
  select('compare-gender','الجنس',[['all','الكل'],['boy','أولاد'],['girl','بنات'],['none','غير مسجّل']],compareView.gender,v=>compareView.gender=v);
  select('compare-band','العمر',[['all','كل الأعمار'],...bands.map(b=>[b,bandLabel(b)])],compareView.band,v=>compareView.band=v);
  select('compare-sort','الترتيب',[['age','العمر'],['practice','نسبة التدريب'],['screen','نسبة الفرز'],['name','الاسم']],compareView.sort,v=>compareView.sort=v);
  app.append(filters);window.StyledDropdowns?.enhance(filters);
  const collator=new Intl.Collator('ar',{numeric:true}),desc=(a,b)=>(b??-1)-(a??-1);
  const rows=all.filter(r=>(compareView.gender==='all'||(r.gender||'none')===compareView.gender)&&(compareView.band==='all'||r.band===compareView.band))
   .sort((a,b)=>compareView.sort==='name'?collator.compare(a.c.name,b.c.name):compareView.sort==='practice'?desc(a.practiceRate,b.practiceRate):compareView.sort==='screen'?desc(a.screenRate,b.screenRate):(a.age??1e9)-(b.age??1e9)||collator.compare(a.c.name,b.c.name));
  const meter=x=>x===null?'<span class="muted">—</span>':`<span class="cell-meter"><span class="meter" aria-hidden="true"><i style="width:${Math.round(100*x)}%"></i></span><b>${pct(x)}</b></span>`;
  const table=document.createElement('section');table.className='card compare-card';
  table.innerHTML=`<h2>الأطفال <small class="muted">(${num(rows.length)} من ${num(all.length)})</small></h2><div class="table-scroll"><table class="compare-table"><thead><tr><th scope="col">الطفل</th><th scope="col">الجنس</th><th scope="col">تاريخ الميلاد</th><th scope="col">العمر</th><th scope="col">مهارات متجاوزة</th><th scope="col">الفرز المستقل</th><th scope="col">التدريب المستقل</th><th scope="col">تعليمات التدريب</th><th scope="col">أيام الطريق</th><th scope="col">الألعاب</th></tr></thead><tbody></tbody></table></div>${rows.length?'':'<p class="muted">لا يوجد أطفال بهذا الاختيار.</p>'}`;
  const body=table.querySelector('tbody');
  for(const r of rows){const tr=document.createElement('tr');
   tr.innerHTML=`<th scope="row"></th><td><select aria-label="جنس ${esc(r.c.name)}"><option value="">—</option><option value="boy"${r.gender==='boy'?' selected':''}>ولد</option><option value="girl"${r.gender==='girl'?' selected':''}>بنت</option></select><span class="print-only">${GENDER_LABEL[r.gender]||'—'}</span></td><td><input type="date" dir="ltr" min="1990-01-01" max="${new Date().toISOString().slice(0,10)}" value="${esc(r.c.birth||'')}" aria-label="تاريخ ميلاد ${esc(r.c.name)}"><span class="print-only">${esc(r.c.birth||'—')}</span></td><td>${ageText(r.age)}</td><td>${r.screened?`${num(r.checked)} / ${num(B.groups.length)}`:'<span class="muted">لا فرز</span>'}</td><td>${meter(r.screenRate)}</td><td>${meter(r.practiceRate)}</td><td>${num(r.practiced)}</td><td>${num(r.days)} / ${num(PR.DAYS.length)}</td><td>${num(r.games)}</td>`;
   const open=document.createElement('button');open.type='button';open.className='compare-name';open.textContent=r.c.name;open.title='عرض تقرير '+r.c.name;open.onclick=()=>run(()=>{store.select(r.c.id);reportId=null;go('report');});tr.firstChild.append(open);
   const save=profile=>{run(()=>store.setProfile(r.c.id,profile));compare();};
   tr.querySelector('select').onchange=e=>save({gender:e.target.value});tr.querySelector('input[type=date]').onchange=e=>save({birth:e.target.value});
   body.append(tr);}
  app.append(table);
  // Averages per age group, split by gender, over the children shown above (each child counts once).
  const groups=[...new Set(rows.map(r=>r.band))].sort((a,b)=>a==='none'?1:b==='none'?-1:a-b),cols=[['boy','أولاد'],['girl','بنات'],['all','الجميع']];
  const cell=list=>{if(!list.length)return '<span class="muted">—</span>';const m=mean(list.filter(r=>r.screened).map(r=>r.checked));return `<span><b>${num(list.length)}</b> ${list.length===1?'طفل':list.length===2?'طفلان':'أطفال'}</span><span>تدريب ${pct(mean(list.map(r=>r.practiceRate)))} · فرز ${pct(mean(list.map(r=>r.screenRate)))}</span><span>مهارات متجاوزة ${m===null?'—':num(Math.round(m*10)/10)}</span>`;};
  const pick=(list,g)=>g==='all'?list:list.filter(r=>r.gender===g);
  if(rows.length)app.insertAdjacentHTML('beforeend',`<section class="card compare-card"><h2>المتوسطات حسب العمر والجنس</h2><div class="table-scroll"><table class="compare-table averages"><thead><tr><th scope="col">العمر</th>${cols.map(([,t])=>`<th scope="col">${t}</th>`).join('')}</tr></thead><tbody>${[...groups,'total'].map(b=>{const list=b==='total'?rows:rows.filter(r=>r.band===b);return `<tr class="${b==='total'?'total':''}"><th scope="row">${b==='total'?'الكل':bandLabel(b)}</th>${cols.map(([g])=>`<td><div class="avg">${cell(pick(list,g))}</div></td>`).join('')}</tr>`;}).join('')}</tbody></table></div><p class="muted">الجنس غير المسجّل يظهر في «الجميع» فقط. المتوسط هو متوسط نسب الأطفال، فلا يطغى طفل تدرّب كثيرًا على الآخرين. هذه مقارنة وصفية للمتابعة وليست معايير عمرية.</p></section>`);
 }

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
 function guide(){const legend=[['home','الرئيسية: لوحة الطفل وتمرين اليوم'],['user','حساب الطفل: اختيار طفل أو إضافة طفل (بسؤال حسابي للأهل)'],['table','جدول المقارنة: الأطفال حسب العمر والجنس (من نافذة الحسابات)'],['key','وضع المعالج: برمز المعالج تُفتح كل الأيام والخطوات؛ اضغطوه مرة أخرى للإيقاف'],['chart','التقرير: التقدم وطباعته PDF'],['info','هذا الدليل'],['download','تنزيل التطبيق ليعمل دون إنترنت'],['road','الطريق: محطة لكل يوم'],['game','الألعاب: لعبة لكل مهارة'],['ear','التدريب: تعليمات قصيرة لمهارة واحدة'],['screen','الفرز: ٣٣ مهمة يقرؤها الأخصائي مرة واحدة'],['play','تشغيل التعليمات المسجّلة'],['repeat','تكرار أو إعادة المحاولة: تُسجَّل مساعدة'],['picture','بطاقات مصوّرة لخطوات التعليمات: تُسجَّل مساعدة'],['book','ما تحتاجه من ألعاب وأشياء للمهمة'],['flag','إنهاء الجلسة وحفظها'],['check','استجابة مستقلة'],['help','استجابة مع مساعدة'],['cross','استجابة غير صحيحة'],['skip','لم يُقيّم / الجولة التالية'],['star','نجمة: جولة أو يوم مكتمل'],['lock','يوم مقفل: يُفتح يوم جديد كل يوم']];
  showModal('دليل الأهل',`<div class="guide"><h3>كيف نستخدم التطبيق؟</h3><ol><li>اختاروا حساب الطفل أو أضيفوا اسمه.</li><li>من الرئيسية اضغطوا «ابدأ تمرين اليوم»: لعبة قصيرة، ثم خمس تعليمات، ثم لعبة اليوم. يكفي ٥–١٠ دقائق.</li><li>اقرؤوا التعليمات للطفل مرة واحدة بصوت هادئ، وانتظروا قليلًا قبل المساعدة.</li><li>بعد كل تعليمة سجّلوا ما حدث: مستقل، أو بمساعدة، أو غير صحيح.</li><li>يُفتح يوم جديد على الطريق كل يوم. الألعاب متاحة دائمًا للعب الحر.</li><li>الشريط السفلي ينقلكم بين الرئيسية والطريق والألعاب والتدريب والفرز والتقرير.</li></ol>
  <h3>نصائح</h3><ul><li>حضّروا الأشياء الحقيقية (كرة، كوب، صندوق…) قبل البدء؛ أيقونة الكتاب تذكر ما تحتاجونه.</li><li>إن احتاج الطفل مساعدة فاعرضوا البطاقات المصوّرة أو كرّروا التعليمات، فهذا جزء من التعلّم ويُسجَّل مساعدة.</li><li>امدحوا المحاولة، وتوقّفوا عندما يتعب الطفل؛ التقدم محفوظ.</li><li>التطبيق ليس اختبارًا مقننًا ولا يعطي تشخيصًا. الفرز يقوم به الأخصائي.</li></ul>
  <h3>معاني الأيقونات</h3><dl class="legend-list">${legend.map(([i,t])=>`<div><dt>${icon(i)}</dt><dd>${esc(t)}</dd></div>`).join('')}</dl>
  <h3>للأخصائي</h3><p>في الفرز: اقرأ مرة واحدة دون نموذج أو تلميح أو بطاقات. سجّل التكرار أو المساعدة قبل تقييم الاستجابة. ثلاث استجابات مستقلة في الفرز المكتمل تضع علامة على المهارة؛ يمكن إعادة تدريبها. الحسابات محفوظة في هذا المتصفح على هذا الجهاز فقط. من نافذة الحسابات افتحوا «جدول المقارنة» لمقارنة الأطفال حسب العمر والجنس.</p></div>`);}

 // ---------- Start-up ----------
 // The logo animation plays on a fresh opening only; automatic update reloads skip it.
 function splash(done){let skip=false;try{skip=sessionStorage.getItem('fd-skip-splash')==='1';sessionStorage.removeItem('fd-skip-splash');}catch{}
  if(skip){done();return;}const child=store?.active(),el=document.createElement('div');el.id='splash';el.setAttribute('aria-hidden','true');
  el.innerHTML=`<div class="splash-inner"><img src="assets/logo.webp" alt="" width="180" height="180"><div class="splash-title">اتبع التعليمات</div><p>${child?'مرحبًا، '+esc(child.name):'مرحبًا'}</p><div class="splash-dots" aria-hidden="true"><i></i><i></i><i></i></div></div>`;
  document.body.append(el);let closed=false;const close=()=>{if(closed)return;closed=true;el.classList.add('leave');setTimeout(()=>el.remove(),350);done();};
  el.onclick=close;setTimeout(close,matchMedia('(prefers-reduced-motion: reduce)').matches?500:1900);}
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(view==='road'&&store?.active()&&!document.querySelector('dialog[open]'))road();},150);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&audio){audio.pause();audio=null;}});window.addEventListener('pagehide',stop);
 window.addEventListener('storage',e=>{if(e.key===M.KEY){stop();alert('تغيّرت البيانات في نافذة أخرى. أعد فتح التطبيق للمتابعة.');app.querySelectorAll('button').forEach(b=>b.disabled=true);}});
 try{store=new M.Store(localStorage,B);window.FollowProgress={active:()=>store.active()};render();splash(()=>{if(!store.active())profiles();});}catch(e){toolbar();app.innerHTML='<section class="card"><h1>تعذّر فتح الحسابات</h1><p>لم تُحذف البيانات. تحقق من إتاحة التخزين في المتصفح.</p><button id="recover-data" class="primary">حفظ البيانات الحالية</button></section>';$('#recover-data').onclick=()=>run(()=>download('follow-direction-recovery.txt',localStorage.getItem(M.KEY)||'', 'text/plain'));alert(e.message);}
})();
