(()=>{
  const VERSION='7.3.2';
  const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
  let primaSrc='';

  function getState(){try{return typeof state!=='undefined'?state:null}catch(_){return null}}
  function getStock(){try{return typeof stock!=='undefined'?stock:null}catch(_){return null}}
  function getRecon(){try{return typeof reconData!=='undefined'?reconData:null}catch(_){return null}}

  function cleanLogo(){
    const box=document.querySelector('.logo-box');
    if(!box)return;
    const img=box.querySelector('img');
    if(img?.src && img.src.startsWith('data:image/'))primaSrc=img.src;
    if(!primaSrc){
      return;
    }
    let exact=box.querySelector('img.v732-prima-logo');
    if(!exact){
      box.replaceChildren();
      exact=document.createElement('img');
      exact.className='v732-prima-logo';
      exact.alt='PRIMA - PT Prima Sarana Gemilang';
      exact.draggable=false;
      box.appendChild(exact);
    }else{
      [...box.children].forEach(ch=>{if(ch!==exact)ch.remove();});
    }
    if(exact.src!==primaSrc)exact.src=primaSrc;
  }

  function filteredEffectiveDate(){
    const st=getState();
    const dates=(st?.filtered||[]).map(r=>r.Date).filter(Boolean).sort();
    return dates.length?dates[dates.length-1]:(document.getElementById('dateTo')?.value||'');
  }

  function resolveStockSnapshotFiltered(){
    try{
      const target=filteredEffectiveDate();
      const allDates=(stockData?.availableDates||[]).slice().sort();
      const eligible=allDates.filter(d=>!target||d<=target);
      const selected=eligible.length?eligible[eligible.length-1]:allDates[0];
      const src=selected?(stockData.snapshots||{})[selected]:null;
      if(!src){
        stock={fuelStorage:{},fuelTruck:{},total:0,snapshotDate:'',snapshotTime:''};
        return;
      }
      const truckFilter=document.getElementById('truckFilter')?.value||'';
      const fuelStorage={...(src.fuelStorage||{})};
      let fuelTruck={...(src.fuelTruck||{})};
      if(truckFilter){
        fuelTruck=Object.prototype.hasOwnProperty.call(fuelTruck,truckFilter)
          ?{[truckFilter]:fuelTruck[truckFilter]}
          :{};
      }
      const fsTotal=Object.values(fuelStorage).reduce((a,b)=>a+(Number(b)||0),0);
      const ftTotal=Object.values(fuelTruck).reduce((a,b)=>a+(Number(b)||0),0);
      stock={
        ...src,
        fuelStorage,
        fuelTruck,
        total:fsTotal+ftTotal,
        snapshotDate:selected||'',
        snapshotTime:src.snapshotTime||src.time||''
      };
    }catch(err){console.warn('filtered stock snapshot',err);}
  }

  try{resolveStockSnapshot=resolveStockSnapshotFiltered;}catch(err){console.warn('stock resolver override',err);}

  function updateActiveSection(){
    try{
      const active=document.querySelector('.app-section.active-section');
      if(active && active.id!=='dashboard' && typeof renderSection==='function')renderSection(active.id);
    }catch(err){console.warn('active section refresh',err);}
  }

  function normalizeMainCharts(){
    const charts=getState()?.charts||{};
    const daily=charts.daily;
    if(daily){
      daily.options.animation=false;
      daily.options.responsive=true;
      daily.options.maintainAspectRatio=false;
      daily.options.resizeDelay=80;
      daily.options.layout={padding:{top:24,right:8,bottom:2,left:4}};
      if(daily.options.plugins?.legend)daily.options.plugins.legend.display=false;
      try{daily.resize();daily.update('none');}catch(err){console.warn('daily chart normalize',err);}
    }
    ['shift','truck','status'].forEach(name=>{
      const c=charts[name];if(!c)return;
      c.options.animation=false;
      c.options.responsive=true;
      c.options.maintainAspectRatio=false;
      c.options.resizeDelay=80;
      c.options.rotation=-90;
      c.options.circumference=360;
      c.options.cutout=name==='shift'?'70%':'66%';
      try{c.resize();c.update('none');}catch(err){console.warn('circle chart normalize',name,err);}
      if((name==='truck'||name==='status')&&typeof buildHtmlLegend==='function'){
        try{buildHtmlLegend(name,c);}catch(_){}
      }
    });
  }

  let postRenderToken=0;
  function postRender(){
    const token=++postRenderToken;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(token!==postRenderToken)return;
      cleanLogo();
      normalizeMainCharts();
      try{if(typeof renderStock==='function')renderStock();}catch(_){}
      updateActiveSection();
    }));
  }

  function refreshDashboard(){
    try{
      if(typeof applyFilters==='function')applyFilters();
      postRender();
    }catch(err){console.warn('dashboard refresh',err);}
  }

  function replaceNodeWithClone(id){
    const old=document.getElementById(id);
    if(!old)return null;
    const clone=old.cloneNode(true);
    if('value' in old)clone.value=old.value;
    old.replaceWith(clone);
    return clone;
  }

  function installSingleFilterPipeline(){
    ['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>{
      const node=replaceNodeWithClone(id);
      if(node)node.addEventListener('change',refreshDashboard,{passive:true});
    });
    const search=replaceNodeWithClone('unitSearch');
    if(search){
      let timer;
      search.addEventListener('input',()=>{
        clearTimeout(timer);
        timer=setTimeout(refreshDashboard,120);
      },{passive:true});
    }
    const reset=replaceNodeWithClone('resetBtn');
    if(reset)reset.addEventListener('click',()=>{
      const st=getState();
      const dates=(st?.raw||[]).map(r=>r.Date).filter(Boolean).sort();
      const from=document.getElementById('dateFrom'),to=document.getElementById('dateTo');
      if(from)from.value=dates[0]||'';
      if(to)to.value=dates.at(-1)||'';
      ['shiftFilter','categoryFilter','truckFilter'].forEach(id=>{
        const e=document.getElementById(id);if(e)e.value='';
      });
      const q=document.getElementById('unitSearch');if(q)q.value='';
      refreshDashboard();
    });
  }

  let resizeTimer;
  function rebuildChartsAfterResize(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{
      try{
        const dash=document.getElementById('dashboard');
        if(!dash?.classList.contains('active-section'))return;
        if(typeof renderCharts==='function')renderCharts();
        normalizeMainCharts();
        cleanLogo();
      }catch(err){console.warn('resize chart rebuild',err);}
    },180);
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
      const avgRows=rows.map(r=>Number(r.Actual_LHM)).filter(v=>Number.isFinite(v)&&v>0);
      const avg=avgRows.length?avgRows.reduce((a,b)=>a+b,0)/avgRows.length:0;
      const over=rows.filter(r=>r.Consumption_Status==='OVER CONSUMPTION');
      const eff=rows.filter(r=>r.Consumption_Status==='EFFICIENT');
      const overL=over.reduce((a,r)=>a+(Number(r.Fuel_Liter)||0),0);
      const effL=eff.reduce((a,r)=>a+(Number(r.Fuel_Liter)||0),0);
      const summary=[
        ['FUEL MANAGEMENT SYSTEM - DASHBOARD EXPORT',''],
        ['PT PRIMA SARANA GEMILANG SITE ABM',''],
        ['PERIOD FROM',from],['PERIOD TO',to],
        ['SHIFT',document.getElementById('shiftFilter')?.value||'All Shift'],
        ['CATEGORY',document.getElementById('categoryFilter')?.value||'All Category'],
        ['FUEL TRUCK',document.getElementById('truckFilter')?.value||'All Fuel Truck'],
        ['SEARCH UNIT',document.getElementById('unitSearch')?.value||''],
        ['TOTAL FUEL ISSUED',total],['AVERAGE / DAY',days?total/days:0],
        ['ACTIVE UNIT',units],['AVG ACTUAL L/HM',avg],
        ['OVER CONSUMPTION',overL],['EFFICIENT',effL],
        ['PHYSICAL STOCK',Number(s?.total)||0],
        ['STOCK SNAPSHOT DATE',s?.snapshotDate||''],['STOCK SNAPSHOT TIME',s?.snapshotTime||'']
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
      document.getElementById('downloadReconCsv')?.remove();
      document.getElementById('exportDashboardExcel')?.addEventListener('click',exportExcel);
    }
  }

  function watchLogo(){
    const box=document.querySelector('.logo-box');
    if(!box||box.dataset.v732Watch)return;
    box.dataset.v732Watch='1';
    let timer;
    new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(cleanLogo,20);
    }).observe(box,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
  }

  function apply(){
    cleanLogo();
    watchLogo();
    try{resolveStockSnapshotFiltered();if(typeof renderStock==='function')renderStock();}catch(_){}
    normalizeMainCharts();
    const version=document.querySelector('.v7-version');
    if(version)version.textContent='Dashboard V7.3.2 Stable';
  }

  installSingleFilterPipeline();
  installExcelOnly();
  apply();
  [180,500,1000,1700,2400].forEach(ms=>setTimeout(apply,ms));
  window.addEventListener('resize',rebuildChartsAfterResize,{passive:true});
  window.addEventListener('orientationchange',rebuildChartsAfterResize,{passive:true});
  window.addEventListener('hashchange',()=>setTimeout(apply,100));
})();
