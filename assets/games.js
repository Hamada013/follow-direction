(()=>{
 'use strict';
 // Mini-game engine. Touch first: tap, or drag with a finger; tap-then-tap works for every drag,
 // so keyboards and switch users can play too. Games are play, never scored as assessment.
 const GB=FollowGameBank,P=FollowPictures,B=FollowBank;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const pic=body=>`<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
 const obj=(key,color)=>pic(P.art(key,color));
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const BEAR=`<svg viewBox="0 0 200 225" aria-hidden="true"><circle cx="52" cy="42" r="23" fill="#c6a67e"/><circle cx="148" cy="42" r="23" fill="#c6a67e"/><circle cx="52" cy="42" r="11" fill="#f1dcc0"/><circle cx="148" cy="42" r="11" fill="#f1dcc0"/>
<ellipse cx="38" cy="150" rx="18" ry="30" fill="#c6a67e" transform="rotate(20 38 150)"/><ellipse cx="162" cy="150" rx="18" ry="30" fill="#c6a67e" transform="rotate(-20 162 150)"/>
<ellipse cx="70" cy="208" rx="26" ry="14" fill="#c6a67e"/><ellipse cx="130" cy="208" rx="26" ry="14" fill="#c6a67e"/><ellipse cx="100" cy="168" rx="56" ry="48" fill="#c6a67e"/><ellipse cx="100" cy="174" rx="32" ry="28" fill="#f1dcc0"/>
<circle cx="100" cy="76" r="56" fill="#c6a67e"/><circle cx="80" cy="64" r="6" fill="currentColor"/><circle cx="120" cy="64" r="6" fill="currentColor"/><ellipse cx="100" cy="96" rx="25" ry="18" fill="#f1dcc0"/><path d="m91 86 9 8 9-8Z" fill="currentColor"/><path d="M100 94v6m-10 4q10 8 20 0"/></svg>`;
 const BEAR_PARTS={head:[50,9,22],eye:[60,28.5,11],ear:[74,18.5,14],nose:[50,39,11],mouth:[50,47,10],hand:[81,70,15],tummy:[50,78,20],foot:[65,93,15]};
 const PLACES={house:'<path d="M18 50 50 20l32 30v34H18Z" fill="#f2c9a5"/><path d="M12 54 50 18l38 36M42 84V62h16v22"/>',tree:'<path d="M46 86V58h8v28Z" fill="#b48a62"/><circle cx="50" cy="40" r="26" fill="#94c4a1"/>',flower:'<circle cx="50" cy="20" r="11" fill="#eba3b3"/><circle cx="35" cy="34" r="11" fill="#eba3b3"/><circle cx="65" cy="34" r="11" fill="#eba3b3"/><circle cx="41" cy="50" r="11" fill="#eba3b3"/><circle cx="59" cy="50" r="11" fill="#eba3b3"/><circle cx="50" cy="37" r="9" fill="#efc24f"/><path d="M50 58v30m0-12c-8-8-16-6-18-2 6 4 12 4 18 2"/>',pond:'<ellipse cx="50" cy="60" rx="40" ry="22" fill="#9fcbe6"/><path d="M28 58q6-5 12 0t12 0M50 68q6-5 12 0" stroke="#fff"/>'};
 const CAR_TOP='<path d="m13 54 15-4 12-21h25l13 21 10 4v22H13Z" fill="#e07a6f"/><path d="M34 49h35L60 36H43Z" fill="#f8fafc"/><circle cx="29" cy="77" r="9" fill="#6c8290"/><circle cx="72" cy="77" r="9" fill="#6c8290"/>';
 const balloon=(color,size)=>pic(`<path d="M50 ${size==='large'?74:64}q-4 10 2 26" />${size==='large'?`<ellipse cx="50" cy="40" rx="30" ry="35" fill="${color}"/><path d="M38 20q-8 8-6 18" stroke="#fff"/>`:`<ellipse cx="50" cy="44" rx="18" ry="21" fill="${color}"/><path d="M43 32q-5 5-4 11" stroke="#fff"/>`}`);
 // Drop zones per reference object, as percentages of the reference's square.
 const ZONES={box:{in:[30,36,40,32],on:[22,0,56,30],beside:[-48,30,46,60]},chair:{on:[20,24,60,30],under:[24,66,52,32],beside:[-48,30,46,60]}};
 const PREP_WORD={in:'داخل',on:'فوق',under:'تحت',beside:'بجانب'};

 function play({host,group,icon,media,onFinish,onExit,label}){
  const game=GB.byGroup(group),rounds=shuffle(game.rounds).slice(0,GB.ROUNDS_PER_PLAY);
  let index=0,firstTry=0,step=0,errors=0,selected=null,audio=null,finished=false,timer=null;
  host.innerHTML=`<section class="game" data-game="${game.type}" aria-label="${esc(game.title)}"><div class="game-top"><div class="game-stars" role="img"></div><div class="game-controls"></div></div><p class="game-prompt" aria-live="polite"></p><div class="stage"></div></section>`;
  const root=host.querySelector('.game'),stage=root.querySelector('.stage'),promptEl=root.querySelector('.game-prompt'),stars=root.querySelector('.game-stars'),controls=root.querySelector('.game-controls');
  const btn=(name,text,fn,cls='')=>{const b=document.createElement('button');b.type='button';b.className=cls;b.innerHTML=icon(name);b.setAttribute('aria-label',text);b.title=text;b.onclick=fn;return b;};
  controls.append(btn('play','تشغيل التعليمات',()=>say(true)),btn('skip','الجولة التالية',()=>next(false)),btn('home','الخروج من اللعبة',()=>{stop();onExit();}));
  function stop(){clearTimeout(timer);if(audio){audio.pause();audio=null;}}
  function say(manual){stop();const src=`assets/audio/${rounds[index].audio}.mp3`;if(!media.includes(src)){if(manual)label('اقرأ التعليمات الظاهرة للطفل؛ التسجيل غير مضاف بعد.');return;}audio=new Audio(src);audio.play().catch(()=>{});}
  function drawStars(){stars.setAttribute('aria-label',`الجولة ${Math.min(index+1,rounds.length)} من ${rounds.length}`);stars.innerHTML=rounds.map((_,i)=>`<span class="${i<index?'on':i===index?'now':''}">${icon('star')}</span>`).join('');}
  const round=()=>rounds[index],want=()=>round().steps[step];
  function good(el){el?.classList.add('right');step++;if(step<round().steps.length)return;
   if(!errors)firstTry++;stage.classList.add('won');burst();timer=setTimeout(()=>next(true),reduced()?500:1100);}
  function bad(el){errors++;if(el){el.classList.remove('wrong');void el.offsetWidth;el.classList.add('wrong');}}
  function burst(){const b=document.createElement('div');b.className='burst';b.innerHTML=Array.from({length:8},(_,i)=>`<i style="--a:${i*45}deg">${icon('star')}</i>`).join('');stage.append(b);}
  function next(won){stop();index++;step=0;errors=0;selected=null;if(index>=rounds.length)return done();show();}
  function done(){finished=true;stop();drawStars();onFinish({rounds:rounds.length,firstTry});
   root.innerHTML=`<div class="game-done"><div class="trophy">${icon('star')}</div><h2>أحسنت!</h2><p class="done-stars">${rounds.map((_,i)=>`<span class="on">${icon('star')}</span>`).join('')}</p><div class="done-actions"></div></div>`;
   const actions=root.querySelector('.done-actions');actions.append(btn('repeat','العب مرة أخرى',()=>play({host,group,icon,media,onFinish,onExit,label}),'big'),btn('check','تم',onExit,'big primary'));actions.lastChild.focus();}
  function el(html,cls,attrs={}){const e=document.createElement('button');e.type='button';e.className=cls;e.innerHTML=html;for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
  // Drag with a finger or mouse; a plain tap selects, then tapping a zone places.
  function draggable(item,onDrop){
   item.addEventListener('pointerdown',e=>{if(e.button>0)return;const start={x:e.clientX,y:e.clientY},rect=item.getBoundingClientRect();let moved=false;item.setPointerCapture(e.pointerId);
    const move=ev=>{const dx=ev.clientX-start.x,dy=ev.clientY-start.y;if(!moved&&Math.hypot(dx,dy)<8)return;moved=true;item.classList.add('dragging');stage.classList.add('dragging');item.style.transform=`translate(${dx}px,${dy}px) scale(1.08)`;};
    const up=ev=>{item.removeEventListener('pointermove',move);item.removeEventListener('pointerup',up);item.removeEventListener('pointercancel',up);item.classList.remove('dragging');stage.classList.remove('dragging');
     if(!moved){item.style.transform='';return;}item.dataset.dragged='1';
     const x=ev.clientX,y=ev.clientY,zone=[...stage.querySelectorAll('.zone')].find(z=>{const r=z.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;});
     item.style.transform='';onDrop(zone||null,rect);};
    item.addEventListener('pointermove',move);item.addEventListener('pointerup',up);item.addEventListener('pointercancel',up);});
  }
  function select(item){stage.querySelectorAll('.picked').forEach(x=>x.classList.remove('picked'));selected=item;item?.classList.add('picked');stage.classList.toggle('choosing',!!item);}
  function tapOrSelect(item,onTap){item.onclick=()=>{if(item.dataset.dragged){delete item.dataset.dragged;return;}onTap();};}
  // A reference object (box or chair) with labelled drop zones.
  // The drawing fills the right part of a wide frame; "beside" is the free space on its left,
  // so no zone ever sits outside the screen.
  const inFrame=([x,y,w,h])=>x<0?[0,22,36,70]:[37.5+x*.625,y,w*.625,h];
  function reference(ref,place){const r=document.createElement('div');r.className='ref';r.dataset.ref=ref;r.innerHTML=`<span class="ref-art">${obj(ref)}</span>`;
   for(const [prep,box]of Object.entries(ZONES[ref])){const [x,y,w,h]=inFrame(box);const z=el('','zone',{'aria-label':`${PREP_WORD[prep]} ${GB.OBJ[ref]}`,'data-prep':prep});Object.assign(z.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});z.onclick=()=>{if(selected)place(selected,z);};r.append(z);}
   return r;}
  function placeInto(item,zone){const target=zone.closest('.ref');item.classList.add('placed');zone.append(item);item.style.transform='';select(null);return target;}
  function placing(item,zone,check){if(!zone){bad(item);return;}const ok=check(item.dataset.id,zone.dataset.prep,zone.closest('.ref').dataset.ref);if(ok){placeInto(item,zone);good(item);}else{select(null);bad(item);}}
  const SCENES={
   bear(){stage.innerHTML=`<div class="bear">${BEAR}</div>`;const bear=stage.firstChild;
    for(const [part,[x,y,size]]of Object.entries(BEAR_PARTS)){const b=el('','part',{'aria-label':GB.PART[part]+' الدب','data-id':part});Object.assign(b.style,{left:x+'%',top:y+'%',width:size+'%'});b.onclick=()=>{if(want()?.tap===part){b.classList.remove('right');void b.offsetWidth;good(b);}else bad(bear);};bear.append(b);}},
   cards(options,check,art=obj){const row=document.createElement('div');row.className='cards';for(const key of options){const b=el(art(key),'card-choice',{'aria-label':GB.OBJ[key]||GB.PLACE[key]||key,'data-id':key});b.onclick=()=>check(key,b);row.append(b);}stage.append(row);return row;},
   find(){stage.innerHTML='<div class="shelf"></div>';SCENES.cards(shuffle(round().options),(key,b)=>want().tap===key?good(b):bad(b));},
   train(){stage.innerHTML=`<div class="train"><span class="engine">${pic('<path d="M10 70V36h34V22h14v14h14l14 22v12Z" fill="#e07a6f"/><circle cx="26" cy="78" r="9" fill="#6c8290"/><circle cx="70" cy="78" r="9" fill="#6c8290"/><path d="M22 36V24h12v12" fill="#f2c9a5"/>')}</span><span class="wagon"></span><span class="wagon"></span></div>`;
    const wagons=[...stage.querySelectorAll('.wagon')];SCENES.cards(shuffle(round().options),(key,b)=>{if(want().tap===key){wagons[step].innerHTML=obj(key);b.disabled=true;good(wagons[step]);}else bad(b);});},
   balloons(){const row=document.createElement('div');row.className='sky';const options=round().options.map((o,i)=>({...o,i}));
    for(const o of shuffle(options)){const b=el(balloon(GB.COLOR[o.color][1],o.size),'balloon '+o.size,{'aria-label':`بالون ${GB.COLOR[o.color][0]} ${o.size==='large'?'كبير':'صغير'}`});b.onclick=()=>{if(want().tap===o.i){b.classList.add('pop');good(b);}else bad(b);};row.append(b);}stage.append(row);},
   need(){stage.innerHTML=`<div class="need"><div class="ref friend">${BEAR}</div></div>`;const friend=stage.querySelector('.friend');const zone=el('','zone friend-zone',{'aria-label':'أعطِ الدب'});friend.append(zone);
    const give=(key,b)=>{if(want().give===key){b.classList.add('placed');zone.append(b);good(b);}else{select(null);bad(b);}};
    zone.onclick=()=>{if(selected)give(selected.dataset.id,selected);};
    const row=SCENES.cards(shuffle(round().options),()=>{});row.querySelectorAll('button').forEach(b=>{b.onclick=null;tapOrSelect(b,()=>select(b));draggable(b,z=>z?give(b.dataset.id,b):null);});},
   feed(){const r=round(),fruit=r.fruit;stage.innerHTML=`<div class="feed"><div class="ref friend" aria-hidden="true">${BEAR}</div><div class="plate-wrap"></div><div class="tray"></div></div>`;
    const plate=el(obj('plate'),'zone plate',{'aria-label':'طبق الدب'});stage.querySelector('.plate-wrap').append(plate);const tray=stage.querySelector('.tray'),count=()=>plate.querySelectorAll('.fruit').length;
    const toPlate=b=>{b.classList.add('placed');plate.append(b);select(null);},back=b=>{b.classList.remove('placed');tray.append(b);};
    for(let i=0;i<4;i++){const b=el(obj(fruit),'fruit',{'aria-label':GB.OBJ[fruit],'data-id':fruit});tapOrSelect(b,()=>b.parentElement===plate?back(b):toPlate(b));draggable(b,z=>z===plate?toPlate(b):back(b));tray.append(b);}
    plate.onclick=e=>{if(e.target===plate&&selected)toPlate(selected);};
    const check=el(icon('check'),'check-done primary',{'aria-label':'تم العدّ'});check.onclick=()=>{if(count()===want().count)good(plate);else{bad(plate);plate.querySelectorAll('.fruit').forEach(back);}};stage.querySelector('.feed').append(check);},
   place(){const r=round();stage.innerHTML='<div class="room"><div class="spot"></div></div>';const room=stage.firstChild;
    const item=el(obj(r.item),'toy',{'aria-label':GB.OBJ[r.item],'data-id':r.item});room.querySelector('.spot').append(item);
    const place=(it,z)=>placing(it,z,(id,prep,ref)=>id===r.item&&prep===want().prep&&ref===r.ref);room.append(reference(r.ref,place));
    tapOrSelect(item,()=>select(selected===item?null:item));draggable(item,z=>place(item,z));},
   playroom(){const r=round();stage.innerHTML='<div class="room playroom"><div class="spot"></div><div class="refs"></div></div>';const room=stage.firstChild,spot=room.querySelector('.spot');
    const place=(it,z)=>placing(it,z,(id,prep,ref)=>want()?.place===id&&want().prep===prep&&want().ref===ref);
    for(const ref of ['box','chair'])room.querySelector('.refs').append(reference(ref,place));
    for(const key of ['ball','cup','car']){const it=el(obj(key),'toy',{'aria-label':GB.OBJ[key],'data-id':key});tapOrSelect(it,()=>select(selected===it?null:it));draggable(it,z=>place(it,z));spot.append(it);}
    for(const key of ['bear','cat']){const b=el(obj(key),'friend-tap',{'aria-label':GB.OBJ[key],'data-id':key});b.onclick=()=>{if(selected){select(null);}if(want()?.tap===key){b.classList.remove('right');void b.offsetWidth;good(b);}else bad(b);};spot.append(b);}},
   signal(){const r=round();let shown;
    if(r.show==='light')shown=`<div class="light" aria-label="الضوء ${r.value==='green'?'أخضر':'أحمر'}" role="img"><i class="${r.value==='red'?'lit red':''}"></i><i class="${r.value==='green'?'lit green':''}"></i></div>`;
    else if(r.show==='ball')shown=`<div class="shown" role="img" aria-label="كرة ${r.value==='red'?'حمراء':'زرقاء'}">${obj('ball',r.value==='red'?'#e07a6f':'#5f9fd1')}</div>`;
    else shown=`<div class="shown" role="img" aria-label="القطة ${r.value==='in'?'داخل':'خارج'} الصندوق">${pic(r.value==='in'?P.nest(P.art('box'),22,34,56)+P.nest(P.art('cat'),34,20,32):P.nest(P.art('box'),44,32,52)+P.nest(P.art('cat'),4,46,36))}</div>`;
    stage.innerHTML=`<div class="signal">${shown}</div>`;SCENES.cards(shuffle(r.options),(key,b)=>want().tap===key?good(b):bad(b));},
   trip(){stage.innerHTML=`<div class="map"><svg class="trip-road" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true"><path d="M16 16H84V54H16Z" /></svg><span class="car" aria-hidden="true">${pic(CAR_TOP)}</span></div>`;const map=stage.firstChild,car=map.querySelector('.car');
    const spots={house:[16,22],tree:[84,22],flower:[84,78],pond:[16,78]};
    for(const [key,[x,y]]of Object.entries(spots)){const b=el(pic(PLACES[key]),'stop',{'aria-label':GB.PLACE[key],'data-id':key});Object.assign(b.style,{left:x+'%',top:y+'%'});b.onclick=()=>{if(want()?.tap===key){Object.assign(car.style,{left:x+'%',top:y+'%'});good(b);}else bad(b);};map.append(b);}}
  };
  function show(){stage.className='stage';stage.innerHTML='';drawStars();promptEl.textContent=round().prompt;selected=null;
   stage.dataset.round=round().audio;stage.tabIndex=-1;(SCENES[game.type])();say(false);stage.focus({preventScroll:true});}
  show();
  return {stop};
 }
 window.FollowGames={play,list:GB.games};
})();
