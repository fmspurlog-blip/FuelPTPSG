(()=>{
  const fmt727=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  function setVersion(){
    const version=document.querySelector('.v7-version');
    if(version)version.textContent='Dashboard V7.2.7 Professional';
    const trend=document.querySelector('.trend-panel .title h3');
    if(trend)trend.innerHTML='Daily Fuel Consumption <small>(Total/Liter)</small>';
  }

  function restoreStockOrb(){
    const panel=document.querySelector('.stock-panel');
    const total=panel?.querySelector('.stock-total');
    const cols=panel?.querySelector('.stock-cols');
    if(!panel||!total||!cols)return;
    total.classList.add('v726-stock-total','v727-stock-total');
    if(total.parentElement!==panel)panel.insertBefore(total,cols);

    try{
      const fs=Object.values(stock?.fuelStorage||{}).reduce((a,b)=>a+(Number(b)||0),0);
      const ft=Object.values(stock?.fuelTruck||{}).reduce((a,b)=>a+(Number(b)||0),0);
      const calculated=fs+ft;
      if(calculated>0)stock.total=calculated;
      const totalEl=document.getElementById('stockTotal');
      if(totalEl)totalEl.textContent=fmt727(stock?.total||calculated);
      const small=total.querySelector(':scope > small');
      if(small)small.textContent='TOTAL STOCK';

      const storageValues=Object.entries(stock?.fuelStorage||{}).reverse().map(x=>Number(x[1])||0);
      const truckValues=Object.entries(stock?.fuelTruck||{}).reverse().map(x=>Number(x[1])||0);
      document.querySelectorAll('#storageList .stock-row').forEach((row,i)=>{
        const value=row.querySelector('.stock-value');
        if(value){
          value.textContent=fmt727(storageValues[i]||0);
          row.classList.toggle('zero-stock',!(storageValues[i]||0));
        }
      });
      document.querySelectorAll('#truckStockList .stock-row').forEach((row,i)=>{
        const value=row.querySelector('.stock-value');
        if(value){
          value.textContent=fmt727(truckValues[i]||0);
          row.classList.toggle('zero-stock',!(truckValues[i]||0));
        }
      });
    }catch(err){console.warn('V7.2.7 stock calculation skipped',err);}
  }

  function ensureDailyChart(){
    try{
      const canvas=document.getElementById('dailyChart');
      const wrap=canvas?.parentElement;
      if(!canvas||!wrap)return;
      wrap.style.display='block';
      wrap.style.height='192px';
      canvas.style.display='block';
      canvas.style.opacity='1';
      canvas.style.visibility='visible';

      let daily=(typeof state!=='undefined'&&state?.charts)?state.charts.daily:null;
      const hasData=!!daily?.data?.datasets?.[0]?.data?.some(v=>(Number(v)||0)>0);
      if((!daily||!hasData) && typeof renderCharts==='function'){
        renderCharts();
        daily=state?.charts?.daily;
      }
      if(daily){
        daily.options.responsive=true;
        daily.options.maintainAspectRatio=false;
        daily.options.animation=false;
        daily.options.layout={padding:{top:24,right:8,bottom:0,left:2}};
        daily.options.plugins=daily.options.plugins||{};
        daily.options.plugins.legend=daily.options.plugins.legend||{};
        daily.options.plugins.legend.display=false;
        if(daily.options.plugins.datalabels){
          daily.options.plugins.datalabels.display=true;
          daily.options.plugins.datalabels.color='#ffffff';
          daily.options.plugins.datalabels.font={size:9,weight:'bold'};
          daily.options.plugins.datalabels.clamp=true;
          daily.options.plugins.datalabels.clip=false;
          daily.options.plugins.datalabels.anchor='end';
          daily.options.plugins.datalabels.align='top';
        }
        daily.resize();
        daily.update('none');
        requestAnimationFrame(()=>{daily.resize();daily.update('none');});
      }
    }catch(err){console.warn('V7.2.7 daily chart recovery skipped',err);}
  }

  function premiumDonuts(){
    try{
      const charts=(typeof state!=='undefined'&&state?.charts)?state.charts:{};
      ['shift','truck','status'].forEach(name=>{
        const c=charts[name];
        if(!c)return;
        const ds=c.data?.datasets?.[0];
        if(ds){
          ds.borderColor='#07192b';
          ds.borderWidth=3;
          ds.spacing=0;
          ds.hoverOffset=5;
        }
        c.options.rotation=-90;
        c.options.circumference=360;
        c.options.animation=false;
        c.options.layout={padding:{top:3,right:3,bottom:3,left:3}};
        c.options.plugins=c.options.plugins||{};
        if(name==='shift')c.options.cutout='64%';
        if(name==='truck')c.options.cutout='60%';
        if(name==='status')c.options.cutout='57%';
        if(name!=='shift'){
          const vals=ds?.data||[];
          const total=vals.reduce((a,b)=>a+(Number(b)||0),0);
          c.options.plugins.centerText={text:fmt727(total),sub:'Liter'};
        }
        c.resize();
        c.update('none');
        if(name!=='shift'&&typeof buildHtmlLegend==='function')buildHtmlLegend(name,c);
      });
    }catch(err){console.warn('V7.2.7 donut polish skipped',err);}
  }

  function tidyOverTitle(){
    const t=document.querySelector('#topOver')?.closest('.rank')?.querySelector('.title span');
    if(t)t.innerHTML='TOP 5 OVER CONSUMPTION <i>(VAR %)</i>';
  }

  function loadScript(src,globalName){
    return new Promise((resolve,reject)=>{
      if(globalName&&window[globalName])return resolve();
      const existing=[...document.scripts].find(s=>s.src===src);
      if(existing){
        existing.addEventListener('load',()=>resolve(),{once:true});
        existing.addEventListener('error',reject,{once:true});
        return;
      }
      const s=document.createElement('script');
      s.src=src;s.async=true;
      s.onload=resolve;s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  async function prepareDashboardCapture(){
    const dashboardLink=document.querySelector('.nav-link[data-section="dashboard"]');
    if(dashboardLink)dashboardLink.click();
    else location.hash='#dashboard';
    await sleep(250);
    ensureDailyChart();restoreStockOrb();premiumDonuts();
    await sleep(220);
    document.body.classList.add('v727-exporting');
    window.scrollTo(0,0);
    await sleep(80);
    const app=document.querySelector('.app');
    if(!app)throw new Error('Dashboard tidak ditemukan.');
    return app;
  }

  async function makeCanvas(){
    await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js','html2canvas');
    const app=await prepareDashboardCapture();
    try{
      return await html2canvas(app,{
        backgroundColor:'#061322',
        scale:2,
        useCORS:true,
        allowTaint:false,
        logging:false,
        scrollX:0,
        scrollY:0,
        windowWidth:Math.max(document.documentElement.scrollWidth,1600),
        windowHeight:Math.max(document.documentElement.scrollHeight,900)
      });
    }finally{
      document.body.classList.remove('v727-exporting');
    }
  }

  async function exportJpg(){
    const btn=document.getElementById('exportDashboardJpg');
    const old=btn?.textContent;
    try{
      if(btn){btn.disabled=true;btn.textContent='MEMBUAT JPG...';}
      const canvas=await makeCanvas();
      const a=document.createElement('a');
      a.download=`Fuel_Dashboard_${document.getElementById('dateTo')?.value||'report'}.jpg`;
      a.href=canvas.toDataURL('image/jpeg',0.94);
      a.click();
    }catch(err){
      console.error(err);
      alert('Gagal membuat JPG dashboard: '+err.message);
    }finally{
      if(btn){btn.disabled=false;btn.textContent=old||'EXPORT DASHBOARD JPG';}
    }
  }

  async function exportPdf(){
    const btn=document.getElementById('exportDashboardPdf');
    const old=btn?.textContent;
    try{
      if(btn){btn.disabled=true;btn.textContent='MEMBUAT PDF...';}
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');
      const canvas=await makeCanvas();
      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
      const pageW=pdf.internal.pageSize.getWidth();
      const pageH=pdf.internal.pageSize.getHeight();
      const margin=4;
      const ratio=Math.min((pageW-margin*2)/canvas.width,(pageH-margin*2)/canvas.height);
      const w=canvas.width*ratio,h=canvas.height*ratio;
      const x=(pageW-w)/2,y=(pageH-h)/2;
      pdf.addImage(canvas.toDataURL('image/jpeg',0.92),'JPEG',x,y,w,h,undefined,'FAST');
      pdf.save(`Fuel_Dashboard_${document.getElementById('dateTo')?.value||'report'}.pdf`);
    }catch(err){
      console.error(err);
      alert('Gagal membuat PDF dashboard: '+err.message);
    }finally{
      if(btn){btn.disabled=false;btn.textContent=old||'EXPORT DASHBOARD PDF';}
    }
  }

  function installDashboardExport(){
    const reports=document.getElementById('reports');
    if(!reports)return;
    let card=reports.querySelector('.v726-print-card')||reports.querySelector('.v727-dashboard-export-card');
    if(!card){
      const reconBtn=reports.querySelector('[data-report="recon"]');
      card=reconBtn?.closest('.report-card');
    }
    if(!card)return;
    card.classList.add('v726-print-card','v727-dashboard-export-card');
    if(!card.querySelector('#exportDashboardPdf')){
      card.innerHTML='<h3>Print / Export Dashboard</h3><p>Export tampilan dashboard penuh seperti layar ke PDF A4 landscape atau JPG resolusi tinggi.</p><div class="v727-export-actions"><button id="exportDashboardPdf" type="button">EXPORT DASHBOARD PDF</button><button id="exportDashboardJpg" type="button">EXPORT DASHBOARD JPG</button></div>';
    }
    const pdf=document.getElementById('exportDashboardPdf');
    const jpg=document.getElementById('exportDashboardJpg');
    if(pdf&&!pdf.$v727){pdf.$v727=true;pdf.addEventListener('click',exportPdf);}
    if(jpg&&!jpg.$v727){jpg.$v727=true;jpg.addEventListener('click',exportJpg);}
  }

  function apply727(){
    setVersion();
    restoreStockOrb();
    ensureDailyChart();
    premiumDonuts();
    tidyOverTitle();
    installDashboardExport();
  }

  apply727();
  [280,720,1300,2200,3200].forEach(ms=>setTimeout(apply727,ms));
  ['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',()=>setTimeout(apply727,140));
  });
  document.getElementById('unitSearch')?.addEventListener('input',()=>setTimeout(apply727,160));
  window.addEventListener('hashchange',()=>setTimeout(apply727,120));
})();