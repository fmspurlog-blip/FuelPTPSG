'use strict';
// QA-only synthetic values. No cloud access, production writes or fuel calculation changes.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const base=process.env.FMS_TEST_URL||'http://127.0.0.1:4173/?v=78.9#dashboard';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [360,390,768,1024,1366,1920]){
   const page=await browser.newPage({viewport:{width,height:900}});
   await page.route('https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',r=>r.fulfill({path:path.resolve('node_modules/chart.js/dist/chart.umd.js'),contentType:'application/javascript'}));
   await page.route('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0',r=>r.fulfill({path:path.resolve('node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js'),contentType:'application/javascript'}));
   await page.route('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',r=>r.fulfill({path:path.resolve('node_modules/xlsx/dist/xlsx.full.min.js'),contentType:'application/javascript'}));
   await page.route('https://script.google.com/**',r=>r.abort());
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.Chart&&Chart.getChart(document.getElementById('categoryChart'))?.data.datasets?.[0]?.data?.length>0);
   const result=await page.evaluate(()=>{
    const chart=Chart.getChart(document.getElementById('categoryChart'));
    const original=chart.data.datasets[0].data.slice();
    const originalFiltered=state.filtered;
    try{
     // Deliberately synthetic 12-digit liter values; never mutate source rows.
     const values=original.map((_,i)=>987654321000+i*123456789);
     chart.data.datasets[0].data=values;
     state.filtered=null;
     chart.update('none');
     const ctx=chart.ctx;ctx.save();ctx.font='700 9px Segoe UI, Arial, sans-serif';
     const total=values.reduce((a,b)=>a+b,0);
     const gutter=chart.width-chart.chartArea.right-8;
     const labels=values.map(v=>Number(v).toLocaleString('id-ID',{maximumFractionDigits:0})+' ('+(v/total*100).toFixed(1)+'%)');
     const widest=Math.max(...labels.map(label=>ctx.measureText(label).width));
     ctx.restore();
     return {gutter,widest,labels:labels.length,plotWidth:chart.chartArea.right-chart.chartArea.left,canvasWidth:chart.width};
    }finally{chart.data.datasets[0].data=original;state.filtered=originalFiltered;chart.update('none');}
   });
   assert.ok(result.labels>0,`${width}px: no synthetic labels`);
   assert.ok(result.plotWidth>40,`${width}px: plot collapsed ${JSON.stringify(result)}`);
   assert.ok(result.widest<=result.gutter+1,`${width}px: 12-digit label clipped ${JSON.stringify(result)}`);
   console.log(`PASS category stress ${width}px: ${result.labels} labels, widest ${Math.round(result.widest)}px, gutter ${Math.round(result.gutter)}px`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
