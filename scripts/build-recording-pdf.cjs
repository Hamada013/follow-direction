'use strict';
// Builds output/recording-script.pdf: a printable checklist for recording assets/audio/*.mp3.
// It reads the same banks as the app and MAPPING.txt, so it always matches the current prompts.
// Needs Google Chrome (set CHROME=/path/to/chrome to use another Chromium build).
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output');
const bank=require(path.join(root,'assets/bank.js')),{games,PRAISE}=require(path.join(root,'assets/game-bank.js'));
const chrome=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Sections in recording order. Directions are grouped by skill so similar sentences are read together.
const sections=[
 ...bank.groups.map(g=>({part:'directions',title:g.label,rows:g.items.slice().sort((a,b)=>a.audio-b.audio).map(i=>({audio:i.audio,prompt:i.prompt,screen:i.phase==='screen'}))})),
 ...games.map(g=>({part:'games',title:'لعبة: '+g.title,rows:g.rounds.map(r=>({audio:r.audio,prompt:r.prompt}))})),
 {part:'praise',title:'مديح: شاشة «أحسنت!» في نهاية اللعبة واليوم',rows:[{audio:PRAISE.audio,prompt:PRAISE.prompt}]}
];
// A repeated sentence in the same part is recorded once and the file copied. Games are read in a
// livelier voice than directions, so a game round is never a copy of a direction.
const first=new Map();let unique=0,total=0;
for(const s of sections)for(const r of s.rows){total++;const key=s.part+'|'+r.prompt;if(first.has(key))r.copy=first.get(key);else{first.set(key,r.audio);unique++;}}

const intro={
 directions:['التعليمات (<bdi dir="ltr">001–253</bdi>)','صوت هادئ وطبيعي، كأنك تكلّم الطفل وجهًا لوجه.'],
 games:['الألعاب (<bdi dir="ltr">301</bdi> وما بعدها)','صوت مرح وواضح، أبطأ قليلًا من الكلام العادي.'],
 praise:['المديح (<bdi dir="ltr">900</bdi>)','صوت دافئ وفرِح، قصير.']
};
let lastPart='';
const body=sections.map(s=>{
 let head='';if(s.part!==lastPart){lastPart=s.part;head=`<h2>${intro[s.part][0]}<small>${esc(intro[s.part][1])}</small></h2>`;}
 return head+`<section><h3>${esc(s.title)}</h3><table>${s.rows.map(r=>`<tr class="${r.copy?'copy':''}"><td class="box"><span></span></td><td class="num">${r.audio}</td><td class="say">${esc(r.prompt)}</td><td class="note">${r.copy?`انسخ ملف ${r.copy}`:r.screen?'<b>فرز</b>':''}</td></tr>`).join('')}</table></section>`;
}).join('');

const html=`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>نص التسجيل</title><style>
@page{size:A4;margin:14mm 14mm 16mm}
*{box-sizing:border-box}
body{margin:0;font-family:"Geeza Pro","Damascus","Arial Unicode MS",sans-serif;color:#1b2a33;font-size:10.5pt;line-height:1.5}
h1{font-size:20pt;margin:0 0 2mm}
.lead{margin:0 0 4mm;color:#4a5a64}
.how{border:1px solid #c9d3d9;border-radius:3mm;padding:3mm 5mm;margin:0 0 4mm;background:#f5f8fa}
.how ol{margin:0;padding-inline-start:5mm}.how li{margin:1mm 0}
.how code{direction:ltr;unicode-bidi:embed;font-family:Menlo,monospace;font-size:9.5pt;background:#fff;border:1px solid #d6dde2;border-radius:1mm;padding:0 1mm}
.count{display:flex;gap:6mm;margin:0 0 2mm;font-weight:600}
.count span{border:1px solid #c9d3d9;border-radius:2mm;padding:1.5mm 4mm}
h2{font-size:14pt;margin:7mm 0 1mm;padding-bottom:1mm;border-bottom:2px solid #1b2a33;break-after:avoid}
h2 small{display:block;font-size:10pt;font-weight:400;color:#4a5a64}
h3{font-size:11.5pt;margin:4mm 0 1mm;color:#2c5d7a;break-after:avoid}
table{width:100%;border-collapse:collapse}
tr{break-inside:avoid}
td{border-bottom:1px solid #e3e8eb;padding:1.6mm 1.5mm;vertical-align:middle}
td.box{width:8mm}td.box span{display:block;width:4.5mm;height:4.5mm;border:1.3px solid #1b2a33;border-radius:.8mm}
td.num{width:13mm;direction:ltr;text-align:center;font-family:Menlo,monospace;font-size:10pt;font-weight:700}
td.say{font-size:15pt;line-height:1.35}
td.note{width:26mm;font-size:9pt;color:#4a5a64;text-align:left}
td.note b{border:1px solid #2c5d7a;color:#2c5d7a;border-radius:1mm;padding:0 1.5mm;font-weight:600}
tr.copy td.say{color:#8a979f}tr.copy td.box span{border-style:dashed;border-color:#8a979f}
</style></head><body>
<h1>نص تسجيل الصوت — اتبع التعليمات</h1>
<p class="lead">ضع علامة في المربع بعد حفظ كل ملف. الرقم هو اسم الملف.</p>
<div class="count"><span>${unique} جملة للتسجيل</span><span>${total-unique} ملفًا يُنسخ فقط</span><span>${total} ملفًا في المجموع</span></div>
<div class="how"><ol>
<li>غرفة هادئة، والهاتف أو الميكروفون على بعد شبر من الفم، بالمسافة نفسها في كل الجلسات.</li>
<li>اقرأ الجملة كما هي مكتوبة، مرة واحدة، دون إضافة كلمات مثل «هيا» أو «الآن»، ودون ذكر الأجوبة.</li>
<li>اترك نصف ثانية صمت قبل الكلام وبعده، ثم قصّ الزائد.</li>
<li>احفظ كل تسجيل باسم رقمه فقط، مثل <code>001.mp3</code> و<code>301.mp3</code>، داخل المجلد <code>assets/audio/</code>.</li>
<li>السطر الرمادي جملة مكررة: لا تسجّلها، بل انسخ الملف المكتوب بجانبها وأعد تسميته برقم السطر.</li>
<li>كلمة <b>فرز</b> تعني أن الجملة تُستخدم في التقييم: اقرأها بأوضح وأهدأ صوت.</li>
<li>بعد إضافة الملفات شغّل <code>npm run build</code> ليظهر الصوت في التطبيق. يمكن إضافة الملفات على دفعات.</li>
</ol></div>
${body}
</body></html>`;

fs.mkdirSync(out,{recursive:true});
const htmlFile=path.join(out,'recording-script.html'),pdfFile=path.join(out,'recording-script.pdf');
fs.writeFileSync(htmlFile,html);
if(!fs.existsSync(chrome))throw Error('Chrome not found; set CHROME to a Chromium executable. HTML written to '+htmlFile);
cp.execFileSync(chrome,['--headless','--disable-gpu','--no-pdf-header-footer','--generate-pdf-document-outline','--print-to-pdf='+pdfFile,'file://'+htmlFile],{stdio:'ignore'});
console.log(`Recording script: ${pdfFile} · ${unique} to record, ${total-unique} copies, ${total} files`);
