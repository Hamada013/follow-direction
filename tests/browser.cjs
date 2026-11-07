const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const playwright=require(process.env.APP_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),engine=process.env.APP_ENGINE||'chromium';let serverOffline=false;
(async()=>{
 const server=http.createServer((req,res)=>{if(serverOffline){req.socket.destroy();return;}const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname),file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,body)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'html':'text/html','js':'text/javascript','css':'text/css','json':'application/json','webmanifest':'application/manifest+json','png':'image/png','webp':'image/webp'})[path.extname(file).slice(1)]||'application/octet-stream');res.end(body);});});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;try{
 browser=await playwright[engine].launch(engine==='chromium'?{headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=`http://127.0.0.1:${server.address().port}/`;
 await page.goto(base);await page.locator('#child-name').fill('نور');await page.getByRole('button',{name:'دخول',exact:true}).click();
 assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
 const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 await noOverflow();await page.setViewportSize({width:320,height:568});await noOverflow();await page.setViewportSize({width:390,height:844});await page.screenshot({path:`/private/tmp/follow-direction-home-${engine}.png`});
 await page.getByRole('button',{name:'الفرز',exact:true}).click();await page.getByRole('button',{name:'ابدأ',exact:true}).click();
 await page.getByRole('button',{name:'تكرار أو إعادة المحاولة (مساعدة)',exact:true}).click();await page.getByRole('button',{name:'استجابة مستقلة',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:'متابعة الجلسة',exact:true}).click();await page.locator('.task').waitFor();
 assert.match(await page.locator('.task-top').innerText(),/2 \/ 33/);
 await page.screenshot({path:`/private/tmp/follow-direction-task-${engine}.png`});
 for(let step=0;step<32;step++){
  const item=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('follow-direction-children-v1')),s=d.children.find(c=>c.id===d.active).sessions.find(s=>!s.ended);return FollowBank.items.find(i=>i.id===s.items[s.results.length]);});
  if(item.kind==='observe')await page.getByRole('button',{name:'استجابة مستقلة',exact:true}).click();else {for(const key of item.answer)await page.locator('.option').nth(item.options.indexOf(key)).click();await page.getByRole('button',{name:'تسجيل والمتابعة',exact:true}).click();}
 }
 await page.getByRole('heading',{name:'التقرير',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'تصدير التقرير',exact:true}).count(),0);assert.match(await page.locator('.report-summary').innerText(),/32/);await noOverflow();await page.screenshot({path:`/private/tmp/follow-direction-report-${engine}.png`});
 await page.getByRole('button',{name:'الرئيسية',exact:true}).click();await page.getByRole('button',{name:'التدريب',exact:true}).click();assert.equal(await page.locator('.skill.passed').count(),10);
 await page.getByRole('button',{name:'حركة واحدة',exact:true}).click();await page.getByRole('button',{name:'تشغيل التعليمات',exact:true}).click();await page.locator('#status').filter({hasText:'التسجيل غير مضاف'}).waitFor();await page.getByRole('button',{name:'استجابة مستقلة',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:'متابعة الجلسة',exact:true}).click();assert.match(await page.locator('.task-top').innerText(),/2 \/ 20/);
 await page.getByRole('button',{name:'إنهاء الجلسة',exact:true}).click();await page.getByRole('button',{name:'إنهاء',exact:true}).click();
 assert.match(await page.locator('.chart-axis').innerText(),/20/);assert.equal(await page.locator('.report-details').count(),0);assert(await page.locator('.bar').evaluateAll(bars=>bars.every(b=>parseFloat(b.style.getPropertyValue('--width'))<=100)));
 await page.getByRole('button',{name:'حساب الطفل',exact:true}).click();await page.locator('#parent-gate[open]').waitFor();
 async function solveGate(){const answer=await page.locator('#parent-gate').evaluate(d=>{const a=+d.querySelector('[data-left]').textContent,b=+d.querySelector('[data-right]').textContent;return d.querySelector('[data-operation]').textContent==='−'?a-b:a+b;});await page.locator(`#parent-gate [data-answer="${answer}"]`).click();}
 await solveGate();await page.locator('#child-name').fill('لين');await page.getByRole('button',{name:'دخول',exact:true}).click();await page.locator('#tabbar').getByRole('button',{name:'التقرير',exact:true}).click();await page.getByText('لا توجد استجابات مسجلة بعد.').waitFor();
 await page.getByRole('button',{name:'حساب الطفل',exact:true}).click();await solveGate();await page.locator('#child-name').fill('Hamada');await page.getByRole('button',{name:'دخول',exact:true}).click();await page.getByRole('button',{name:'حساب الطفل',exact:true}).click();await solveGate();await page.getByRole('button',{name:'حذف حساب لين',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'حذف حساب Hamada',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'جدول مقارنة الأطفال',exact:true}).count(),1);await page.locator('#profiles [data-close]').click();
 await page.getByRole('button',{name:'الرئيسية',exact:true}).click();await page.getByRole('button',{name:'تنزيل للاستخدام دون إنترنت',exact:true}).click();await page.locator('#download-content').click();await page.waitForFunction(()=>document.querySelector('[data-percent]').textContent==='100%');await page.getByRole('dialog').filter({has:page.locator('#offline-title')}).getByRole('button',{name:'إغلاق'}).click();
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);if(engine==='webkit')serverOffline=true;else await context.setOffline(true);await page.reload();await page.getByRole('heading',{name:'اتبع التعليمات',exact:true}).waitFor();await page.getByRole('button',{name:'التدريب',exact:true}).click();assert.equal(await page.locator('.skill').count(),11);await noOverflow();
 await page.setViewportSize({width:844,height:390});await noOverflow();await page.getByRole('button',{name:'الرئيسية',exact:true}).click();await page.screenshot({path:`/private/tmp/follow-direction-landscape-${engine}.png`});
 await page.setViewportSize({width:390,height:844});
 for(const group of ['واحد واثنان وثلاثة','لون وحجم']){
  await page.getByRole('button',{name:'التدريب',exact:true}).click();await page.getByRole('button',{name:group,exact:true}).click();assert.match(await page.locator('.task-top').innerText(),/1 \/ 20/);
  for(let step=0;step<20;step++){
   const item=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('follow-direction-children-v1')),s=d.children.find(c=>c.id===d.active).sessions.find(s=>!s.ended);return FollowBank.items.find(i=>i.id===s.items[s.results.length]);});
   assert(await page.locator('.option svg').count()>0);assert(!/undefined/.test(await page.locator('.options').innerHTML()));
   if(step===19){await noOverflow();await page.screenshot({path:`/private/tmp/follow-direction-expanded-${group==='لون وحجم'?'attributes':'quantity'}-${engine}.png`});}
   for(const key of item.answer)await page.locator('.option').nth(item.options.indexOf(key)).click();await page.getByRole('button',{name:'تسجيل والمتابعة',exact:true}).click();
  }
  assert.equal(await page.locator('.report-summary b').first().innerText(),'20');assert.match(await page.locator('.chart-axis').innerText(),/20/);assert.equal(await page.locator('.bar').first().evaluate(b=>b.style.getPropertyValue('--width')),'100%');await noOverflow();await page.getByRole('button',{name:'الرئيسية',exact:true}).click();
 }
 // Accounts have no import/export controls; the comparison table opens offline and saves profile fields.
 await page.getByRole('button',{name:'حساب الطفل',exact:true}).click();await solveGate();assert.equal(await page.locator('#research-export,#backup,#restore,#restore-file').count(),0);
 await page.getByRole('button',{name:'جدول مقارنة الأطفال',exact:true}).click();await page.locator('.compare-table').first().waitFor();await noOverflow();
 const firstGender=page.locator('.compare-table tbody select').first();await firstGender.selectOption('girl');await page.locator('.compare-table tbody input[type=date]').first().fill('2021-05-01');await page.locator('.compare-table tbody input[type=date]').first().dispatchEvent('change');
 const profiles=await page.evaluate(()=>JSON.parse(localStorage.getItem('follow-direction-children-v1')).children.filter(c=>c.gender==='girl'&&c.birth==='2021-05-01').length);assert.equal(profiles,1);
 await page.locator('#compare-gender').evaluate(s=>{s.value='boy';s.dispatchEvent(new Event('change'));});assert.equal(await page.locator('.compare-table').first().locator('tbody tr').count(),0);
 assert.deepEqual(errors,[]);console.log(`${engine}: screening, assistance, resume, reports, checked skills, profiles, offline and responsive checks passed`);
 await context.close();
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
