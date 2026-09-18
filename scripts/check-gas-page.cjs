const {createRequire}=require('node:module');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const bundled=createRequire('C:/Users/dust2/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=bundled('playwright');
(async()=>{
 const html=fs.readFileSync('site/dist/services/gas-tank-water-heaters/index.html','utf8');
 const total=(html.match(/class="job" id="job-/g)||[]).length;
 assert.equal(total,58,'All published gas jobs in initial HTML');
 assert(!html.includes('completion date not recorded'));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 fs.mkdirSync('backups/gas-page-review',{recursive:true});
 try{
  for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
   const page=await browser.newPage({viewport:{width,height}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const url='http://127.0.0.1:4341/services/gas-tank-water-heaters/';
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>!document.querySelector('#more-jobs').hidden);
   assert.equal(await page.locator('#job-city').count(),0);
   assert.equal(await page.locator('.job:visible').count(),6);
   await page.locator('#more-jobs').click();
   assert.equal(await page.locator('.job:visible').count(),12);
   const last=await page.locator('.job').last().getAttribute('id');
   await page.goto(url+'#'+last,{waitUntil:'domcontentloaded'});
   await page.locator('#'+last).waitFor({state:'visible'});
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>!document.querySelector('#more-jobs').hidden);
   await page.waitForFunction(()=>document.querySelector('.photo-frame img').naturalWidth>0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:`backups/gas-page-review/${name}-hero.png`});
   await page.locator('#work').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>[...document.querySelectorAll('.job:not([hidden]) img')].slice(0,3).every(i=>i.complete&&i.naturalWidth>0));
   await page.screenshot({path:`backups/gas-page-review/${name}-jobs.png`});
   await page.locator('.faq-section summary').first().click();
   assert.equal(await page.locator('.faq-section details').first().getAttribute('open'),'');
   assert.equal(await page.locator('.elfsight-app-dc5cca55-9398-4cca-a9bd-b80599826663').count(),1);
   assert.equal(await page.locator('iframe[src*="getjobber"]').count(),1);
   assert.deepEqual(errors,[]);
   console.log(JSON.stringify({name,total,initialVisible:6,showMore:12,cityFilter:false,deepLink:last,overflow:false}));
   await page.close();
  }
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4341/services/gas-tank-water-heaters/');
  assert.equal(await page.locator('.job:visible').count(),total);
  console.log('No-JavaScript check: all 58 jobs visible.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
