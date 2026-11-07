(()=>{
 'use strict';
 // Mini-game engine. Touch first: tap, or drag with a finger; tap-then-tap works for every drag,
 // so keyboards and switch users can play too. Games are play, never scored as assessment.
 const GB=FollowGameBank,P=FollowPictures,B=FollowBank;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const pic=body=>`<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
 // Fruits used only in the feeding game; everything else comes from the shared object drawings.
 const FRUIT={
  orange:'<circle cx="50" cy="54" r="34" fill="#f5a142"/><path d="M76 34A34 34 0 0 1 32 84a34 34 0 0 0 44-50Z" fill="#1d3b50" opacity=".13" stroke="none"/><path d="M50 20c0-6 2-9 5-12" stroke-width="3"/><path d="M54 18c6-9 18-9 22-4-6 8-15 9-22 4Z" fill="#7cbf86"/><circle cx="40" cy="44" r="1.6" fill="#c97a1e" stroke="none"/><circle cx="58" cy="62" r="1.6" fill="#c97a1e" stroke="none"/><circle cx="46" cy="70" r="1.6" fill="#c97a1e" stroke="none"/><ellipse cx="36" cy="40" rx="5" ry="8" transform="rotate(30 36 40)" fill="#fff" opacity=".55" stroke="none"/>',
  strawberry:'<path d="M50 30c20-6 36 4 34 22-2 20-20 36-34 38-14-2-32-18-34-38-2-18 14-28 34-22Z" fill="#e8574f"/><path d="M80 44c2 22-14 40-30 46 18 0 34-18 34-38Z" fill="#1d3b50" opacity=".13" stroke="none"/><path d="M50 32 38 22l2 12-14-2 10 10m14-10 12-10-2 12 14-2-10 10" fill="#7cbf86"/><path d="M50 32V16" stroke-width="3"/><g fill="#fde7a6" stroke="none"><ellipse cx="36" cy="50" rx="1.6" ry="2.4"/><ellipse cx="50" cy="48" rx="1.6" ry="2.4"/><ellipse cx="64" cy="50" rx="1.6" ry="2.4"/><ellipse cx="42" cy="62" rx="1.6" ry="2.4"/><ellipse cx="58" cy="62" rx="1.6" ry="2.4"/><ellipse cx="50" cy="74" rx="1.6" ry="2.4"/><ellipse cx="32" cy="62" rx="1.6" ry="2.4"/><ellipse cx="68" cy="62" rx="1.6" ry="2.4"/></g>'
 };
 const obj=(key,color)=>pic(FRUIT[key]||P.art(key,color));
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const SH='fill="#1d3b50" opacity=".13" stroke="none"',LIGHT='#f3dfc4',FUR='#c89f72',BLUSH='<circle cx="66" cy="94" r="8" fill="#eb8f86" opacity=".45" stroke="none"/><circle cx="134" cy="94" r="8" fill="#eb8f86" opacity=".45" stroke="none"/>';
 // The bear friend. BEAR_PARTS are tap targets as percentages of this 200×225 drawing.
 const BEAR=`<svg viewBox="0 0 200 225" aria-hidden="true"><g fill="${FUR}"><circle cx="52" cy="42" r="23"/><circle cx="148" cy="42" r="23"/><circle cx="52" cy="42" r="11" fill="${LIGHT}"/><circle cx="148" cy="42" r="11" fill="${LIGHT}"/>
<ellipse cx="40" cy="150" rx="18" ry="31" transform="rotate(22 40 150)"/><ellipse cx="160" cy="150" rx="18" ry="31" transform="rotate(-22 160 150)"/><ellipse cx="70" cy="207" rx="27" ry="15"/><ellipse cx="130" cy="207" rx="27" ry="15"/>
<ellipse cx="100" cy="166" rx="56" ry="50"/><circle cx="100" cy="76" r="56"/></g><ellipse cx="70" cy="210" rx="12" ry="7" fill="${LIGHT}" stroke="none"/><ellipse cx="130" cy="210" rx="12" ry="7" fill="${LIGHT}" stroke="none"/>
<ellipse cx="100" cy="176" rx="32" ry="29" fill="${LIGHT}"/><path d="M150 140c8 30-12 66-50 76 34 2 58-24 56-58Z" ${SH}/><path d="M146 50c14 30 0 70-46 82 40 2 64-30 52-66Z" ${SH}/>
<ellipse cx="100" cy="98" rx="26" ry="19" fill="${LIGHT}"/><circle cx="80" cy="66" r="6.5" fill="currentColor" stroke="none"/><circle cx="120" cy="66" r="6.5" fill="currentColor" stroke="none"/><circle cx="82.5" cy="63.5" r="2.2" fill="#fff" stroke="none"/><circle cx="122.5" cy="63.5" r="2.2" fill="#fff" stroke="none"/>
<path d="M89 87q11-7 22 0l-11 10Z" fill="currentColor"/><path d="M100 97v6m-12 3q12 10 24 0"/>${BLUSH}<path d="M100 131l-17-10v20Zm0 0 17-10v20Z" fill="#e57b6e"/><circle cx="100" cy="131" r="5" fill="#e57b6e"/><path d="M64 40a46 46 0 0 1 22-16" stroke="#fff" stroke-width="5" opacity=".5"/></svg>`;
 const BEAR_PARTS={head:[50,9,22],eye:[60,28.5,11],ear:[74,18.5,14],nose:[50,39,11],mouth:[50,47,10],cheek:[67,42,10],bow:[50,58.2,12],hand:[81,70,15],tummy:[50,78,20],foot:[65,93,15]};
 const PLACES={
  house:`<path d="M64 34V16h10v24Z" fill="#b07d52"/><path d="M20 48h60v40H20Z" fill="#f6d9b4"/><path d="M10 52 50 16l40 36Z" fill="#e57b6e"/><path d="M42 88V68a8 8 0 0 1 16 0v20Z" fill="#b07d52"/><rect x="25" y="58" width="12" height="12" rx="2" fill="#dff0f8"/><rect x="63" y="58" width="12" height="12" rx="2" fill="#dff0f8"/><path d="M66 52h14v36H66Z" ${SH}/><path d="M8 88h84"/>`,
  tree:`<path d="M44 90V58h12v32Z" fill="#b07d52"/><g fill="#7cbf86"><circle cx="32" cy="48" r="17"/><circle cx="68" cy="48" r="17"/><circle cx="50" cy="32" r="22"/></g><circle cx="38" cy="30" r="3.5" fill="#e57b6e"/><circle cx="62" cy="40" r="3.5" fill="#e57b6e"/><circle cx="44" cy="52" r="3.5" fill="#e57b6e"/><path d="M58 18a20 20 0 0 1 10 10" stroke="#fff" stroke-width="3" opacity=".6"/><path d="M10 90h80"/>`,
  flower:`<path d="M50 54v36" stroke-width="3.4"/><path d="M50 76c-10-10-22-8-24-2 8 6 18 6 24 2Zm0-6c8-10 20-10 22-4-7 6-16 7-22 4Z" fill="#7cbf86"/><g fill="#f19cb0"><circle cx="50" cy="20" r="12"/><circle cx="33" cy="34" r="12"/><circle cx="67" cy="34" r="12"/><circle cx="40" cy="52" r="12"/><circle cx="60" cy="52" r="12"/></g><circle cx="50" cy="37" r="10" fill="#f6d77e"/><path d="M14 90h72"/>`,
  pond:`<ellipse cx="50" cy="62" rx="42" ry="24" fill="#8cc8ea"/><path d="M24 58q6-5 12 0t12 0M52 72q6-5 12 0t12 0" stroke="#fff" stroke-width="2.6"/><path d="M60 52a10 6 0 1 0 14 0l-7 1Z" fill="#7cbf86"/><path d="M16 46V24m6 24V30m-12 18V34" stroke-width="2.6"/><ellipse cx="16" cy="22" rx="3" ry="7" fill="#b07d52"/><ellipse cx="22" cy="28" rx="3" ry="7" fill="#b07d52"/>`
 };
 const ENGINE=`<path d="M10 46h50v28H10a4 4 0 0 1-4-4V50a4 4 0 0 1 4-4Z" fill="#e57b6e"/><path d="M58 24h32v50H58Z" fill="#e57b6e"/><path d="M18 30h12v16H18Z" fill="#3d5566"/><path d="M14 25h20v6H14ZM54 18h40v8H54Z" fill="#3d5566"/><rect x="64" y="32" width="20" height="15" rx="3" fill="#dff0f8"/><path d="M6 60h84v14H6Z" ${SH}/><path d="M18 52h40" stroke="#fff" stroke-width="3" opacity=".6"/><circle cx="8" cy="56" r="3.5" fill="#f6d77e"/><circle cx="26" cy="13" r="6" fill="#fff"/><circle cx="38" cy="7" r="4" fill="#fff"/><circle cx="22" cy="80" r="9" fill="#3d5566"/><circle cx="46" cy="80" r="9" fill="#3d5566"/><circle cx="74" cy="78" r="11" fill="#3d5566"/><circle cx="22" cy="80" r="3.5" fill="#d7e0e6"/><circle cx="46" cy="80" r="3.5" fill="#d7e0e6"/><circle cx="74" cy="78" r="4" fill="#d7e0e6"/>`;
 const balloon=(color,size)=>{const big=size==='large',[cy,rx,ry]=big?[38,30,34]:[46,19,22],b=cy+ry;
  return (body=>`<svg viewBox="16 0 68 100" aria-hidden="true">${body}</svg>`)(`<path d="M50 ${b+3}q-7 9 1 16t-1 13" />${`<ellipse cx="50" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}"/>`}<path d="M46 ${b+4}h8l-4-5Z" fill="${color}"/><path d="M${50+rx*.55} ${cy-ry*.6}a${rx} ${ry} 0 0 1-${rx*.3} ${ry*1.5}a${rx} ${ry} 0 0 0 ${rx*.3}-${ry*1.5}Z" ${SH}/><ellipse cx="${50-rx*.42}" cy="${cy-ry*.42}" rx="${rx*.18}" ry="${ry*.28}" transform="rotate(25 ${50-rx*.42} ${cy-ry*.42})" fill="#fff" opacity=".7" stroke="none"/>`);};
 // Reference objects for placing toys. Each sits in a 170×130 frame with the drawing at
 // (35,30) and room on both sides for "beside". `back` is drawn behind placed toys and
 // `front` in front of them, so a toy can sit inside the box or under the chair.
 // Drop targets are invisible: a toy dropped anywhere on the frame lands in the part it is over.
 const FRAME=[170,130];
 const [BOX_BACK,BOX_FRONT]=P.layers('box');
 const REFS={
  box:{back:BOX_BACK,front:BOX_FRONT,
   zones:{on:[35,0,100,66],in:[35,66,100,64]},
   slots:{on:[85,75,34,'over'],in:[85,88,36,'behind'],beside:[17.5,120,30,'over']}},
  chair:{back:'',front:P.art('chair'),
   zones:{on:[35,0,100,88],under:[35,88,100,42]},
   slots:{on:[85,84,34,'over'],under:[85,120,30,'behind'],beside:[17.5,120,30,'over']}}
 };
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
  // A reference object (box or chair) on the floor. Its drop targets cover the whole frame and are
  // never drawn; the left one is the labelled "beside" target, the right one is a silent twin.
  const frameSvg=(cls,body)=>`<svg class="${cls}" viewBox="0 0 ${FRAME[0]} ${FRAME[1]}" aria-hidden="true">${body}</svg>`;
  function reference(ref,place){const R=REFS[ref],r=document.createElement('div');r.className='ref';r.dataset.ref=ref;
   r.innerHTML=frameSvg('ref-back',`<ellipse cx="85" cy="121" rx="58" ry="6" fill="#1d3b50" opacity=".08" stroke="none"/>${P.nest(R.back,35,30,100)}`)+frameSvg('ref-front',P.nest(R.front,35,30,100));
   const zones=[...Object.entries(R.zones),['beside',[0,0,35,130],'left'],['beside',[135,0,35,130],'right']];
   for(const [prep,[x,y,w,h],side]of zones){const z=el('','zone',{'aria-label':`${PREP_WORD[prep]} ${GB.OBJ[ref]}`,'data-prep':prep});if(side)z.dataset.side=side;if(side==='right'){z.setAttribute('aria-hidden','true');z.tabIndex=-1;}
    Object.assign(z.style,{left:100*x/FRAME[0]+'%',top:100*y/FRAME[1]+'%',width:100*w/FRAME[0]+'%',height:100*h/FRAME[1]+'%'});z.onclick=()=>{if(selected)place(selected,z);};r.append(z);}
   return r;}
  // Puts the toy where the preposition says: inside the box shows it peeking out, under the chair behind its legs.
  function placeInto(item,zone){const ref=zone.closest('.ref'),prep=zone.dataset.prep;let [cx,bottom,w,layer]=REFS[ref.dataset.ref].slots[prep];if(zone.dataset.side==='right')cx=FRAME[0]-cx;
   item.classList.add('placed',layer);Object.assign(item.style,{left:100*(cx-w/2)/FRAME[0]+'%',top:100*(bottom-w)/FRAME[1]+'%',width:100*w/FRAME[0]+'%',transform:''});
   item.disabled=true;ref.insertBefore(item,ref.querySelector('.zone'));select(null);return ref;}
  function placing(item,zone,check){if(!zone){bad(item);return;}const ok=check(item.dataset.id,zone.dataset.prep,zone.closest('.ref').dataset.ref);if(ok){placeInto(item,zone);good(item);}else{select(null);bad(item);}}
  const SCENES={
   bear(){stage.innerHTML=`<div class="bear">${BEAR}</div>`;const bear=stage.firstChild;
    for(const [part,[x,y,size]]of Object.entries(BEAR_PARTS)){const b=el('','part',{'aria-label':GB.PART[part]+' الدب','data-id':part});Object.assign(b.style,{left:x+'%',top:y+'%',width:size+'%'});b.onclick=()=>{if(want()?.tap===part){b.classList.remove('right');void b.offsetWidth;good(b);}else bad(bear);};bear.append(b);}},
   cards(options,check,art=obj){const row=document.createElement('div');row.className='cards';row.style.setProperty('--n',options.length);for(const key of options){const b=el(art(key),'card-choice',{'aria-label':GB.OBJ[key]||GB.PLACE[key]||key,'data-id':key});b.onclick=()=>check(key,b);row.append(b);}stage.append(row);return row;},
   find(){stage.innerHTML='<div class="shelf"></div>';SCENES.cards(shuffle(round().options),(key,b)=>want().tap===key?good(b):bad(b));},
   train(){stage.innerHTML=`<div class="train"><span class="engine">${pic(ENGINE)}</span><span class="wagon"></span><span class="wagon"></span></div>`;
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
   // A small room: toys wait on the shelf, the box and chair stand on the floor.
   place(){const r=round();stage.innerHTML='<div class="room"><div class="shelf"><div class="spot"></div></div><div class="floor"></div></div>';const room=stage.firstChild;
    const item=el(obj(r.item),'toy',{'aria-label':GB.OBJ[r.item],'data-id':r.item});room.querySelector('.spot').append(item);
    const place=(it,z)=>placing(it,z,(id,prep,ref)=>id===r.item&&prep===want().prep&&ref===r.ref);room.querySelector('.floor').append(reference(r.ref,place));
    tapOrSelect(item,()=>select(selected===item?null:item));draggable(item,z=>place(item,z));},
   playroom(){stage.innerHTML='<div class="room playroom"><div class="shelf"><div class="spot"></div><div class="friends"></div></div><div class="floor"></div></div>';const room=stage.firstChild,spot=room.querySelector('.spot'),friends=room.querySelector('.friends');
    const place=(it,z)=>placing(it,z,(id,prep,ref)=>want()?.place===id&&want().prep===prep&&want().ref===ref);
    for(const ref of ['chair','box'])room.querySelector('.floor').append(reference(ref,place));
    for(const key of ['ball','cup','car']){const it=el(obj(key),'toy',{'aria-label':GB.OBJ[key],'data-id':key});tapOrSelect(it,()=>select(selected===it?null:it));draggable(it,z=>place(it,z));spot.append(it);}
    for(const key of ['bear','cat']){const b=el(obj(key),'friend-tap',{'aria-label':GB.OBJ[key],'data-id':key});b.onclick=()=>{if(selected){select(null);}if(want()?.tap===key){b.classList.remove('right');void b.offsetWidth;good(b);}else bad(b);};friends.append(b);}},
   signal(){const r=round();let shown;
    if(r.show==='light')shown=`<div class="light" aria-label="الضوء ${r.value==='green'?'أخضر':'أحمر'}" role="img"><i class="${r.value==='red'?'lit red':''}"></i><i class="${r.value==='green'?'lit green':''}"></i></div>`;
    else if(r.show==='ball')shown=`<div class="shown" role="img" aria-label="كرة ${r.value==='red'?'حمراء':'زرقاء'}">${obj('ball',r.value==='red'?'#e07a6f':'#5f9fd1')}</div>`;
    else shown=`<div class="shown" role="img" aria-label="القطة ${r.value==='in'?'داخل':'خارج'} الصندوق">${pic(r.value==='in'?P.nest(BOX_BACK,18,30,64)+P.nest(P.art('cat'),32,14,36)+P.nest(BOX_FRONT,18,30,64):P.nest(P.art('box'),40,30,58)+P.nest(P.art('cat'),2,48,40))}</div>`;
    stage.innerHTML=`<div class="signal">${shown}</div>`;SCENES.cards(shuffle(r.options),(key,b)=>want().tap===key?good(b):bad(b));},
   trip(){stage.innerHTML=`<div class="map"><svg class="trip-road" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true"><path d="M16 16H84V54H16Z" /></svg><span class="car" aria-hidden="true">${obj('car')}</span></div>`;const map=stage.firstChild,car=map.querySelector('.car');
    const spots={house:[16,22],tree:[84,22],flower:[84,78],pond:[16,78]};
    for(const [key,[x,y]]of Object.entries(spots)){const b=el(pic(PLACES[key]),'stop',{'aria-label':GB.PLACE[key],'data-id':key});Object.assign(b.style,{left:x+'%',top:y+'%'});b.onclick=()=>{if(want()?.tap===key){Object.assign(car.style,{left:x+'%',top:y+'%'});good(b);}else bad(b);};map.append(b);}}
  };
  function show(){stage.className='stage';stage.innerHTML='';drawStars();promptEl.textContent=round().prompt;selected=null;
   stage.dataset.round=round().audio;stage.tabIndex=-1;(SCENES[game.type])();say(false);stage.focus({preventScroll:true});}
  show();
  return {stop};
 }
 window.FollowGames={play,list:GB.games,art:{ENGINE,PLACES,BEAR}};
})();
