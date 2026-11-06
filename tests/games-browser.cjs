'use strict';
// Plays every mini-game to the end with taps, finger drags and tap-then-tap placement,
// then walks the first day of the daily plan, including the next-day lock and the adult unlock.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const playwright=require(process.env.APP_PLAYWRIGHT||'playwright');
const GB=require('../assets/game-bank.js'),root=path.resolve(__dirname,'..'),engine=process.env.APP_ENGINE||'chromium',[vw,vh]=(process.env.APP_VIEWPORT||'1024x768').split('x').map(Number);
const types={js:'text/javascript',css:'text/css',html:'text/html',webp:'image/webp',png:'image/png',webmanifest:'application/manifest+json'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://local').pathname);if(p.endsWith('/'))p+='index.html';const file=path.join(root,p);if(!file.startsWith(root)){res.writeHead(403).end();return;}fs.readFile(file,(e,body)=>{if(e){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':types[p.split('.').pop()]||'application/octet-stream'});res.end(body);});});
const rounds=new Map(GB.games.flatMap(g=>g.rounds.map(r=>[r.audio,{...r,type:g.type}])));
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await playwright[engine].launch(engine==='chromium'?{headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{headless:true});
  const context=await browser.newContext({viewport:{width:vw,height:vh},hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.locator('#child-name').fill('سما');await page.getByRole('button',{name:'دخول',exact:true}).click();
  const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  let dragTurn=0;
  async function drag(from,to){const a=await from.boundingBox(),b=await to.boundingBox();await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(a.x+a.width/2+12,a.y+a.height/2+12,{steps:3});await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.up();}
  async function place(item,zone){if(dragTurn++%2)await drag(item,zone);else{await item.click();await zone.click();}}
  const OBJ=GB.OBJ,PREP={in:'داخل',on:'فوق',under:'تحت',beside:'بجانب'};
  async function playRound(){
   await noOverflow();const stage=page.locator('.stage'),id=await stage.getAttribute('data-round'),r=rounds.get(id);assert.ok(r,'Known round '+id);
   for(const s of r.steps){
    if(r.type==='bear'){await stage.getByRole('button',{name:GB.PART[s.tap]+' الدب',exact:true}).click();}
    else if(r.type==='balloons'){const o=r.options[s.tap];await stage.getByRole('button',{name:`بالون ${GB.COLOR[o.color][0]} ${o.size==='large'?'كبير':'صغير'}`,exact:true}).first().click();}
    else if(r.type==='feed'){const fruit=stage.locator('.tray .fruit');for(let i=0;i<s.count;i++)await fruit.first().click();await stage.getByRole('button',{name:'تم العدّ'}).click();}
    else if(r.type==='need'){await place(stage.locator(`.card-choice[data-id="${s.give}"]`),stage.getByRole('button',{name:'أعطِ الدب'}));}
    else if(s.place){await place(stage.locator(`.spot [data-id="${s.place}"]`),stage.getByRole('button',{name:`${PREP[s.prep]} ${OBJ[s.ref||r.ref]}`,exact:true}));}
    else if(r.type==='trip'){await stage.getByRole('button',{name:GB.PLACE[s.tap],exact:true}).click();}
    else await stage.locator(`[data-id="${s.tap}"]`).first().click();
   }
   await page.waitForFunction(old=>document.querySelector('.game-done')||document.querySelector('.stage')?.dataset.round!==old,id);
  }
  await page.getByRole('button',{name:'الألعاب',exact:true}).click();
  for(const g of GB.games){
   await page.locator('.game-card',{hasText:g.title}).first().click();await page.locator('.stage').waitFor();
   if(g.type==='find'){// A wrong choice shakes and does not advance the round.
    const id=await page.locator('.stage').getAttribute('data-round'),r=rounds.get(id),wrong=r.options.find(o=>o!==r.steps[0].tap);
    await page.locator(`.stage [data-id="${wrong}"]`).click();assert.equal(await page.locator('.stage').getAttribute('data-round'),id);assert.equal(await page.locator('.game-stars .on').count(),0);}
   for(let i=0;i<GB.ROUNDS_PER_PLAY;i++)await playRound();
   await page.locator('.game-done').waitFor();await noOverflow();await page.getByRole('button',{name:'تم',exact:true}).click();await page.locator('.game-grid').waitFor();
  }
  const played=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('follow-direction-children-v1'));return d.children.find(c=>c.id===d.active).games;});
  assert.equal(played.length,GB.games.length);assert.ok(played.every(g=>g.rounds===5&&g.firstTry<=5));
  assert.equal(played.find(g=>g.group==='objects').firstTry,4,'The round with a wrong first tap is not a first-try success');

  // Day 1 of the plan: five practice directions, picture help recorded as help, then the day's game.
  await page.getByRole('button',{name:'الرئيسية',exact:true}).click();await page.getByRole('button',{name:'ابدأ تمرين اليوم',exact:true}).click();
  await page.getByRole('button',{name:'عرض بطاقات مصوّرة (مساعدة)'}).click();await page.locator('.pic-card').first().waitFor();
  for(let i=0;i<5;i++)await page.getByRole('button',{name:'استجابة مستقلة',exact:true}).click();
  const day=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('follow-direction-children-v1')),s=d.children.find(c=>c.id===d.active).sessions.at(-1);return {n:s.items.length,day:s.day,first:s.results[0].outcome,rest:s.results.slice(1).map(r=>r.outcome)};});
  assert.deepEqual(day,{n:5,day:0,first:'help',rest:['independent','independent','independent','independent']});
  await page.locator('.day-step.now').click();for(let i=0;i<GB.ROUNDS_PER_PLAY;i++)await playRound();await page.getByRole('button',{name:'تم',exact:true}).click();
  await page.getByRole('heading',{name:'اتبع التعليمات',exact:true}).waitFor();await page.getByRole('button',{name:'تم',exact:true}).click();
  assert.match(await page.locator('.today').innerText(),/غدًا/);
  await page.getByRole('button',{name:'الطريق',exact:true}).click();await noOverflow();
  await page.getByRole('button',{name:/^اليوم 2:/}).click();await page.getByRole('button',{name:'فتح اليوم (للأهل)'}).click();
  await page.locator('#parent-gate[open]').waitFor();const answer=await page.locator('#parent-gate').evaluate(d=>{const a=+d.querySelector('[data-left]').textContent,b=+d.querySelector('[data-right]').textContent;return d.querySelector('[data-operation]').textContent==='−'?a-b:a+b;});await page.locator(`#parent-gate [data-answer="${answer}"]`).click();
  await page.getByRole('heading',{name:'اليوم ٢',exact:true}).waitFor();assert.equal(await page.locator('.day-step').count(),3);
  // The report shows the plan, practice and play.
  await page.locator('#toolbar').getByRole('button',{name:'التقرير',exact:true}).click();
  assert.match(await page.locator('.overview').innerText(),/1\/12|١\/١٢/);assert.equal(await page.locator('.profile-row:not(.head)').count(),11);await noOverflow();
  await page.setViewportSize({width:390,height:844});await noOverflow();
  assert.deepEqual(errors,[]);
  console.log(`${engine}: all ${GB.games.length} mini-games, drag and tap placement, daily plan lock and adult unlock passed`);
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
