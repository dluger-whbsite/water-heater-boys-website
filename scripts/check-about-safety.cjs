const {createRequire}=require('node:module');
const assert=require('node:assert/strict');
const bundled=createRequire('C:/Users/dust2/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=bundled('playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
for(const route of ['/about-us/','/services/safety-shut-off-valves/'])for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4341'+route,{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('h1').count(),1);
 assert.equal(await page.locator('iframe[src*="getjobber"]').count(),1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(links=>links.map(a=>a.getAttribute('href')).filter(h=>h.length>1&&!document.getElementById(h.slice(1)))),[]);
 if(route.includes('safety')){
  await page.locator('.faq-section summary').first().click();
  assert.equal(await page.locator('.faq-section details').first().getAttribute('open'),'');
 }
 await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,0);});
 await page.screenshot({path:'backups/service-review/'+(route.includes('safety')?'safety':'about')+'-'+width+'.png'});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({route,width,passed:true}));await page.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
