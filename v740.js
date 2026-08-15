(()=>{
  'use strict';
  const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
  const txt='#a6bad0',grid='#29425a80';
  let logoSrc='';
  let logoGuard=false;
  let resizeTimer=0;

  const E=id=>document.getElementById(id);
  const N=v=>Number(v)||0;
  const S=()=>{try{return state}catch(_){return null}};
  const ST=()=>{try{return stock}catch(_){return null}};
  const SD=()=>{try{return stockData}catch(_){return window.STOCK_DATA||{snapshots:{},availableDates:[]}}};

  function captureLogo(){
    const img=document.querySelector('.logo-box img');
    if(img&&(img.currentSrc||img.src))logoSrc=img.currentSrc||img.src;
  }
  function ensureLogo(){
    const box=document.querySelector('.logo-box');
    if(!box||logoGuard)return;
    if(!logoSrc){const current=box.querySelector('img');if(current&&(current.currentSrc||current.src))logoSrc=current.currentSrc||current.src;}
    if(!logoSrc)return;
    const imgs=[...box.querySelectorAll('img')];
    if(imgs.length===1&&box.children.length===1&&imgs[0].src===logoSrc)return;
    logoGuard=true;
    box.innerHTML='';
    const img=document.createElement('img');
    img.src=logoSrc;img.alt='PRIMA - PT Prima Sarana Gemilang';img.decoding='async';
    box.appendChild(img);
    logoGuard=false;
  }

  function chartInstance(name,id,type,data,options){
    const st=S(),canvas=E(id);if(!st||!canvas)return null;
    let c=st.charts?.[name]||null;
    const registered=typeof Chart!=='undefined'&&Chart.getChart?Chart.getChart(canvas):null;
    if(!c&&registered)c=registered;
    if(c&&c.canvas!==canvas){try{c.destroy()}catch(_){ }c=null;}
    if(c&&c.config?.type!==type){try{c.destroy()}catch(_){ }c=null;}
    if(!c){
      if(registered&&registered!==c){try{registered.destroy()}catch(_){ }}
      c=new Chart(canvas,{type,data,options});
      st.charts[name]=c;
    }else{
      c.data=data;
      c.options=options;
      c.options.animation=false;
      c.resize();
      c.update('none');
      st.charts[name]=c;
    }
    return c;
  }

  function htmlLegend(name,c){
    if(!c?.canvas)return;
    const wrap=c.canvas.parentElement;if(!wrap)return;
    wrap.classList.add('v740-chart-layout');
    wrap.querySelectorAll('.v740-html-legend').forEach(x=>x.remove());
    const host=document.createElement('div');host.className='v740-html-legend';
    const labels=c.data.labels||[],ds=c.data.datasets?.[0]||{},vals=ds.data||[],colors=Array.isArray(ds.backgroundColor)?ds.backgroundColor:[];
    const total=vals.reduce((a,b)=>a+N(b),0);
    host.innerHTML=labels.map((label,i)=>{
      const val=N(vals[i]);const p=total?((val/total)*100).toFixed(2):'0.00';
      const text=name==='truck'?`${label} ${fmt(val)} L`:`${label} ${fmt(val)} L (${p}%)`;
      return `<div class="v740-legend-row"><i style="background:${colors[i]||'#fff'}"></i><span>${text}</span></div>`;
    }).join('');
    wrap.appendChild(host);
  }

  function renderStableCharts(){
    const st=S();if(!st)return;
    const d=Array.isArray(st.filtered)?st.filtered:[];
    const total=d.reduce((a,r)=>a+N(r.Fuel_Liter),0);
    const group=(key)=>d.reduce((m,r)=>{const k=r[key]||'Unknown';m[k]=(m[k]||0)+N(r.Fuel_Liter);return m},{});

    try{
      const daily=group('Date'),labels=Object.keys(daily).sort();
      chartInstance('daily','dailyChart','bar',{
        labels:labels.map(x=>x.slice(8,10)+'/'+x.slice(5,7)),
        datasets:[{label:'Total Liter',data:labels.map(x=>daily[x]),backgroundColor:'#ff8618',borderColor:'#ffac4b',borderWidth:1,borderRadius:3,maxBarThickness:28}]
      },{responsive:true,maintainAspectRatio:false,animation:false,resizeDelay:60,layout:{padding:{top:22,right:8,bottom:2,left:2}},plugins:{legend:{display:false},datalabels:{anchor:'end',align:'top',color:'#fff',font:{size:8,weight:'bold'},formatter:v=>fmt(v),clamp:true,clip:false}},scales:{x:{ticks:{color:txt,maxRotation:0,autoSkip:true,maxTicksLimit:12},grid:{display:false}},y:{beginAtZero:true,ticks:{color:txt,callback:v=>fmt(v)},grid:{color:grid}}}});
    }catch(err){console.error('Daily chart render failed',err);}

    try{
      const entries=Object.entries(group('Shift')).sort((a,b)=>b[1]-a[1]);
      chartInstance('shift','shiftChart','doughnut',{labels:entries.map(x=>x[0]),datasets:[{data:entries.map(x=>x[1]),backgroundColor:['#ff932f','#348cf2','#25bd68','#ffc43b'],borderColor:'#07192b',borderWidth:3,hoverOffset:4}]},{responsive:true,maintainAspectRatio:false,animation:false,cutout:'68%',rotation:-90,circumference:360,plugins:{legend:{display:false},datalabels:{display:false},centerText:{text:fmt(total),sub:'Liter'}}});
      const legend=E('shiftLegend');if(legend)legend.innerHTML=entries.map((x,i)=>`<div class="shift-item"><i class="shift-dot" style="background:${['#ff932f','#348cf2','#25bd68','#ffc43b'][i%4]}"></i><div><small>${String(x[0]).toUpperCase()}</small><strong>${fmt(x[1])} <span>Liter</span></strong><span>(${total?((x[1]/total)*100).toFixed(2):0}%)</span></div></div>`).join('');
    }catch(err){console.error('Shift chart render failed',err);}

    try{
      const cats=Object.entries(group('Category')).sort((a,b)=>b[1]-a[1]).slice(0,6);
      chartInstance('cat','categoryChart','bar',{labels:cats.map(x=>x[0]),datasets:[{data:cats.map(x=>x[1]),backgroundColor:['#2d80ed','#ff8a22','#23b85b','#6437d3','#5c7897','#b674e8'],borderRadius:2}]},{indexAxis:'y',responsive:true,maintainAspectRatio:false,animation:false,layout:{padding:{right:80}},plugins:{legend:{display:false},datalabels:{anchor:'end',align:'right',color:'#d8e6f4',clip:false,clamp:false,formatter:v=>`${fmt(v)} (${total?((v/total)*100).toFixed(1):0}%)`,font:{size:8,weight:'bold'}}},scales:{x:{display:false},y:{ticks:{color:txt,font:{size:8}},grid:{display:false}}}});
    }catch(err){console.error('Category chart render failed',err);}

    try{
      const trucks=Object.entries(group('Fuel_Truck')).filter(x=>x[0]!=='Unknown').sort((a,b)=>b[1]-a[1]);
      const c=chartInstance('truck','truckChart','doughnut',{labels:trucks.map(x=>x[0]),datasets:[{data:trucks.map(x=>x[1]),backgroundColor:['#ff8b1f','#328af4','#21bc67','#8d6df1'],borderColor:'#07192b',borderWidth:3,hoverOffset:4}]},{responsive:true,maintainAspectRatio:false,animation:false,cutout:'64%',rotation:-90,circumference:360,plugins:{legend:{display:false},datalabels:{display:false}}});
      htmlLegend('truck',c);
    }catch(err){console.error('Truck chart render failed',err);}

    try{
      const order=['OVER CONSUMPTION','WARNING','NORMAL','EFFICIENT','NO STANDARD','NO DATA'],map={};
      d.forEach(r=>map[r.Consumption_Status]=(map[r.Consumption_Status]||0)+N(r.Fuel_Liter));
      const labels=order.filter(x=>map[x]);
      const colors={'OVER CONSUMPTION':'#ef4d3e','WARNING':'#ff8b1f','NORMAL':'#328af4','EFFICIENT':'#20a94e','NO STANDARD':'#8493a5','NO DATA':'#53687d'};
      const c=chartInstance('status','statusChart','doughnut',{labels,datasets:[{data:labels.map(x=>map[x]),backgroundColor:labels.map(x=>colors[x]),borderColor:'#07192b',borderWidth:3,hoverOffset:4}]},{responsive:true,maintainAspectRatio:false,animation:false,cutout:'64%',rotation:-90,circumference:360,plugins:{legend:{display:false},datalabels:{display:false}}});
      htmlLegend('status',c);
    }catch(err){console.error('Status chart render failed',err);}
  }

  function effectiveStockSnapshot(){
    const sd=SD();
    const st=S();
    const dates=(sd.availableDates||[]).slice().sort();
    const filteredDates=(st?.filtered||[]).map(r=>r.Date).filter(Boolean).sort();
    const requested=filteredDates.length?filteredDates[filteredDates.length-1]:(E('dateTo')?.value||'');
    const eligible=dates.filter(d=>!requested||d<=requested);
    const selected=eligible.length?eligible[eligible.length-1]:(dates[0]||'');
    const src=selected?sd.snapshots?.[selected]:null;
    if(!src)return {fuelStorage:{},fuelTruck:{},total:0,snapshotDate:'',snapshotTime:''};
    const truckFilter=E('truckFilter')?.value||'';
    const fuelTruck={};
    Object.entries(src.fuelTruck||{}).forEach(([k,v])=>{if(!truckFilter||k===truckFilter)fuelTruck[k]=N(v)});
    const fuelStorage={...src.fuelStorage};
    const total=Object.values(fuelStorage).reduce((a,b)=>a+N(b),0)+Object.values(fuelTruck).reduce((a,b)=>a+N(b),0);
    return {...src,fuelStorage,fuelTruck,total,snapshotDate:selected,snapshotTime:src.time||src.snapshotTime||''};
  }

  function renderStableStock(){
    try{
      const s=effectiveStockSnapshot();
      const target=ST();if(target)Object.assign(target,s);
      const day=s.snapshotDate?new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(new Date(s.snapshotDate+'T00:00:00')):'-';
      if(E('stockDay'))E('stockDay').textContent=day;
      if(E('stockDate'))E('stockDate').textContent=s.snapshotDate?new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(s.snapshotDate+'T00:00:00')):'-';
      if(E('stockTime'))E('stockTime').textContent=`${s.snapshotTime||'-'} WITA`;
      if(E('stockTotal'))E('stockTotal').textContent=fmt(s.total);
      if(E('storageList'))E('storageList').innerHTML=Object.entries(s.fuelStorage||{}).reverse().map(([k,v])=>`<div class="stock-row"><b>${k}</b><div class="bar-track"><div class="bar-fill" style="width:${s.total?Math.min(100,N(v)/s.total*100):0}%"></div></div><span class="stock-value">${N(v)?fmt(v):'-'}</span></div>`).join('');
      if(E('truckStockList')){
        const max=Math.max(1,...Object.values(s.fuelTruck||{}).map(N));
        E('truckStockList').innerHTML=Object.entries(s.fuelTruck||{}).reverse().map(([k,v])=>`<div class="stock-row"><b>${k}</b><div class="bar-track"><div class="bar-fill" style="width:${N(v)/max*100}%"></div></div><span class="stock-value">${N(v)?fmt(v):'-'}</span></div>`).join('');
      }
      const totalEl=document.querySelector('.stock-panel .stock-total');
      const truckCol=E('truckStockList')?.parentElement;
      if(totalEl&&truckCol){totalEl.classList.remove('v726-stock-total');totalEl.classList.add('v740-stock-total');if(totalEl.parentElement!==truckCol)truckCol.appendChild(totalEl);const small=totalEl.querySelector(':scope > small');if(small)small.textContent='TOTAL STOCK';}
    }catch(err){console.error('Stock render failed',err);}
  }

  function safeRenderAll(){
    const jobs=[
      ['KPI',()=>renderKPIs()],
      ['Stock',()=>renderStableStock()],
      ['UnitType',()=>renderUnitType()],
      ['Charts',()=>renderStableCharts()],
      ['Recon',()=>renderReconciliation()],
      ['Ranks',()=>renderRanks()],
      ['Table',()=>renderTable()]
    ];
    jobs.forEach(([name,fn])=>{try{fn()}catch(err){console.error(name+' render failed',err)}});
  }

  function stableApplyFilters(){
    const st=S();if(!st)return;
    const from=E('dateFrom')?.value||'',to=E('dateTo')?.value||'',shift=E('shiftFilter')?.value||'',cat=E('categoryFilter')?.value||'',truck=E('truckFilter')?.value||'',q=(E('unitSearch')?.value||'').trim().toUpperCase();
    st.filtered=st.raw.filter(r=>(!from||r.Date>=from)&&(!to||r.Date<=to)&&(!shift||r.Shift===shift)&&(!cat||r.Category===cat)&&(!truck||r.Fuel_Truck===truck)&&(!q||(r.Unit_Code||'').toUpperCase().includes(q)||(r.Unit_Type||'').toUpperCase().includes(q)));
    st.page=1;
    try{updateDates()}catch(_){ }
    safeRenderAll();
  }

  function cloneControl(id,event,handler){
    const old=E(id);if(!old)return null;
    const node=old.cloneNode(true);node.value=old.value;old.replaceWith(node);node.addEventListener(event,handler);return node;
  }
  function installFilterPipeline(){
    ['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>cloneControl(id,'change',stableApplyFilters));
    let timer=0;
    cloneControl('unitSearch','input',()=>{clearTimeout(timer);timer=setTimeout(stableApplyFilters,80)});
    cloneControl('resetBtn','click',()=>{
      const st=S();if(!st?.raw?.length)return;
      const dates=st.raw.map(r=>r.Date).filter(Boolean).sort();
      if(E('dateFrom'))E('dateFrom').value=dates[0]||'';if(E('dateTo'))E('dateTo').value=dates.at(-1)||'';
      ['shiftFilter','categoryFilter','truckFilter'].forEach(id=>{if(E(id))E(id).value=''});if(E('unitSearch'))E('unitSearch').value='';stableApplyFilters();
    });
  }

  function exportExcel(){
    try{
      if(!window.XLSX)throw new Error('Library Excel belum siap');
      const st=S(),s=ST(),rows=st?.filtered||[],from=E('dateFrom')?.value||'',to=E('dateTo')?.value||'';
      const total=rows.reduce((a,r)=>a+N(r.Fuel_Liter),0),days=new Set(rows.map(r=>r.Date)).size,units=new Set(rows.map(r=>r.Unit_Code)).size;
      const av=rows.map(r=>Number(r.Actual_LHM)).filter(v=>Number.isFinite(v)&&v>0),avg=av.length?av.reduce((a,b)=>a+b,0)/av.length:0;
      const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['FUEL MANAGEMENT SYSTEM - DASHBOARD EXPORT',''],['PT PRIMA SARANA GEMILANG SITE ABM',''],['PERIOD FROM',from],['PERIOD TO',to],['SHIFT',E('shiftFilter')?.value||'All Shift'],['CATEGORY',E('categoryFilter')?.value||'All Category'],['FUEL TRUCK',E('truckFilter')?.value||'All Fuel Truck'],['TOTAL FUEL ISSUED',total],['AVERAGE / DAY',days?total/days:0],['ACTIVE UNIT',units],['AVG ACTUAL L/HM',avg],['PHYSICAL STOCK',N(s?.total)],['STOCK SNAPSHOT DATE',s?.snapshotDate||'']]),'Dashboard Summary');
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Fuel Usage');
      const sr=[];Object.entries(s?.fuelStorage||{}).forEach(([Unit,Liter])=>sr.push({Type:'STATIC TANK',Unit,Liter}));Object.entries(s?.fuelTruck||{}).forEach(([Unit,Liter])=>sr.push({Type:'FUEL TRUCK',Unit,Liter}));XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(sr),'Fuel Stock');
      XLSX.writeFile(wb,`Fuel_Dashboard_${from||'start'}_${to||'end'}.xlsx`);
    }catch(err){alert('Gagal membuat Excel dashboard: '+err.message)}
  }
  function installExcel(){
    const old=E('exportBtn');if(old){const b=old.cloneNode(true);b.innerHTML='⇩<span>EXPORT EXCEL</span>';old.replaceWith(b);b.addEventListener('click',exportExcel)}
    const reports=E('reports');if(reports){const cards=reports.querySelector('.report-cards');if(cards)cards.innerHTML='<article class="report-card"><h3>Export Dashboard Excel</h3><p>Export data dashboard sesuai filter aktif ke workbook Excel.</p><button id="exportDashboardExcel" type="button">EXPORT DASHBOARD EXCEL</button></article>';E('downloadReconCsv')?.remove();E('exportDashboardExcel')?.addEventListener('click',exportExcel)}
  }

  function installResizeGuard(){
    const fix=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const c=S()?.charts?.daily;if(c?.canvas?.isConnected){try{c.resize();c.update('none')}catch(err){console.warn('daily resize',err)}}},90)};
    window.addEventListener('resize',fix,{passive:true});
    if(window.ResizeObserver){const host=document.querySelector('.trend-panel .chart');if(host)new ResizeObserver(fix).observe(host)}
  }

  captureLogo();
  installFilterPipeline();
  installExcel();
  installResizeGuard();
  const box=document.querySelector('.logo-box');if(box&&window.MutationObserver)new MutationObserver(()=>ensureLogo()).observe(box,{childList:true,subtree:false});
  ensureLogo();
  stableApplyFilters();
  const version=document.querySelector('.v7-version');if(version)version.textContent='Dashboard Stable';
  [100,350,900,1700].forEach(ms=>setTimeout(()=>{ensureLogo();renderStableStock();renderStableCharts()},ms));
})();
