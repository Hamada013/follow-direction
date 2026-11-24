((root)=>{
 'use strict';
 // Picture cards for spoken directions: one drawing per step, built from the direction's own words.
 // Every observed direction in the bank must be drawable; tests/pictures.cjs checks this.
 const bank=root.FollowBank||(typeof require!=='undefined'?require('./bank.js'):null);
 const SKIN='#fbe3cc',SHIRT='#cfe6f4',MARK='#f2b84b';
 const COLORS={حمراء:'#d98b84',زرقاء:'#6fa3cc',صفراء:'#e9c25a',خضراء:'#82b39f'};
 const strip=s=>String(s).replace(/[ً-ْٰ]/g,'').replace(/[.。]+$/,'').trim();
 const nest=(drawing,x,y,w)=>`<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="0 0 100 100">${drawing}</svg>`;
 const objects=new Map(Object.entries(bank.objects).map(([key,o])=>['ال'+strip(o.label),key]));
 const art=(key,color)=>{const d=bank.objects[key].drawing;return color?d.replace(/fill="#[0-9a-f]{3,6}"/i,`fill="${color}"`):d;};
 const closedBook='<path d="M26 14h46a4 4 0 0 1 4 4v66a4 4 0 0 1-4 4H26Z" fill="#5fae86"/><path d="M26 14h10v74H26Z" fill="#1d3b50" opacity=".15" stroke="none"/><rect x="44" y="28" width="22" height="12" rx="2" fill="#fffdf6"/><path d="M72 22v58" stroke="#fff" stroke-width="3" opacity=".5"/>';
 // The box splits into the part behind a toy (inside and flaps) and the part in front (its face),
 // so a toy placed inside peeks out of it. Other objects have nothing behind.
 const layers=key=>{const d=art(key);if(key!=='box')return ['',d];const parts=d.match(/<[^>]+\/>/g);return [parts.slice(1,3).join(''),parts[0]+parts.slice(3).join('')];};

 // Picture cards are drawn big and bold for small cards (104–200 px), and they move like a model
 // prompt: a frame shows the start, then the action happens and the end holds. The resting look of
 // every card is its end frame, so with reduced motion (animation off) the card still shows the action.
 // Classes used by the animation (assets/games.css): .pa start frame, .pb end frame, .pf/.pg two frames
 // that alternate (clap, wave), .pm a piece that moves from --dx/--dy to its place, .pt a pointing hand
 // that taps, .pk a glow on the part to touch.
 const PANTS='#7fa7c9',HAIR='#3d5566',CHEEK='#f0a39a';
 const swap=(from,to)=>`<g class="pa">${from}</g><g class="pb">${to}</g>`;
 const flip=(one,two)=>`<g class="pf">${one}</g><g class="pg">${two}</g>`;
 const moving=(dx,dy,body)=>`<g class="pm" style="--dx:${dx}px;--dy:${dy}px">${body}</g>`;
 const glow=(x,y,r=8)=>`<circle class="pk" cx="${x}" cy="${y}" r="${r}" fill="${MARK}" fill-opacity=".6" stroke="${MARK}" stroke-width="2"/>`;
 // Thick limbs: a dark outline with a coloured core.
 const limb=(d,color=SKIN)=>`<path d="${d}" stroke-width="9"/><path d="${d}" stroke="${color}" stroke-width="5.5"/>`;
 const hand=(x,y)=>`<circle cx="${x}" cy="${y}" r="4.6" fill="${SKIN}"/>`;
 const arm=(d,[x,y])=>limb(d)+hand(x,y);
 // A pointing hand whose fingertip is at (x,y); the hand lies along angle a (0 = below the tip).
 // A pointing hand whose fingertip is at (x,y): the index finger, then the closed hand with its thumb.
 // The hand lies along angle a (0 = straight below the tip).
 const pointer=(x,y,a)=>`<g transform="translate(${x} ${y}) rotate(${a})"><g class="pt"><path d="M-3.4 3a3.4 3.4 0 0 1 6.8 0v13h-6.8Z" fill="${SKIN}"/><rect x="-8" y="13" width="17" height="15" rx="6" fill="${SKIN}"/><path d="M-8 16.5c-5 0-6 6-1 6.5" fill="${SKIN}"/><path d="M3.4 18.5h5.6M3.4 23h5.6" stroke-width="1.8"/></g></g>`;
 const REST=[arm('M39 46 33 66',[32,69]),arm('M61 46l6 20',[68,69])];
 // A front-facing child: big head, short body, thick arms and legs.
 function figure({arms=REST.join(''),legs,face='',mark='',extra='',under=''}={}){
  const lg=legs??(limb('M45 70v21',PANTS)+limb('M55 70v21',PANTS)+'<ellipse cx="43" cy="94" rx="6" ry="3.4" fill="'+HAIR+'"/><ellipse cx="57" cy="94" rx="6" ry="3.4" fill="'+HAIR+'"/>');
  return `${under}${lg}<path d="M38 44q12-5 24 0l3 28H35Z" fill="${SHIRT}"/>${mark}<circle cx="35.5" cy="24" r="3.6" fill="${SKIN}"/><circle cx="64.5" cy="24" r="3.6" fill="${SKIN}"/><circle cx="50" cy="24" r="15" fill="${SKIN}"/><path d="M35.5 21c0-14 29-14 29 0-6-6-23-6-29 0Z" fill="${HAIR}"/><circle cx="44.5" cy="25" r="1.7" fill="currentColor" stroke="none"/><circle cx="55.5" cy="25" r="1.7" fill="currentColor" stroke="none"/>${face||'<path d="M45.5 31q4.5 3.5 9 0"/>'}${arms}${extra}`;
 }
 // A big face for the parts of the head, so nose, ear, cheek, chin and hair are each easy to see.
 function face({mouth,extra='',mark=''}={}){
  return `<circle cx="18" cy="56" r="8" fill="${SKIN}"/><circle cx="82" cy="56" r="8" fill="${SKIN}"/><path d="M18 52q-3 4 0 8M82 52q3 4 0 8" stroke-width="2"/><path d="M50 84c-20 0-31-14-31-30s13-30 31-30 31 14 31 30-11 30-31 30Z" fill="${SKIN}"/>${mark}<path d="M19 50c-2-24 18-34 31-34s34 8 31 34c-6-10-18-15-31-15s-25 5-31 15Z" fill="${HAIR}"/><circle cx="39" cy="52" r="3.4" fill="currentColor" stroke="none"/><circle cx="61" cy="52" r="3.4" fill="currentColor" stroke="none"/><circle cx="40.2" cy="50.8" r="1.1" fill="#fff" stroke="none"/><circle cx="62.2" cy="50.8" r="1.1" fill="#fff" stroke="none"/><circle cx="32" cy="65" r="5" fill="${CHEEK}" opacity=".55" stroke="none"/><circle cx="68" cy="65" r="5" fill="${CHEEK}" opacity=".55" stroke="none"/><path d="M50 56q-4 6 0 8h3" stroke-width="2.4"/>${mouth??'<path d="M42 71q8 6 16 0"/>'}${extra}`;
 }
 // The parts of the head: where the glow sits and where the fingertip lands (with the hand's angle).
 const FACE={رأسك:{at:[50,24],tip:[54,20],a:195,r:9},شعرك:{at:[36,32],tip:[36,31],a:145,r:9},أنفك:{at:[51,60],tip:[52,62],a:-40,r:6},
  أذنك:{at:[82,56],tip:[84,58],a:-55,r:8},خدك:{at:[68,65],tip:[69,67],a:-45,r:7},ذقنك:{at:[50,82],tip:[53,84],a:-65,r:7}};
 // The parts of the body: the glow, the arm that reaches it (shoulder, elbow, hand) and a leg pose.
 const POSE={
  كتفك:{at:[61,47],arm:'M39 46 47 58 58 49',hand:[59,48]},
  بطنك:{at:[50,60],arm:'M61 46 67 58 55 61',hand:[54,61]},
  ركبتك:{at:[57,79],arm:'M61 46 67 62 59 77',hand:[58,78],legs:limb('M45 70v21',PANTS)+limb('M55 70 62 80 57 91',PANTS)+`<ellipse cx="43" cy="94" rx="6" ry="3.4" fill="${HAIR}"/><ellipse cx="59" cy="94" rx="6" ry="3.4" fill="${HAIR}"/>`},
  قدمك:{at:[72,88],arm:'M61 46 70 64 72 84',hand:[72,85],legs:limb('M45 70v21',PANTS)+limb('M55 70 64 82 70 88',PANTS)+`<ellipse cx="43" cy="94" rx="6" ry="3.4" fill="${HAIR}"/><ellipse cx="75" cy="89" rx="6" ry="3.4" fill="${HAIR}"/>`}
 };
 const PARTS={...Object.fromEntries(Object.entries(FACE).map(([k,v])=>[k,v.at])),...Object.fromEntries(Object.entries(POSE).map(([k,v])=>[k,v.at]))};
 function touch(part){
  const f=FACE[part];if(f)return `<g transform="translate(11 12) scale(.8)">${face({mark:glow(...f.at,f.r)})}${pointer(...f.tip,f.a)}</g>`;
  const p=POSE[part];return figure({legs:p.legs,mark:glow(...p.at,8.5),arms:REST[0]+swap(REST[1],arm(p.arm,p.hand))});
 }
 const OPEN=`<g stroke-width="9"><path d="M41 52 37 27M48 50l-1-27M55 50l1-27M61 53l4-24M37 64 25 53"/></g><g stroke="${SKIN}" stroke-width="5"><path d="M41 52 37 27M48 50l-1-27M55 50l1-27M61 53l4-24M37 64 25 53"/></g><rect x="35" y="44" width="30" height="38" rx="12" fill="${SKIN}"/><path d="M42 50l-1 4M48 49v5M55 49v5"  stroke="${SKIN}" stroke-width="5"/>`;
 const FIST=`<rect x="31" y="38" width="38" height="36" rx="13" fill="${SKIN}"/><path d="M41 38v11M50 38v11M59 38v11M31 58h15c4 0 4 6 0 6h-7"/>`;
 const UP=arm('M39 46 31 30 29 14',[29,11])+arm('M61 46l8-16 2-16',[71,11]);
 const BODY={
  clap:figure({arms:flip(arm('M39 46 30 54 24 50',[22,49])+arm('M61 46l9 8 6-4',[78,49]),arm('M39 46 41 58 47 52',[47.5,51])+arm('M61 46 59 58 53 52',[52.5,51])+`<path d="M43 44l-4-5m18 5 4-5M50 43v-6" stroke="${MARK}" stroke-width="3"/>`)}),
  wave:figure({arms:REST[0]+flip(arm('M61 46 72 34 70 18',[70,15]),arm('M61 46 72 34 78 19',[79,16]))+`<path d="M84 8q5 6 0 12m5-15q8 9 0 18" stroke="${MARK}" stroke-width="3"/>`}),
  raise:figure({arms:swap(REST.join(''),UP)}),
  raiseOne:figure({arms:REST[0]+swap(REST[1],arm('M61 46l8-16 2-16',[71,11]))}),
  lower:figure({arms:swap(UP,REST.join(''))}),
  mouth:face({mouth:swap('<path d="M43 71h14"/>','<ellipse cx="50" cy="72" rx="7" ry="6" fill="#9b3d3d"/><path d="M45 75q5-3 10 0q-5 3-10 0Z" fill="#ef8f8f" stroke="none"/>')}),
  smile:face({mouth:swap('<path d="M43 72h14"/>','<path d="M40 69q10 11 20 0Z" fill="#fff"/>')}),
  self:figure({mark:glow(50,56,8),arms:REST[0]+swap(REST[1],arm('M61 46 68 58 55 56',[54,56]))}),
  table:figure({under:'',arms:swap(arm('M39 46 30 54',[28,56])+arm('M61 46l9 8',[72,56]),arm('M39 46 36 66',[35,68])+arm('M61 46l3 20',[65,68])),extra:'<path d="M14 70h72" stroke-width="5"/><path d="M20 70v26m60-26v26" stroke-width="4.5"/>'}),
  open:swap(FIST,OPEN),
  close:swap(OPEN,FIST)
 };
 const ACTIONS={'صفق':'clap','صفق بيديك':'clap','لوح':'wave','لوح بيدك':'wave','ارفع يديك':'raise','ارفعها':'raiseOne','أنزل يديك':'lower','أنزلهما':'lower','افتح فمك':'mouth','ابتسم':'smile','أشر إلى نفسك':'self','ضع يديك على الطاولة':'table','افتح يدك':'open','أغلق يدك':'close','أغلقها':'close'};
 const PREPS={داخل:'in',في:'in',فوق:'on',تحت:'under',بجانب:'beside',أمام:'front',خلف:'behind',خارج:'out'};
 // X placed relative to Y. When the card shows an action (`move`), X travels to its place.
 function scene(x,prep,y,move=true,colorX){
  const X=art(x,colorX),Y=art(y),go=(dx,dy,body)=>move?moving(dx,dy,body):body;
  switch(prep){
   case 'in':{const [back,front]=layers(y);return nest(back,22,34,56)+go(0,-34,nest(X,36,40,28))+nest(front,22,34,56);}
   case 'on':return nest(Y,22,40,56)+go(-26,-22,nest(X,34,28,32));
   case 'under':return go(-40,0,nest(X,37,60,26))+nest(Y,16,10,70);
   case 'beside':return nest(Y,42,26,54)+go(0,-30,nest(X,6,50,32));
   case 'front':return nest(Y,26,12,52)+go(0,18,nest(X,32,48,40));
   case 'behind':return go(-30,0,nest(X,44,6,30))+`<rect x="26" y="30" width="52" height="52" rx="6" fill="#fff" stroke="none"/>`+nest(Y,24,28,56);
   case 'out':return nest(Y,44,32,52)+go(30,-14,nest(X,4,54,30));
  }
  throw Error('Unknown position '+prep);
 }
 const between=(x,a,b)=>nest(art(a),2,44,30)+nest(art(b),68,44,30)+`<circle cx="50" cy="58" r="17" fill="${MARK}" stroke="none" opacity=".35"/>`+moving(0,-34,nest(art(x),36,42,28));
 const give=x=>`<g transform="translate(46 0)">${nest(OPEN,14,24,40)}</g>`+moving(-30,0,nest(art(x),26,26,40));
 const count=(x,n)=>Array.from({length:n},(_,i)=>nest(art(x),(100-n*32)/2+i*32,30,32)).join('');
 const noun=word=>{const key=objects.get(word);if(!key)throw Error('Unknown object '+word);return key;};
 const WORDS='(ال[^\\s،]+(?: الأسنان)?)';

 // One action: a body movement, giving a toy, or placing a toy. `ctx` remembers "it".
 function action(text,ctx){
  if(ACTIONS[text])return BODY[ACTIONS[text]];
  let m=text.match(/^المس (\S+)$/);if(m&&PARTS[m[1]])return touch(m[1]);
  m=text.match(new RegExp('^أعطني '+WORDS+'$'));if(m){const x=noun(m[1]);ctx.it=x;return give(x);}
  m=text.match(new RegExp('^ضع '+WORDS+' بين '+WORDS+' و'+WORDS+'$'));if(m)return between(noun(m[1]),noun(m[2]),noun(m[3]));
  m=text.match(new RegExp('^ضع(ها|ه)?(?: '+WORDS+')? (\\S+) '+WORDS+'$'));
  if(m&&PREPS[m[3]]){const x=m[2]?noun(m[2]):ctx.it;if(!x)throw Error('No object for '+text);ctx.it=x;return scene(x,PREPS[m[3]],noun(m[4]));}
  throw Error('Unknown action '+text);
 }
 // A condition the child can see: a colour, a position, a number, or an open/closed book.
 function condition(text,ctx){
  let m=text.match(new RegExp('^كانت? '+WORDS+' (حمراء|زرقاء|صفراء|خضراء)$'));if(m){const x=noun(m[1]);Object.assign(ctx,{it:x,ref:null});return nest(art(x,COLORS[m[2]]),18,18,64);}
  m=text.match(/^كانت? (حمراء|زرقاء|صفراء|خضراء)$/);if(m&&ctx.it)return nest(art(ctx.it,COLORS[m[1]]),18,18,64);
  m=text.match(new RegExp('^كانت? '+WORDS+' (\\S+) '+WORDS+'$'));if(m&&PREPS[m[2]]){const x=noun(m[1]),y=noun(m[3]);Object.assign(ctx,{it:x,ref:y});return scene(x,PREPS[m[2]],y,false);}
  m=text.match(/^كانت? (تحته|خارجه|فوقه|داخله)$/);if(m&&ctx.it&&ctx.ref)return scene(ctx.it,PREPS[m[1].slice(0,-1)],ctx.ref,false);
  m=text.match(/^كانت? هناك (\S+)(?: واحدة)?$/);
  if(m){const word=m[1];if(word==='كوبان'){ctx.it='cup';return count('cup',2);}const x=noun('ال'+word);ctx.it=x;return count(x,1);}
  m=text.match(/^كان(?: الكتاب)? (مفتوحا|مغلقا)$/);if(m&&(text.includes('الكتاب')||ctx.it==='book')){ctx.it='book';return m[1]==='مفتوحا'?nest(art('book'),14,14,72):nest(closedBook,14,14,72);}
  throw Error('Unknown condition '+text);
 }
 const svg=body=>`<svg class="picture" viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
 // Returns either ordered steps or "if … then …" branches, each with its own words.
 function describe(prompt){
  const text=String(prompt).trim(),ctx={};
  if(strip(text).startsWith('إذا')){
   const branches=text.split(/\.\s*/).filter(Boolean).map(clause=>{
    const m=clause.trim().match(/^(و?إذا [^،]+)،\s*(.+)$/);if(!m)throw Error('Unknown condition '+clause);
    const when=strip(m[1]).replace(/^و?إذا /,'');
    return {when:{svg:svg(condition(when,ctx)),text:m[1].trim()},then:{svg:svg(action(strip(m[2]),ctx)),text:m[2].trim()}};
   });
   return {type:'condition',branches};
  }
  const parts=text.replace(/[.]+$/,'').split(/،\s*ثم\s*/);
  return {type:'steps',steps:parts.map(part=>({svg:svg(action(strip(part),ctx)),text:part.trim()}))};
 }
 const api={describe,art,layers,strip,svg,nest,COLORS,BODY,PARTS,FACE};
 if(typeof module!=='undefined')module.exports=api;else root.FollowPictures=api;
})(globalThis);
