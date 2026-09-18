const {createRequire}=require('node:module');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const bundled=createRequire('C:/Users/dust2/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=bundled('playwright');
(async()=>{
 fs.mkdirSync('backups/homepage-review',{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   page.on('requestfailed',r=>console.log(JSON.stringify({failed:r.url(),reason:r.failure()?.errorText})));
   await page.goto('http://127.0.0.1:4341/',{waitUntil:'networkidle',timeout:60000});
   for(const id of ['services','work','about','areas','estimate','recent-jobs'])assert.equal(await page.locator('#'+id).count(),1,id);
   assert.equal(await page.locator('.services .service').count(),4);
   assert.equal(await page.locator('.projects article').count(),3);
   assert.equal(await page.locator('.step').count(),3);
   assert.equal(await page.locator('.cities span').count(),12);
   assert.equal(await page.locator('iframe').count(),1);
   assert.equal(await page.locator('astro-island[client]').count(),0);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   assert.equal(overflow,false,`${name} horizontal overflow`);
   const images=await page.locator('.logo,.photo-frame>img,.project-photo>img').evaluateAll(imgs=>imgs.map(img=>({src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0})));
   // Scroll through lazy-loaded imagery before checking it.
   await page.locator('#work').scrollIntoViewIfNeeded();
   await page.locator('.project-photo img').first().waitFor();
   await page.waitForFunction(()=>[...document.querySelectorAll('.project-photo img')].every(img=>img.complete&&img.naturalWidth>0));
   await page.locator('.project-details summary').first().click();
   assert.equal(await page.locator('.project-details').first().getAttribute('open'),'');
   await page.locator('.project-details summary').first().click();
   await page.locator('iframe').scrollIntoViewIfNeeded();
   await page.waitForTimeout(2500);
   await page.screenshot({path:`backups/homepage-review/${name}.png`,fullPage:true});
   await page.locator('.jobber-shell').screenshot({path:`backups/homepage-review/${name}-jobber.png`});
   const report={name,overflow,errors,images,frames:page.frames().map(f=>f.url()),iframeSrc:await page.locator('iframe').getAttribute('src'),jobberFrame:page.frames().some(f=>f.url().includes('clienthub.getjobber.com')),heading:await page.locator('h1').innerText()};
   assert.deepEqual(errors,[]);
   console.log(JSON.stringify(report));
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
