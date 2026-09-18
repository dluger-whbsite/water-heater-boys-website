const {createRequire}=require('node:module');
const bundled=createRequire('C:/Users/dust2/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=bundled('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900}});
   await page.goto('http://127.0.0.1:4341/',{waitUntil:'domcontentloaded'});
   await page.locator('#reviews').scrollIntoViewIfNeeded();
   await page.waitForTimeout(6000);
   console.log(JSON.stringify({width,scripts:await page.locator('script[src="https://elfsightcdn.com/platform.js"]').count(),text:await page.locator('#reviews').innerText(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));
   await page.locator('#reviews').screenshot({path:`backups/homepage-review/reviews-${width}.png`});
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
