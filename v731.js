(()=>{
  const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);

  function getState(){try{return typeof state!=='undefined'?state:null}catch(_){return null}}
  function getStock(){try{return typeof stock!=='undefined'?stock:null}catch(_){return null}}
  function getRecon(){try{return typeof reconData!=='undefined'?reconData:null}catch(_){return null}}

  function cleanLogo(){
    const box=document.querySelector('.logo-box');
    if(!box)return;
    box.innerHTML='<div class="v731-prima-logo" aria-label="PRIMA">PRIMA</div>';
  }

  function refreshDashboard(){
    try{
      if(typeof applyFilters==='function')applyFilters();
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        const charts=getState()?.charts||{};
        Object.entries(charts).forEach(([name,c])=>{
          if(!c?.canvas?.isConnected)return;
          const sec=c.canvas.closest('.app-section');
          if(sec&&!sec.classList.contains('active-section'))return;
          try{
            c.options.animation=false;
            c.resize();
            c.update('none');
            if((name==='truck'||name==='status')&&typeof buildHtmlLegend==='function')buildHtmlLegend(name,c);
          }catch(err){console.warn('chart refresh',name,err);}
        });
      }));
    }catch(err){console.warn('dashboard refresh',err);}
  }

  function replaceNodeWithClone(id){
    const old=document.getElementById(id);
    if(!old)return null;
    const clone=old.cloneNode(true);
    if(old.tagName==='INPUT'||old.tagName==='SELECT')clone.value=old.value;
    old.replaceWith(clone);
    return clone;
  }

  function installSingleFilterPipeline(){
    const ids=['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'];
    ids.forEach(id=>{
      const node=replaceNodeWithClone(id);
      if(node)node.addEventListener('change',refreshDashboard);
    });
    const search=replaceNodeWithClone('unitSearch');
    if(search){
      let timer;
      search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(refreshDashboard,80);});
    }
    const reset=replaceNodeWithClone('resetBtn');
    if(reset)reset.addEventListener('click',()=>{
      try{
        const s=getState();
        if(!s?.raw?.length)return;
        const dates=s.raw.map(r=>r.Date).filter(Boolean).sort();
        const from=document.getElementById('dateFrom'),to=document.getElementById('dateTo');
        if(from)from.value=dates[0]||'';
        if(to)to.value=dates.at(-1)||'';
        ['shiftFilter','categoryFilter','truckFilter'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
        const q=document.getElementById('unitSearch');if(q)q.value='';
        refreshDashboard();
      }catch(err){console.warn('reset',err);}
    });
  }

  function exportExcel(){
    try{
      if(!window.XLSX)throw new Error('Library Excel belum siap.');
      const st=getState(),s=getStock(),rd=getRecon();
      const rows=Array.isArray(st?.filtered)?st.filtered:[];
      const from=document.getElementById('dateFrom')?.value||'';
      const to=document.getElementById('dateTo')?.value||'';
      const wb=XLSX.utils.book_new();
      const total=rows.reduce((a,r)=>a+(Number(r.Fuel_Liter)||0),0);
      const days=new Set(rows.map(r=>r.Date)).size;
      const units=new Set(rows.map(r=>r.Unit_Code)).size;
      const avgLhmRows=rows.map(r=>Number(r.Actual_LHM)).filter(v=>Number.isFinite(v)&&v>0);
      const avgLhm=avgLhmRows.length?avgLhmRows.reduce((a,b)=>a+b,0)/avgLhmRows.length:0;
      const summary=[
        ['FUEL MANAGEMENT SYSTEM - DASHBOARD EXPORT',''],
        ['PT PRIMA SARANA GEMILANG SITE ABM',''],
        ['PERIOD FROM',from],['PERIOD TO',to],
        ['SHIFT',document.getElementById('shiftFilter')?.value||'All Shift'],
        ['CATEGORY',document.getElementById('categoryFilter')?.value||'All Category'],
        ['FUEL TRUCK',document.getElementById('truckFilter')?.value||'All Fuel Truck'],
        ['SEARCH UNIT',document.getElementById('unitSearch')?.value||''],
        ['TOTAL FUEL ISSUED',total],['AVERAGE / DAY',days?total/days:0],['ACTIVE UNIT',units],['AVG ACTUAL L/HM',avgLhm],
        ['PHYSICAL STOCK',Number(s?.total)||0],['STOCK SNAPSHOT DATE',s?.snapshotDate||''],['STOCK SNAPSHOT TIME',s?.snapshotTime||'']
      ];
      const ws=XLSX.utils.aoa_to_sheet(summary);
      ws['!cols']=[{wch:34},{wch:26}];
      XLSX.utils.book_append_sheet(wb,ws,'Dashboard Summary');
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Fuel Usage');
      const stockRows=[];
      Object.entries(s?.fuelStorage||{}).forEach(([Unit,Liter])=>stockRows.push({Type:'STATIC TANK',Unit,Liter}));
      Object.entries(s?.fuelTruck||{}).forEach(([Unit,Liter])=>stockRows.push({Type:'FUEL TRUCK',Unit,Liter}));
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(stockRows),'Fuel Stock');
      const recon=(rd?.daily||[]).filter(r=>(!from||r.date>=from)&&(!to||r.date<=to));
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(recon),'Reconciliation');
      const receipt=(rd?.receiptDetails||[]).filter(r=>(!from||r.date>=from)&&(!to||r.date<=to));
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(receipt),'Fuel Receipt');
      XLSX.writeFile(wb,`Fuel_Dashboard_${from||'start'}_${to||'end'}.xlsx`);
    }catch(err){alert('Gagal membuat Excel dashboard: '+err.message);}
  }

  function installExcelOnly(){
    const oldExport=document.getElementById('exportBtn');
    if(oldExport){
      const b=oldExport.cloneNode(true);
      b.innerHTML='⇩<span>EXPORT EXCEL</span>';
      b.title='Export dashboard sesuai filter aktif ke Excel';
      oldExport.replaceWith(b);
      b.addEventListener('click',exportExcel);
    }
    const reports=document.getElementById('reports');
    if(reports){
      const cards=reports.querySelector('.report-cards');
      if(cards)cards.innerHTML='<article class="report-card v731-excel-only"><h3>Export Dashboard Excel</h3><p>Download seluruh data dashboard sesuai filter aktif dalam satu workbook Excel.</p><button id="exportDashboardExcel" data-report="dashboard-excel" type="button">EXPORT DASHBOARD EXCEL</button></article>';
      const legacy=document.getElementById('downloadReconCsv');if(legacy)legacy.remove();
      document.getElementById('exportDashboardExcel')?.addEventListener('click',exportExcel);
    }
  }

  function alignCircularCharts(){
    const charts=getState()?.charts||{};
    ['shift','truck','status'].forEach(name=>{
      const c=charts[name];if(!c)return;
      c.options.animation=false;
      c.options.responsive=true;
      c.options.maintainAspectRatio=false;
      c.options.rotation=-90;
      c.options.circumference=360;
      if(name==='shift')c.options.cutout='70%';
      if(name==='truck')c.options.cutout='66%';
      if(name==='status')c.options.cutout='66%';
      try{c.resize();c.update('none');}catch(_){ }
      if((name==='truck'||name==='status')&&typeof buildHtmlLegend==='function')try{buildHtmlLegend(name,c);}catch(_){ }
    });
  }

  function syncStockTotal(){
    try{
      if(typeof resolveStockSnapshot==='function')resolveStockSnapshot();
      const s=getStock();
      const fs=Object.values(s?.fuelStorage||{}).reduce((a,b)=>a+(Number(b)||0),0);
      const ft=Object.values(s?.fuelTruck||{}).reduce((a,b)=>a+(Number(b)||0),0);
      const total=fs+ft||Number(s?.total)||0;
      if(s)s.total=total;
      const e=document.getElementById('stockTotal');if(e)e.textContent=fmt(total);
    }catch(err){console.warn('stock total',err);}
  }

  function apply(){
    cleanLogo();
    syncStockTotal();
    alignCircularCharts();
    const version=document.querySelector('.v7-version');if(version)version.textContent='Dashboard V7.3.1 Stable';
  }

  installSingleFilterPipeline();
  installExcelOnly();
  apply();
  [160,500,1000].forEach(ms=>setTimeout(apply,ms));
  window.addEventListener('resize',()=>setTimeout(alignCircularCharts,80));
  window.addEventListener('hashchange',()=>setTimeout(apply,80));
})();
