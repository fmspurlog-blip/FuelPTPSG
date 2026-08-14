(()=>{
  const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
  const safeState=()=>{try{return typeof state!=='undefined'?state:null}catch(_){return null}};
  const safeStock=()=>{try{return typeof stock!=='undefined'?stock:null}catch(_){return null}};
  const safeRecon=()=>{try{return typeof reconData!=='undefined'?reconData:null}catch(_){return null}};

  function setVersion(){
    const v=document.querySelector('.v7-version');
    if(v)v.textContent='Dashboard V7.3.0 Professional';
    const sub=document.querySelector('.hero p');if(sub)sub.textContent='PT PRIMA SARANA GEMILANG SITE ABM';
    const trend=document.querySelector('.trend-panel .title h3');if(trend)trend.innerHTML='Daily Fuel Consumption <small>(Total/Liter)</small>';
  }

  function normalizeLogo(){
    const box=document.querySelector('.logo-box');
    if(!box)return;
    const img=box.querySelector('img');
    if(img){[...box.children].forEach(ch=>{if(ch!==img)ch.remove();});img.style.display='block';}
  }

  function moveAndSyncStock(){
    try{
      if(typeof resolveStockSnapshot==='function')resolveStockSnapshot();
      const s=safeStock();
      const total=document.querySelector('.stock-panel .stock-total');
      const truckCol=document.getElementById('truckStockList')?.parentElement;
      if(total&&truckCol){total.classList.add('v726-stock-total');if(total.parentElement!==truckCol)truckCol.appendChild(total);}
      const fs=Object.values(s?.fuelStorage||{}).reduce((a,b)=>a+(Number(b)||0),0);
      const ft=Object.values(s?.fuelTruck||{}).reduce((a,b)=>a+(Number(b)||0),0);
      const val=fs+ft||Number(s?.total)||0;
      if(s)s.total=val;
      const e=document.getElementById('stockTotal');if(e)e.textContent=fmt(val);
      const label=total?.querySelector(':scope > small');if(label)label.textContent='TOTAL STOCK';
    }catch(err){console.warn('stock sync',err);}
  }

  function polishCharts(){
    try{
      const charts=safeState()?.charts||{};
      const daily=charts.daily;
      if(daily){
        daily.options.animation=false;
        daily.options.maintainAspectRatio=false;
        daily.options.layout={padding:{top:22,right:6,bottom:0,left:2}};
        if(daily.options.plugins?.legend)daily.options.plugins.legend.display=false;
        if(daily.options.plugins?.datalabels){
          daily.options.plugins.datalabels.color='#fff';
          daily.options.plugins.datalabels.font={size:8,weight:'800'};
          daily.options.plugins.datalabels.clamp=true;
          daily.options.plugins.datalabels.clip=false;
          daily.options.plugins.datalabels.formatter=(v,ctx)=>ctx.chart.data.labels.length>20&&ctx.dataIndex%2===1?'':fmt(v);
        }
        if(daily.options.scales?.x?.ticks)daily.options.scales.x.ticks.maxTicksLimit=11;
      }
      ['shift','truck','status'].forEach(name=>{
        const c=charts[name];if(!c)return;
        c.options.animation=false;c.options.rotation=-90;c.options.circumference=360;c.options.maintainAspectRatio=false;
        const ds=c.data?.datasets?.[0];if(ds){ds.borderColor='#07192b';ds.borderWidth=3;ds.spacing=0;ds.hoverOffset=5;}
        if(name==='shift')c.options.cutout='67%';
        if(name==='truck')c.options.cutout='61%';
        if(name==='status')c.options.cutout='58%';
        if(name!=='shift'&&c.options.plugins?.legend)c.options.plugins.legend.display=false;
      });
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        Object.entries(charts).forEach(([name,c])=>{
          if(!c?.canvas?.isConnected)return;
          const sec=c.canvas.closest('.app-section');if(sec&&!sec.classList.contains('active-section'))return;
          try{c.resize();c.update('none');}catch(_){ }
          if((name==='truck'||name==='status')&&typeof buildHtmlLegend==='function')try{buildHtmlLegend(name,c);}catch(_){ }
        });
      }));
    }catch(err){console.warn('chart polish',err);}
  }

  function ensureFilterRefresh(){
    const rerun=()=>{
      try{if(typeof applyFilters==='function')applyFilters();}catch(err){console.warn('filter refresh',err);}
      setTimeout(()=>{moveAndSyncStock();polishCharts();setVersion();normalizeLogo();},40);
    };
    ['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>{
      const el=document.getElementById(id);if(el&&!el.dataset.v730){el.dataset.v730='1';el.addEventListener('change',()=>setTimeout(rerun,0));}
    });
    const q=document.getElementById('unitSearch');if(q&&!q.dataset.v730){q.dataset.v730='1';q.addEventListener('input',()=>setTimeout(rerun,30));}
    const reset=document.getElementById('resetBtn');if(reset&&!reset.dataset.v730){reset.dataset.v730='1';reset.addEventListener('click',()=>setTimeout(rerun,30));}
  }

  function exportExcel(){
    try{
      if(!window.XLSX)throw new Error('Library Excel belum siap.');
      const st=safeState(),s=safeStock(),rd=safeRecon();
      const rows=Array.isArray(st?.filtered)?st.filtered:[];
      const from=document.getElementById('dateFrom')?.value||'',to=document.getElementById('dateTo')?.value||'';
      const wb=XLSX.utils.book_new();
      const total=rows.reduce((a,r)=>a+(Number(r.Fuel_Liter)||0),0),days=new Set(rows.map(r=>r.Date)).size,units=new Set(rows.map(r=>r.Unit_Code)).size;
      const summary=[['FUEL MANAGEMENT SYSTEM - DASHBOARD EXPORT',''],['PT PRIMA SARANA GEMILANG SITE ABM',''],['PERIOD FROM',from],['PERIOD TO',to],['SHIFT',document.getElementById('shiftFilter')?.value||'All Shift'],['CATEGORY',document.getElementById('categoryFilter')?.value||'All Category'],['FUEL TRUCK',document.getElementById('truckFilter')?.value||'All Fuel Truck'],['TOTAL FUEL ISSUED',total],['AVERAGE / DAY',days?total/days:0],['ACTIVE UNIT',units],['PHYSICAL STOCK',Number(s?.total)||0],['STOCK SNAPSHOT DATE',s?.snapshotDate||'']];
      const ws=XLSX.utils.aoa_to_sheet(summary);ws['!cols']=[{wch:30},{wch:24}];XLSX.utils.book_append_sheet(wb,ws,'Dashboard Summary');
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Fuel Usage');
      const stockRows=[];Object.entries(s?.fuelStorage||{}).forEach(([Unit,Liter])=>stockRows.push({Type:'STATIC TANK',Unit,Liter}));Object.entries(s?.fuelTruck||{}).forEach(([Unit,Liter])=>stockRows.push({Type:'FUEL TRUCK',Unit,Liter}));XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(stockRows),'Fuel Stock');
      const recon=(rd?.daily||[]).filter(r=>(!from||r.date>=from)&&(!to||r.date<=to));XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(recon),'Reconciliation');
      const receipt=(rd?.receiptDetails||[]).filter(r=>(!from||r.date>=from)&&(!to||r.date<=to));XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(receipt),'Fuel Receipt');
      XLSX.writeFile(wb,`Fuel_Dashboard_${from||'start'}_${to||'end'}.xlsx`);
    }catch(err){alert('Gagal membuat Excel dashboard: '+err.message);}
  }

  function installExcelOnly(){
    const reports=document.getElementById('reports');if(!reports)return;
    let card=reports.querySelector('.v730-excel-card');
    if(!card){const recon=reports.querySelector('[data-report="recon"]')?.closest('.report-card');if(!recon)return;card=recon;card.classList.add('v730-excel-card');}
    card.innerHTML='<h3>Export Dashboard Excel</h3><p>Export seluruh data dashboard sesuai filter aktif ke workbook Excel.</p><button id="exportDashboardExcel" type="button">EXPORT DASHBOARD EXCEL</button>';
    const b=document.getElementById('exportDashboardExcel');if(b&&!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',exportExcel);}
  }

  function apply(){setVersion();normalizeLogo();moveAndSyncStock();polishCharts();ensureFilterRefresh();installExcelOnly();}
  apply();[180,500,1000,1800].forEach(ms=>setTimeout(apply,ms));
  window.addEventListener('resize',()=>setTimeout(polishCharts,40));
  window.addEventListener('hashchange',()=>setTimeout(apply,80));
})();
