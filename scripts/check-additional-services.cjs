const {createRequire}=require('node:module');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const bundled=createRequire('C:/Users/dust2/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=bundled('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 fs.mkdirSync('backups/service-review',{recursive:true});
 try{
  for(const [slug,total,prefix] of [['tankless-water-heaters',6,'wix-tl-'],['heat-pump-water-heaters',7,'wix-hp-']]){
   const html=fs.readFileSync(`site/dist/services/${slug}/index.html`,'utf8');
   assert.equal((html.match(/class="job" id="job-/g)||[]).length,total);
   for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
    const page=await browser.newPage({viewport:{width,height}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:4341/services/${slug}/`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('.photo-frame img').naturalWidth>0);
    assert.equal(await page.locator('.job:visible').count(),6);
    assert.equal(await page.locator(`.job[id^="job-${prefix}"]`).count(),total);
    assert.equal(await page.locator('#job-city').count(),0);
    assert.equal(await page.locator('.included-card').count(),3);
    assert.equal(await page.locator('.faq-section details').count(),4);
    assert.equal(await page.locator('#more-jobs').isVisible(),total>6);
    assert.equal(await page.locator('iframe[src*="getjobber"]').count(),1);
    assert.equal(await page.locator('.elfsight-app-dc5cca55-9398-4cca-a9bd-b80599826663').count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:`backups/service-review/${slug}-${name}.png`});
    if(total>6){
     await page.locator('#more-jobs').click();
     assert.equal(await page.locator('.job:visible').count(),total);
     assert.equal(await page.locator('#more-jobs').isVisible(),false);
     await page.goto(`http://127.0.0.1:4341/services/${slug}/#job-${prefix}007`);
     await page.locator(`#job-${prefix}007`).waitFor({state:'visible'});
    }
    await page.locator('.faq-section summary').first().click();
    assert.equal(await page.locator('.faq-section details').first().getAttribute('open'),'');
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({slug,name,total,overflow:false,passed:true}));
    await page.close();
   }
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
