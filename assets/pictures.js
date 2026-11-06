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
 const closedBook='<path d="M28 20h44v62H28Z" fill="#9fc7af"/><path d="M36 20v62M44 34h20"/>';

 // A front-facing child. `arms` replaces the resting arms; `mark` highlights a point.
 function figure({arms,mark,extra=''}={}){
  const resting='<path d="M39 42 31 66M61 42l8 24"/>';
  return `${mark?`<circle cx="${mark[0]}" cy="${mark[1]}" r="7" fill="${MARK}" stroke="none" opacity=".75"/>`:''}<path d="M39 40h22l3 30H36Z" fill="${SHIRT}"/><path d="M44 70v25h-5m17-25v25h5"/><circle cx="50" cy="22" r="12" fill="${SKIN}"/><path d="M38.5 19c1-10 22-10 23 0"/><circle cx="45.5" cy="21" r="1.2" fill="currentColor"/><circle cx="54.5" cy="21" r="1.2" fill="currentColor"/><path d="M46 28.5q4 3 8 0"/>${arms??resting}${extra}`;
 }
 const PARTS={رأسك:[50,10],شعرك:[42,13],أنفك:[50,24.5],أذنك:[62.5,22],خدك:[56.5,27],ذقنك:[50,34],كتفك:[39,41],بطنك:[50,56],ركبتك:[56,83],قدمك:[57,95]};
 const touch=([x,y])=>figure({mark:[x,y],arms:`<path d="M39 42 31 66"/><path d="M61 42 ${y<40?72:70} ${Math.max(30,(42+y)/2)} ${x} ${y}"/><circle cx="${x}" cy="${y}" r="2.6" fill="#fff"/>`});
 const handOpen=`<g stroke-width="9"><path d="M41 52 37 27M48 50l-1-27M55 50l1-27M61 53l4-24M37 64 25 53"/></g><g stroke="${SKIN}" stroke-width="5"><path d="M41 52 37 27M48 50l-1-27M55 50l1-27M61 53l4-24M37 64 25 53"/></g><rect x="35" y="44" width="30" height="38" rx="12" fill="${SKIN}"/><path d="M42 50l-1 4M48 49v5M55 49v5"  stroke="${SKIN}" stroke-width="5"/>`;
 const fist=`<rect x="31" y="38" width="38" height="36" rx="13" fill="${SKIN}"/><path d="M41 38v11M50 38v11M59 38v11M31 58h15c4 0 4 6 0 6h-7"/>`;
 const BODY={
  clap:figure({arms:'<path d="M39 42 42 55 49 52M61 42 58 55 51 52"/>',extra:`<path d="m43 45-4-4m18 4 4-4M50 43v-5" stroke="${MARK}"/>`}),
  wave:figure({arms:'<path d="M39 42 31 66M61 42 72 32 74 18"/><circle cx="74" cy="15" r="3.4" fill="'+SKIN+'"/>',extra:`<path d="M80 10q4 5 0 10m4-13q6 8 0 16" stroke="${MARK}"/>`}),
  raise:figure({arms:'<path d="M39 42 30 26 28 10M61 42l9-16 2-16"/>',extra:`<path d="M18 30V16m-4 4 4-4 4 4M82 30V16m-4 4 4-4 4 4" stroke="${MARK}"/>`}),
  raiseOne:figure({arms:'<path d="M39 42 31 66M61 42l9-16 2-16"/><circle cx="72" cy="8" r="3.4" fill="'+SKIN+'"/>',extra:`<path d="M84 30V16m-4 4 4-4 4 4" stroke="${MARK}"/>`}),
  lower:figure({arms:'<path d="M39 42 36 70M61 42l3 28"/>',extra:`<path d="M24 52v14m-4-4 4 4 4-4M76 52v14m-4-4 4 4 4-4" stroke="${MARK}"/>`}),
  mouth:figure({mark:[50,29],extra:'<ellipse cx="50" cy="29" rx="3" ry="2.6" fill="#fff"/>'}),
  smile:figure({mark:[50,28],extra:'<path d="M44 27q6 6 12 0" stroke-width="3"/>'}),
  self:figure({mark:[50,50],arms:'<path d="M39 42 31 66M61 42l7 12-15-4"/>'}),
  table:figure({arms:'<path d="M39 42 37 60M61 42l2 18"/>',extra:'<path d="M18 61h64M24 61v34m52-34v34" stroke-width="4"/>'}),
  open:handOpen,
  close:fist
 };
 const ACTIONS={'صفق':'clap','صفق بيديك':'clap','لوح':'wave','لوح بيدك':'wave','ارفع يديك':'raise','ارفعها':'raiseOne','أنزل يديك':'lower','أنزلهما':'lower','افتح فمك':'mouth','ابتسم':'smile','أشر إلى نفسك':'self','ضع يديك على الطاولة':'table','افتح يدك':'open','أغلق يدك':'close','أغلقها':'close'};
 const PREPS={داخل:'in',في:'in',فوق:'on',تحت:'under',بجانب:'beside',أمام:'front',خلف:'behind',خارج:'out'};
 const arrow=d=>`<path d="${d}" stroke="${MARK}" stroke-width="3.5"/>`;
 // X placed relative to Y; `moving` adds the arrow that shows the action.
 function scene(x,prep,y,moving=true,colorX){
  const X=art(x,colorX),Y=art(y);
  switch(prep){
   case 'in':return nest(Y,22,34,56)+nest(X,38,46,24)+(moving?arrow('M50 6v22m-6-6 6 6 6-6'):'');
   case 'on':return nest(Y,22,40,56)+nest(X,36,8,28)+(moving?arrow('M16 10v20m-5-5 5 5 5-5'):'');
   case 'under':return nest(Y,20,6,60)+nest(X,37,66,28)+(moving?arrow('M14 60v24m-5-5 5 5 5-5'):'');
   case 'beside':return nest(Y,42,26,54)+nest(X,6,50,32);
   case 'front':return nest(Y,26,12,52)+nest(X,32,48,40);
   case 'behind':return nest(X,44,6,30)+`<rect x="26" y="30" width="52" height="52" rx="6" fill="#fff" stroke="none"/>`+nest(Y,24,28,56);
   case 'out':return nest(Y,44,32,52)+nest(X,4,54,30)+(moving?arrow('M48 44 30 54m2-8-2 8 8 1'):'');
  }
  throw Error('Unknown position '+prep);
 }
 const between=(x,a,b)=>nest(art(a),2,44,30)+nest(art(b),68,44,30)+`<circle cx="50" cy="58" r="17" fill="${MARK}" stroke="none" opacity=".35"/>`+nest(art(x),36,42,28);
 const give=x=>nest(art(x),2,22,44)+arrow('M48 50h14m-5-5 5 5-5 5')+nest(handOpen,60,24,40);
 const count=(x,n)=>Array.from({length:n},(_,i)=>nest(art(x),(100-n*32)/2+i*32,30,32)).join('');
 const noun=word=>{const key=objects.get(word);if(!key)throw Error('Unknown object '+word);return key;};
 const WORDS='(ال[^\\s،]+(?: الأسنان)?)';

 // One action: a body movement, giving a toy, or placing a toy. `ctx` remembers "it".
 function action(text,ctx){
  if(ACTIONS[text])return BODY[ACTIONS[text]];
  let m=text.match(/^المس (\S+)$/);if(m&&PARTS[m[1]])return touch(PARTS[m[1]]);
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
 const api={describe,art,strip,svg,nest,COLORS,BODY,PARTS};
 if(typeof module!=='undefined')module.exports=api;else root.FollowPictures=api;
})(globalThis);
