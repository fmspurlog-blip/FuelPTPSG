(()=>{
  const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);

  function setVersion(){
    const version=document.querySelector('.v7-version');
    if(version) version.textContent='Dashboard V7.2.8 Professional';
    const trend=document.querySelector('.trend-panel .title h3');
    if(trend) trend.innerHTML='Daily Fuel Consumption <small>(Total/Liter)</small>';
  }

  function syncStockTotal(){
    try{
      const panel=document.querySelector('.stock-panel');
      const total=panel?.querySelector('.stock-total');
      const cols=panel?.querySelector('.stock-cols');
      if(!panel||!total||!cols) return;
      total.classList.add('v727-stock-total');
      if(total.parentElement!==panel) panel.insertBefore(total,cols);

      const fs=Object.values(window.stock?.fuelStorage||{}).reduce((a,b)=>a+(Number(b)||0),0);
      const ft=Object.values(window.stock?.fuelTruck||{}).reduce((a,b)=>a+(Number(b)||0),0);
      const calculated=fs+ft;
      if(window.stock && calculated>0) window.stock.total=calculated;
      const totalEl=document.getElementById('stockTotal');
      if(totalEl) totalEl.textContent=fmt(window.stock?.total||calculated);
      const small=total.querySelector(':scope > small');
      if(small) small.textContent='TOTAL STOCK';
    }catch(err){console.warn('Stock sync skipped',err);}
  }

  function resizeVisibleCharts(){
    try{
      const charts=(window.state&&state.charts)||{};
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        Object.values(charts).forEach(c=>{
          if(!c||!c.canvas||!c.canvas.isConnected) return;
          const section=c.canvas.closest('.app-section');
          if(section && !section.classList.contains('active-section')) return;
          try{c.resize();c.update('none');}catch(_){ }
        });
      }));
    }catch(err){console.warn('Chart resize skipped',err);}
  }

  function polishDonuts(){
    try{
      const charts=(window.state&&state.charts)||{};
      ['shift','truck','status'].forEach(name=>{
        const c=charts[name];
        if(!c) return;
        const ds=c.data?.datasets?.[0];
        if(ds){ds.borderColor='#07192b';ds.borderWidth=3;ds.spacing=0;ds.hoverOffset=4;}
        c.options.animation=false;
        c.options.rotation=-90;
        c.options.circumference=360;
        c.options.layout={padding:2};
        if(name==='shift') c.options.cutout='64%';
        if(name==='truck') c.options.cutout='61%';
        if(name==='status') c.options.cutout='58%';
        try{c.update('none');}catch(_){ }
      });
    }catch(err){console.warn('Donut polish skipped',err);}
  }

  function tidyTitles(){
    const t=document.querySelector('#topOver')?.closest('.rank')?.querySelector('.title span');
    if(t) t.innerHTML='TOP 5 OVER CONSUMPTION <i>(VAR %)</i>';
  }

  function reportRows(){
    const d=(window.state&&Array.isArray(state.filtered))?state.filtered:[];
    return d.map(r=>({
      Date:r.Date||'',Time:r.Time||'',Shift:r.Shift||'',Unit_Code:r.Unit_Code||'',Category:r.Category||'',Unit_Type:r.Unit_Type||'',Fuel_Truck:r.Fuel_Truck||'',Fuel_Liter:Number(r.Fuel_Liter)||0,Actual_LHM:r.Actual_LHM??'',Standard_LHM:r.Standard_LHM??'',Variance_Pct:r.Variance_Pct??'',Consumption_Status:r.Consumption_Status||''
    }));
  }

  function exportDashboardExcel(){
    try{
      if(!window.XLSX) throw new Error('Library Excel belum siap.');
      const wb=XLSX.utils.book_new();
      const from=document.getElementById('dateFrom')?.value||'';
      const to=document.getElementById('dateTo')?.value||'';
      const rows=reportRows();
      const total=rows.reduce((a,r)=>a+(Number(r.Fuel_Liter)||0),0);
      const days=new Set(rows.map(r=>r.Date).filter(Boolean)).size;
      const units=new Set(rows.map(r=>r.Unit_Code).filter(Boolean)).size;
      const over=rows.filter(r=>r.Consumption_Status==='OVER CONSUMPTION').reduce((a,r)=>a+(Number(r.Fuel_Liter)||0),0);
      const efficient=rows.filter(r=>r.Consumption_Status==='EFFICIENT').reduce((a,r)=>a+(Number(r.Fuel_Liter)||0),0);

      const summary=[
        ['FUEL MANAGEMENT SYSTEM - DASHBOARD EXPORT',''],
        ['PT PRIMA SARANA GEMILANG SITE ABM',''],
        ['Period From',from],['Period To',to],
        ['Shift',document.getElementById('shiftFilter')?.value||'All Shift'],
        ['Category',document.getElementById('categoryFilter')?.value||'All Category'],
        ['Fuel Truck',document.getElementById('truckFilter')?.value||'All Fuel Truck'],
        ['Search Unit',document.getElementById('unitSearch')?.value||''],
        ['Total Fuel Issued (Liter)',total],['Average / Day (Liter)',days?total/days:0],['Active Unit',units],['Over Consumption (Liter)',over],['Efficient (Liter)',efficient],
        ['Physical Stock (Liter)',Number(window.stock?.total)||0],['Stock Snapshot Date',window.stock?.snapshotDate||''],['Stock Snapshot Time',window.stock?.snapshotTime||'']
      ];
      const wsSummary=XLSX.utils.aoa_to_sheet(summary);
      wsSummary['!cols']=[{wch:34},{wch:24}];
      XLSX.utils.book_append_sheet(wb,wsSummary,'Dashboard Summary');

      const wsUsage=XLSX.utils.json_to_sheet(rows);
      wsUsage['!cols']=[{wch:12},{wch:10},{wch:10},{wch:16},{wch:18},{wch:18},{wch:18},{wch:14},{wch:14},{wch:14},{wch:14},{wch:22}];
      XLSX.utils.book_append_sheet(wb,wsUsage,'Fuel Usage');

      const stockRows=[];
      Object.entries(window.stock?.fuelStorage||{}).forEach(([unit,value])=>stockRows.push({Stock_Type:'STATIC TANK',Unit:unit,Liter:Number(value)||0,Snapshot_Date:window.stock?.snapshotDate||'',Snapshot_Time:window.stock?.snapshotTime||''}));
      Object.entries(window.stock?.fuelTruck||{}).forEach(([unit,value])=>stockRows.push({Stock_Type:'FUEL TRUCK',Unit:unit,Liter:Number(value)||0,Snapshot_Date:window.stock?.snapshotDate||'',Snapshot_Time:window.stock?.snapshotTime||''}));
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(stockRows),'Fuel Stock');

      const recon=((window.reconData?.daily)||[]).filter(r=>(!from||r.date>=from)&&(!to||r.date<=to));
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(recon),'Reconciliation');

      const receipt=((window.reconData?.receiptDetails)||[]).filter(r=>(!from||r.date>=from)&&(!to||r.date<=to));
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(receipt),'Fuel Receipt');

      XLSX.writeFile(wb,`Fuel_Dashboard_${from||'start'}_${to||'end'}.xlsx`);
    }catch(err){console.error(err);alert('Gagal membuat Excel dashboard: '+err.message);}
  }

  function installExcelOnlyReport(){
    const reports=document.getElementById('reports');
    if(!reports) return;
    let card=reports.querySelector('.v727-dashboard-export-card')||reports.querySelector('.v726-print-card');
    if(!card){
      const reconBtn=reports.querySelector('[data-report="recon"]');
      card=reconBtn?.closest('.report-card');
    }
    if(!card) return;
    card.classList.add('v727-dashboard-export-card');
    card.innerHTML='<h3>Export Dashboard Excel</h3><p>Export data dashboard sesuai filter aktif ke workbook Excel lengkap.</p><button id="exportDashboardExcel" type="button">EXPORT DASHBOARD EXCEL</button>';
    const btn=document.getElementById('exportDashboardExcel');
    if(btn&&!btn.dataset.bound){btn.dataset.bound='1';btn.addEventListener('click',exportDashboardExcel);}
  }

  function afterRender(){
    setVersion();
    syncStockTotal();
    tidyTitles();
    polishDonuts();
    installExcelOnlyReport();
    resizeVisibleCharts();
  }

  afterRender();
  setTimeout(afterRender,350);
  setTimeout(afterRender,1100);

  ['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',()=>setTimeout(afterRender,40));
  });
  document.getElementById('unitSearch')?.addEventListener('input',()=>setTimeout(afterRender,60));
  document.getElementById('resetBtn')?.addEventListener('click',()=>setTimeout(afterRender,60));
  window.addEventListener('hashchange',()=>setTimeout(afterRender,80));
  window.addEventListener('resize',()=>resizeVisibleCharts());
})();