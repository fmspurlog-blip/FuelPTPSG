'use strict';
// Independent visual-geometry and canvas-paint gate; QA-only, cloud requests blocked.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.FMS_TEST_URL || 'http://127.0.0.1:4173/?v=78.9#dashboard';
const out = path.resolve('test-results/chart-refactor');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  for(const width of [360,390,768,1024,1366,1920]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',r=>r.fulfill({path:path.resolve('node_modules/chart.js/dist/chart.umd.js'),contentType:'application/javascript'}));
   await page.route('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0',r=>r.fulfill({path:path.resolve('node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js'),contentType:'application/javascript'}));
   await page.route('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',r=>r.fulfill({path:path.resolve('node_modules/xlsx/dist/xlsx.full.min.js'),contentType:'application/javascript'}));
   await page.route('https://script.google.com/**',r=>r.abort());
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.Chart && Chart.getChart(document.getElementById('dailyChart'))?.data.labels.length>0);
   await page.locator('.nav-link[data-section="fuel-usage"]').click();
   await page.locator('.nav-link[data-section="dashboard"]').click();
   await page.waitForFunction(()=>document.getElementById('dashboard').classList.contains('active-section'));
   // Capture the actual post-navigation canvas BEFORE stop/resize/update can mask a blank frame.
   await page.evaluate(async()=>{
    await document.fonts.ready;
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   });
   const beforeRefresh=await page.evaluate(()=>{
    const daily=Chart.getChart(document.getElementById('dailyChart'));
    const meta=daily.getDatasetMeta(0),plot=daily.chartArea;
    const pixels=daily.ctx.getImageData(0,0,daily.canvas.width,daily.canvas.height);
    const scaleX=daily.canvas.width/daily.width,scaleY=daily.canvas.height/daily.height;
    let positiveBars=0,paintedBars=0;
    for(const [i,bar] of meta.data.entries()){
      if(!Number.isFinite(bar.x)||!Number.isFinite(bar.y)||!(bar.width>0)||!(Number(daily.data.datasets[0].data[i])>0))continue;
      positiveBars++;
      const left=Math.max(plot.left,bar.x-bar.width*.35),right=Math.min(plot.right,bar.x+bar.width*.35);
      const top=Math.max(plot.top,bar.y+3),bottom=Math.min(plot.bottom,bar.base-3);
      if(right<=left||bottom<=top)continue;
      let orange=0;
      for(let y=Math.ceil(top*scaleY);y<Math.floor(bottom*scaleY);y+=Math.max(1,Math.floor(scaleY*3))){
       for(let x=Math.ceil(left*scaleX);x<Math.floor(right*scaleX);x+=Math.max(1,Math.floor(scaleX*2))){
        const p=(y*pixels.width+x)*4,r=pixels.data[p],g=pixels.data[p+1],b=pixels.data[p+2],a=pixels.data[p+3];
        if(a>150&&r>170&&g>55&&g<205&&b<110)orange++;
       }
      }
      if(orange>=3)paintedBars++;
    }
    return {positiveBars,paintedBars};
   });
   assert.ok(beforeRefresh.positiveBars>=2,`${width}px: insufficient positive daily bars before refresh ${JSON.stringify(beforeRefresh)}`);
   assert.ok(beforeRefresh.paintedBars>=Math.min(2,beforeRefresh.positiveBars),`${width}px: daily bars invisible immediately after navigation, before forced refresh ${JSON.stringify(beforeRefresh)}`);
   await page.evaluate(()=>Object.values(state.charts).forEach(chart=>{chart.stop();chart.resize();chart.update('none');}));
   const result=await page.evaluate(()=>{
    const daily=Chart.getChart(document.getElementById('dailyChart'));
    const meta=daily.getDatasetMeta(0);
    const bars=meta.data.filter(b=>Number.isFinite(b.x)&&Number.isFinite(b.y)&&b.width>0);
    const xs=bars.map(b=>b.x);
    const plot=daily.chartArea;
    const outOfPlot=bars.filter(b=>b.x-b.width/2<plot.left-2||b.x+b.width/2>plot.right+2||b.y<plot.top-2||b.y>plot.bottom+2).length;
    const panel=document.getElementById('dailyChart').closest('.panel').getBoundingClientRect();
    const chart=document.getElementById('dailyChart').getBoundingClientRect();
    const shift=document.getElementById('shiftChart').getBoundingClientRect();
    const shiftPanel=document.getElementById('shiftChart').closest('.panel').getBoundingClientRect();
    const inside=(a,b)=>a.left>=b.left-2&&a.right<=b.right+2&&a.top>=b.top-2&&a.bottom<=b.bottom+2;
    const category=Chart.getChart(document.getElementById('categoryChart'));
    let categoryLabelOverflow=0,categoryGutter=0,categoryLabels=0;
    if(category){
      const data=category.data.datasets?.[0]?.data||[];
      const format=v=>Number(v||0).toLocaleString('id-ID',{maximumFractionDigits:0});
      let total=data.reduce((n,v)=>n+(Number(v)||0),0);
      if(Array.isArray(state.filtered))total=state.filtered.reduce((n,r)=>n+(Number(r.Fuel_Liter)||0),0)||total;
      const ctx=category.ctx;ctx.save();ctx.font='700 9px Segoe UI, Arial, sans-serif';
      categoryGutter=category.width-category.chartArea.right-8;
      for(const value of data){const v=Number(value)||0;const label=format(v)+' ('+(total?(v/total*100):0).toFixed(1)+'%)';categoryLabels++;if(ctx.measureText(label).width>categoryGutter+1)categoryLabelOverflow++;}
      ctx.restore();
    }
    // Index by dataset order, not optional Chart.js bar.$context.
    const ctx=daily.canvas.getContext('2d');
    const pixels=ctx.getImageData(0,0,daily.canvas.width,daily.canvas.height);
    const scaleX=daily.canvas.width/daily.width,scaleY=daily.canvas.height/daily.height;
    let paintedBars=0;
    for(const [i,bar] of meta.data.entries()){
      if(!Number.isFinite(bar.x)||!Number.isFinite(bar.y)||!(bar.width>0))continue;
      if(!(Number(daily.data.datasets[0].data[i])>0))continue;
      const left=Math.max(plot.left,bar.x-bar.width*.35),right=Math.min(plot.right,bar.x+bar.width*.35);
      const top=Math.max(plot.top,bar.y+3),bottom=Math.min(plot.bottom,bar.base-3);
      if(right<=left||bottom<=top)continue;
      let orange=0;
      for(let y=Math.ceil(top*scaleY);y<Math.floor(bottom*scaleY);y+=Math.max(1,Math.floor(scaleY*3))){
       for(let x=Math.ceil(left*scaleX);x<Math.floor(right*scaleX);x+=Math.max(1,Math.floor(scaleX*2))){
        const p=(y*pixels.width+x)*4,r=pixels.data[p],g=pixels.data[p+1],b=pixels.data[p+2],a=pixels.data[p+3];
        if(a>150&&r>170&&g>55&&g<205&&b<110)orange++;
       }
      }
      if(orange>=3)paintedBars++;
    }
    return {bars:bars.length,paintedBars,distinctXs:new Set(xs.map(x=>Math.round(x))).size,span:xs.length?Math.max(...xs)-Math.min(...xs):0,chartWidth:chart.width,outOfPlot,plotWidth:plot.right-plot.left,dailyInside:inside(chart,panel),shiftInside:inside(shift,shiftPanel),shiftHeight:shift.height,categoryLabels,categoryGutter,categoryLabelOverflow};
   });
   assert.ok(result.bars>=2,`${width}px: insufficient daily bars ${JSON.stringify(result)}`);
   assert.equal(result.distinctXs,result.bars,`${width}px: daily bars overlap ${JSON.stringify(result)}`);
   assert.ok(result.span>result.chartWidth*.25,`${width}px: daily bars bunched at left ${JSON.stringify(result)}`);
   assert.ok(result.plotWidth>40,`${width}px: daily plot is too narrow ${JSON.stringify(result)}`);
   assert.equal(result.outOfPlot,0,`${width}px: daily bars escape chart plotting area ${JSON.stringify(result)}`);
   assert.ok(result.paintedBars>=Math.min(2,result.bars),`${width}px: daily bars have geometry but no visible orange paint ${JSON.stringify(result)}`);
   assert.ok(result.dailyInside&&result.shiftInside&&result.shiftHeight>40,`${width}px: chart outside panel ${JSON.stringify(result)}`);
   assert.ok(result.categoryLabels>0,`${width}px: category labels missing ${JSON.stringify(result)}`);
   assert.equal(result.categoryLabelOverflow,0,`${width}px: category value labels exceed reserved gutter ${JSON.stringify(result)}`);
   assert.deepEqual(errors,[],`${width}px: browser errors`);
   await page.screenshot({path:path.join(out,`visual-gate-${width}.png`),fullPage:true,animations:'disabled'});
   console.log(`PASS visual geometry and paint ${width}px: before refresh ${beforeRefresh.paintedBars}/${beforeRefresh.positiveBars}, after refresh ${result.paintedBars}/${result.bars} painted daily bars, spread ${Math.round(result.span)}px`);
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});