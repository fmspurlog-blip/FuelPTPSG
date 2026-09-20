/* Run with: npm install --no-save playwright@1.55.0 chart.js@4.4.7 chartjs-plugin-datalabels@2.2.0 xlsx@0.18.5 && npx playwright install chromium && node tests/chart-refactor.spec.cjs */
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const BASE = process.env.FMS_TEST_URL || 'http://127.0.0.1:4173/?v=78.9#dashboard';
const sizes = [360,390,768,1024,1366,1920];
const charts = ['dailyChart','shiftChart','categoryChart','truckChart','statusChart'];
const output = path.resolve('test-results/chart-refactor');
fs.mkdirSync(output,{recursive:true});
function local(name){return path.resolve('node_modules',name)}
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const failures=[];let passed=0;
 try{
  for(const width of sizes){
   const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
   const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',route=>route.fulfill({path:local('chart.js/dist/chart.umd.js'),contentType:'application/javascript'}));
   await page.route('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0',route=>route.fulfill({path:local('chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js'),contentType:'application/javascript'}));
   await page.route('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',route=>route.fulfill({path:local('xlsx/dist/xlsx.full.min.js'),contentType:'application/javascript'}));
   await page.route('https://script.google.com/**',route=>route.abort());
   try{
    await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>window.Chart && ['dailyChart','shiftChart','categoryChart','truckChart','statusChart'].every(id=>Chart.getChart(document.getElementById(id))),{timeout:20000});
    await page.waitForSelector('.fms-chart-legend',{timeout:10000});
    const first=await page.evaluate(ids=>{
     const result={canvases:{},legends:{},overflow:document.documentElement.scrollWidth-innerWidth,errors:[],fuel:document.getElementById('kpiFuel').textContent,stock:document.getElementById('stockTotal').textContent};
     for(const id of ids){const canvas=document.getElementById(id),p=canvas.closest('.panel'),c=canvas.getBoundingClientRect(),b=p.getBoundingClientRect();result.canvases[id]={width:c.width,height:c.height,inside:c.left>=b.left-2&&c.right<=b.right+2&&c.top>=b.top-2&&c.bottom<=b.bottom+2};}
     for(const id of ['truckChart','statusChart']){const canvas=document.getElementById(id),p=canvas.closest('.panel'),legend=p.querySelector('.fms-chart-legend'),b=p.getBoundingClientRect(),r=legend?.getBoundingClientRect();result.legends[id]={count:p.querySelectorAll('.fms-chart-legend').length,legacy:p.querySelectorAll('.v783-white-legend,.v783-ext-legend,.v786-legend').length,inside:!!r&&r.left>=b.left-2&&r.right<=b.right+2&&r.top>=b.top-2&&r.bottom<=b.bottom+2,native:Chart.getChart(canvas).options.plugins.legend.display};}
     result.expectedFuel=state.filtered.reduce((sum,r)=>sum+(Number(r.Fuel_Liter)||0),0);result.expectedStock=stock.total;
     result.categoryPadding=Chart.getChart(document.getElementById('categoryChart')).options.layout.padding.right;
     return result;
    },charts);
    assert.ok(first.overflow<=2,`horizontal page overflow ${first.overflow}px`);
    for(const [id,rect] of Object.entries(first.canvases))assert.ok(rect.width>20&&rect.height>20&&rect.inside,`${id} missing or outside panel ${JSON.stringify(rect)}`);
    for(const [id,value] of Object.entries(first.legends))assert.ok(value.count===1&&value.legacy===0&&value.inside&&value.native===false,`${id} duplicate/out-of-panel legend ${JSON.stringify(value)}`);
    assert.ok(first.categoryPadding>=80,'category label reserve missing');
    const digits=s=>Number(s.replace(/[^\d]/g,''));
    assert.equal(digits(first.fuel),first.expectedFuel,'fuel KPI differs from original dataset');
    assert.equal(digits(first.stock),first.expectedStock,'stock value changed');
    const shiftOptions=await page.locator('#shiftFilter option').evaluateAll(nodes=>nodes.filter(o=>o.value).map(o=>o.value));
    if(shiftOptions.length){await page.selectOption('#shiftFilter',shiftOptions[0]);await page.waitForFunction(()=>Chart.getChart(document.getElementById('truckChart')) && document.querySelectorAll('.fms-chart-legend').length===2);const actual=await page.evaluate(()=>({display:document.getElementById('kpiFuel').textContent,expected:state.filtered.reduce((s,r)=>s+(Number(r.Fuel_Liter)||0),0),stock:document.getElementById('stockTotal').textContent}));assert.equal(digits(actual.display),actual.expected,'filter changed KPI incorrectly');assert.equal(actual.stock,first.stock,'shift filter changed latest stock');}
    await page.locator('#resetBtn').click();
    await page.locator('.nav-link[data-section="fuel-usage"]').click();await page.waitForSelector('#fuel-usage.active-section');
    await page.locator('.nav-link[data-section="dashboard"]').click();await page.waitForSelector('#dashboard.active-section');
    await page.screenshot({path:path.join(output,`dashboard-${width}.png`),fullPage:true});
    assert.deepEqual(errors,[],'JavaScript exceptions');
    console.log(`PASS viewport ${width}px: charts, legends, stock, KPI, filter, navigation; screenshot captured`);passed++;
   }catch(e){failures.push(`${width}px: ${e.stack||e}`);console.error(`FAIL viewport ${width}px: ${e.message}`);await page.screenshot({path:path.join(output,`failed-${width}.png`),fullPage:true}).catch(()=>{});}
   await context.close();
  }
 }finally{await browser.close()}
 console.log(`RESULT ${passed}/${sizes.length} viewports passed`);
 if(failures.length){fs.writeFileSync(path.join(output,'failures.txt'),failures.join('\n\n'));process.exitCode=1;}
}
run().catch(e=>{console.error(e);process.exitCode=1});