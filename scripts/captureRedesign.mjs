import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const out = new URL('../scrollcraft/builds/senior-portfolio/lab/after/', import.meta.url).pathname;
await fs.mkdir(out, { recursive: true });
const url=process.argv[2]||'http://localhost:4500';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const variants=[
 ['desktop',{width:1440,height:1000},false,'no-preference'],
 ['phone',{width:390,height:844},true,'no-preference'],
 ['compact',{width:360,height:640},true,'no-preference'],
 ['narrow',{width:320,height:740},true,'no-preference'],
 ['reduced',{width:1440,height:1000},false,'reduce'],
 ['phone-reduced',{width:390,height:844},true,'reduce']
];
const summaries=[];
for(const [name,viewport,isMobile,reducedMotion] of variants){
 const context=await browser.newContext({viewport,isMobile,hasTouch:isMobile,deviceScaleFactor:1,reducedMotion,acceptDownloads:true});
 await context.addInitScript(()=>{
  Element.prototype.requestPointerLock=async function(){};
  Element.prototype.setPointerCapture=function(){};
  Element.prototype.releasePointerCapture=function(){};
  Document.prototype.exitPointerLock=function(){};
 });
 const page=await context.newPage();
 const errors=[],consoleErrors=[],failures=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
 page.on('requestfailed',r=>failures.push({url:r.url(),error:r.failure()?.errorText}));
 await page.goto(url,{waitUntil:'networkidle',timeout:45000});
 await page.waitForTimeout(1200);
 await page.screenshot({path:out+name+'-opening.png'});
 const positions=await page.evaluate(()=>[...document.querySelectorAll('main section')].filter(e=>e.id).map(e=>({id:e.id,top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight})));
 const samples=[];
 for(const section of positions){
  for(const [label,p]of[['entry',0],['middle',.5],['exit',1]]){
   const top=Math.max(0,section.top-84+Math.max(0,section.height-viewport.height)*p);
   await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),top);
   await page.waitForTimeout(500);
   await page.screenshot({path:out+name+'-'+section.id+'-'+label+'.png'});
   samples.push({section:section.id,label,...await page.evaluate(()=>({top:scrollY,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth}))});
  }
 }
 // Offscreen native rail images are intentionally lazy. Bring each one into
 // view before assessing image loading, then restore the collection opening.
 for (const image of await page.locator('[data-red-tiger-poster] img').all()) {
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(img => img.decode().catch(() => {}));
 }
 await page.evaluate(() => { const track = document.querySelector('[data-red-tiger-track]'); if(track) track.scrollLeft = 0; window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}); });
 await page.screenshot({path:out+name+'-full.png',fullPage:true});
 const inventory=await page.evaluate(()=>({
  title:document.title,text:document.body.innerText,
  headings:[...document.querySelectorAll('h1,h2,h3,h4')].map(e=>({tag:e.tagName,text:e.innerText})),
  links:[...document.querySelectorAll('a')].map(e=>({text:e.innerText,aria:e.getAttribute('aria-label'),href:e.getAttribute('href')})),
  buttons:[...document.querySelectorAll('button')].map(e=>({text:e.innerText,aria:e.getAttribute('aria-label')})),
  images:[...document.images].map(e=>({src:e.currentSrc||e.src,alt:e.alt,loaded:e.complete&&e.naturalWidth>0,width:e.naturalWidth})),
  storage:Object.fromEntries(Object.entries(localStorage)),
  width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight
 }));
 await fs.writeFile(out+name+'-inventory.json',JSON.stringify({...inventory,errors,consoleErrors,failures,positions,samples},null,2));
 summaries.push({name,errors,consoleErrors,failures,width:inventory.width,height:inventory.height,sections:positions,brokenImages:inventory.images.filter(i=>!i.loaded),overflow:samples.filter(s=>s.scrollWidth>s.viewport+1)});
 await context.close();
 console.log(JSON.stringify(summaries.at(-1)));
}
await fs.writeFile(out+'capture-summary.json',JSON.stringify(summaries,null,2));
await browser.close();
