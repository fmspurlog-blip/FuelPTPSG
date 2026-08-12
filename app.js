
Chart.register(ChartDataLabels);
const state={raw:Array.isArray(window.FUEL_DATA)?window.FUEL_DATA:[],filtered:[],page:1,pageSize:5,charts:{}};
const reconData=window.RECON_DATA||{daily:[],availableDates:[]};
const stockData=window.STOCK_DATA||{snapshots:{},availableDates:[]};
let stock={fuelStorage:{},fuelTruck:{},total:0,snapshotDate:'',snapshotTime:''};
function resolveStockSnapshot(){
  const target=(document.getElementById('dateTo')||{}).value||'';
  const dates=(stockData.availableDates||[]).filter(d=>!target||d<=target).sort();
  const selected=dates.length?dates[dates.length-1]:(stockData.availableDates||[])[0];
  const s=selected?(stockData.snapshots||{})[selected]:null;
  stock=s?{...s,snapshotDate:selected,snapshotTime:s.time||''}:{fuelStorage:{},fuelTruck:{},total:0,snapshotDate:'',snapshotTime:''};
}
const el=id=>document.getElementById(id);
const n=v=>Number(v)||0;
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(n(v));
const fmt1=v=>v==null||!Number.isFinite(Number(v))?'-':new Intl.NumberFormat('id-ID',{maximumFractionDigits:2}).format(Number(v));
const pct=v=>v==null||!Number.isFinite(Number(v))?'-':`${(Number(v)*100).toFixed(2)}%`;
const dateID=s=>{if(!s)return'-';const d=new Date(s+'T00:00:00');return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)}
const dateLong=s=>{if(!s)return'-';const d=new Date(s+'T00:00:00');return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(d)}
const productionCategories=new Set(['Excavator','Dump Truck','Dozer','Motor Grader','Compactor','Loader','Wheel Loader']);
const groupSum=(data,key,val='Fuel_Liter')=>data.reduce((m,r)=>{const k=r[key]||'Unknown';m[k]=(m[k]||0)+n(r[val]);return m},{});
const unique=f=>[...new Set(state.raw.map(r=>r[f]).filter(Boolean))].sort();
const sumFuel=d=>d.reduce((a,r)=>a+n(r.Fuel_Liter),0);

function setSelect(id,vals){const s=el(id);[...s.options].slice(1).forEach(o=>o.remove());vals.forEach(v=>s.add(new Option(v,v)))}
function initFilters(){if(!state.raw.length)return;const ds=state.raw.map(r=>r.Date).filter(Boolean).sort();el('dateFrom').value=ds[0];el('dateTo').value=ds.at(-1);setSelect('shiftFilter',unique('Shift'));setSelect('categoryFilter',unique('Category'));setSelect('truckFilter',unique('Fuel_Truck'));updateDates()}
function updateDates(){const a=el('dateFrom').value,b=el('dateTo').value;el('periodSide').textContent=`${dateID(a)} - ${dateID(b)}`;const u=`${dateLong(b)} 06:00 WITA`;el('updateSide').textContent=u;el('topLastUpdate').textContent=u}
function applyFilters(){const from=el('dateFrom').value,to=el('dateTo').value,shift=el('shiftFilter').value,cat=el('categoryFilter').value,truck=el('truckFilter').value,q=el('unitSearch').value.trim().toUpperCase();state.filtered=state.raw.filter(r=>(!from||r.Date>=from)&&(!to||r.Date<=to)&&(!shift||r.Shift===shift)&&(!cat||r.Category===cat)&&(!truck||r.Fuel_Truck===truck)&&(!q||(r.Unit_Code||'').toUpperCase().includes(q)||(r.Unit_Type||'').toUpperCase().includes(q)));state.page=1;updateDates();renderAll()}
function renderKPIs(){const d=state.filtered,f=sumFuel(d),days=new Set(d.map(x=>x.Date)).size,units=new Set(d.map(x=>x.Unit_Code)).size;const av=d.map(x=>Number(x.Actual_LHM)).filter(x=>Number.isFinite(x)&&x>0);const avg=av.length?av.reduce((a,b)=>a+b,0)/av.length:0;const over=d.filter(x=>x.Consumption_Status==='OVER CONSUMPTION'),eff=d.filter(x=>x.Consumption_Status==='EFFICIENT');const overL=sumFuel(over),effL=sumFuel(eff);el('kpiFuel').textContent=fmt(f);el('kpiAvgDay').textContent=fmt(days?f/days:0);el('kpiUnits').textContent=fmt(units);el('kpiAvgLHM').textContent=fmt1(avg);el('kpiOver').textContent=fmt(overL);el('kpiOverPct').textContent=`(${f?((overL/f)*100).toFixed(2):0}%)`;el('kpiEff').textContent=fmt(effL);el('kpiEffPct').textContent=`(${f?((effL/f)*100).toFixed(2):0}%)`}
function chart(name,id,cfg){if(state.charts[name])state.charts[name].destroy();state.charts[name]=new Chart(el(id),cfg)}
const txt='#a6bad0',grid='#29425a80';
const centerText={id:'centerText',afterDraw(c,args,opts){if(!opts||!opts.text)return;const {ctx,chartArea:{left,right,top,bottom}}=c;ctx.save();ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='700 17px Segoe UI';ctx.fillText(opts.text,(left+right)/2,(top+bottom)/2-2);ctx.fillStyle='#c2cede';ctx.font='10px Segoe UI';ctx.fillText(opts.sub||'',(left+right)/2,(top+bottom)/2+15);ctx.restore()}};
Chart.register(centerText);

function renderCharts(){const d=state.filtered,daily=groupSum(d,'Date'),labels=Object.keys(daily).sort();chart('daily','dailyChart',{type:'bar',data:{labels:labels.map(x=>x.slice(8,10)+'/'+x.slice(5,7)),datasets:[{label:'Total Liter',data:labels.map(x=>daily[x]),backgroundColor:'#ff8618',borderColor:'#ffac4b',borderWidth:1,borderRadius:2,maxBarThickness:28}]},options:{responsive:true,maintainAspectRatio:false,layout:{padding:{top:24}},plugins:{legend:{position:'bottom',labels:{color:txt,boxWidth:10}},datalabels:{anchor:'end',align:'top',color:'#fff',font:{size:9,weight:'bold'},formatter:v=>fmt(v),clamp:true}},scales:{x:{ticks:{color:txt,maxRotation:0,autoSkip:true},grid:{display:false}},y:{beginAtZero:true,ticks:{color:txt,callback:v=>fmt(v)},grid:{color:grid}}}}});

const shifts=groupSum(d,'Shift'),shiftEntries=Object.entries(shifts).sort((a,b)=>b[1]-a[1]);const total=sumFuel(d);chart('shift','shiftChart',{type:'doughnut',data:{labels:shiftEntries.map(x=>x[0]),datasets:[{data:shiftEntries.map(x=>x[1]),backgroundColor:['#ff932f','#348cf2','#25bd68','#ffc43b'],borderColor:'#07192b',borderWidth:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false},datalabels:{display:false},centerText:{text:fmt(total),sub:'Liter'}}}});el('shiftLegend').innerHTML=shiftEntries.map((x,i)=>`<div class="shift-item"><i class="shift-dot" style="background:${['#ff932f','#348cf2','#25bd68','#ffc43b'][i%4]}"></i><div><small>${x[0].toUpperCase()}</small><strong>${fmt(x[1])} <span>Liter</span></strong><span>(${total?((x[1]/total)*100).toFixed(2):0}%)</span></div></div>`).join('');

const cats=Object.entries(groupSum(d,'Category')).sort((a,b)=>b[1]-a[1]).slice(0,6);chart('cat','categoryChart',{type:'bar',data:{labels:cats.map(x=>x[0]),datasets:[{data:cats.map(x=>x[1]),backgroundColor:['#2d80ed','#ff8a22','#23b85b','#6437d3','#5c7897','#b674e8'],borderRadius:2}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{anchor:'end',align:'right',color:'#c8d4e1',formatter:v=>`${fmt(v)} (${total?((v/total)*100).toFixed(1):0}%)`,font:{size:8}}},scales:{x:{display:false},y:{ticks:{color:txt,font:{size:8}},grid:{display:false}}}}});

const trucks=Object.entries(groupSum(d,'Fuel_Truck')).filter(x=>x[0]!=='Unknown').sort((a,b)=>b[1]-a[1]);chart('truck','truckChart',{type:'doughnut',data:{labels:trucks.map(x=>x[0]),datasets:[{data:trucks.map(x=>x[1]),backgroundColor:['#ff8b1f','#328af4','#21bc67'],borderColor:'#07192b',borderWidth:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'right',labels:{color:txt,boxWidth:9,font:{size:8},generateLabels:c=>c.data.labels.map((l,i)=>({text:`${l}  ${fmt(c.data.datasets[0].data[i])} L`,fillStyle:c.data.datasets[0].backgroundColor[i],strokeStyle:'transparent',index:i}))}},datalabels:{display:false}}}});

const statusOrder=['OVER CONSUMPTION','WARNING','NORMAL','EFFICIENT','NO STANDARD','NO DATA'];const statusLit={};d.forEach(r=>statusLit[r.Consumption_Status]=(statusLit[r.Consumption_Status]||0)+n(r.Fuel_Liter));const sl=statusOrder.filter(x=>statusLit[x]);const sc={'OVER CONSUMPTION':'#ef4d3e','WARNING':'#ff8b1f','NORMAL':'#328af4','EFFICIENT':'#20a94e','NO STANDARD':'#8493a5','NO DATA':'#53687d'};chart('status','statusChart',{type:'doughnut',data:{labels:sl,datasets:[{data:sl.map(x=>statusLit[x]),backgroundColor:sl.map(x=>sc[x]),borderColor:'#07192b',borderWidth:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'58%',plugins:{legend:{position:'right',labels:{color:txt,boxWidth:8,font:{size:7},generateLabels:c=>c.data.labels.map((l,i)=>({text:`${l}  ${fmt(c.data.datasets[0].data[i])} L`,fillStyle:c.data.datasets[0].backgroundColor[i],strokeStyle:'transparent',index:i}))}},datalabels:{display:false}}}})
}
function renderStock(){
  resolveStockSnapshot();
  const day=stock.snapshotDate
    ? new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(new Date(stock.snapshotDate+'T00:00:00'))
    : '-';
  el('stockDay').textContent=day;
  el('stockDate').textContent=dateLong(stock.snapshotDate);
  el('stockTime').textContent=`${stock.snapshotTime||'-'} WITA`;
  el('stockTotal').textContent=fmt(stock.total);
  el('storageList').innerHTML=Object.entries(stock.fuelStorage||{}).reverse().map(([k,v])=>
    `<div class="stock-row"><b>${k}</b><div class="bar-track"><div class="bar-fill" style="width:${stock.total?Math.min(100,v/stock.total*100):0}%"></div></div><span class="stock-value">${v?fmt(v):'-'}</span></div>`
  ).join('');
  const max=Math.max(1,...Object.values(stock.fuelTruck||{}));
  el('truckStockList').innerHTML=Object.entries(stock.fuelTruck||{}).reverse().map(([k,v])=>
    `<div class="stock-row"><b>${k}</b><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><span class="stock-value">${v?fmt(v):'-'}</span></div>`
  ).join('');
}
function renderUnitType(){const total=sumFuel(state.filtered);let prod=0,support=0;state.filtered.forEach(r=>productionCategories.has(r.Category)?prod+=n(r.Fuel_Liter):support+=n(r.Fuel_Liter));el('productionFuel').textContent=fmt(prod);el('supportFuel').textContent=fmt(support);el('productionPct').textContent=`(${total?((prod/total)*100).toFixed(2):0}%)`;el('supportPct').textContent=`(${total?((support/total)*100).toFixed(2):0}%)`}
function aggregateUnits(){const m={};state.filtered.forEach(r=>{const u=r.Unit_Code||'Unknown';if(!m[u])m[u]={unit:u,cat:r.Category||'',fuel:0,varSum:0,varN:0};m[u].fuel+=n(r.Fuel_Liter);const v=Number(r.Variance_Pct);if(Number.isFinite(v)){m[u].varSum+=v;m[u].varN++}});return Object.values(m).map(x=>({...x,avgVar:x.varN?x.varSum/x.varN:null}))}
function rank(rows,mode){return rows.map((x,i)=>`<div class="rank-line"><span>${i+1}</span><b>${x.unit}</b><span class="${mode==='over'?'danger':mode==='eff'?'success':''}">${mode==='fuel'?fmt(x.fuel):pct(x.avgVar)}</span></div>`).join('')}
function renderRanks(){const u=aggregateUnits();el('topConsumers').innerHTML=rank([...u].sort((a,b)=>b.fuel-a.fuel).slice(0,5),'fuel');el('topOver').innerHTML=rank(u.filter(x=>x.avgVar!=null&&x.avgVar>0).sort((a,b)=>b.avgVar-a.avgVar).slice(0,5),'over');el('topEfficient').innerHTML=rank(u.filter(x=>x.avgVar!=null&&x.avgVar<0).sort((a,b)=>a.avgVar-b.avgVar).slice(0,5),'eff')}
function statusCls(s){return s==='EFFICIENT'?'efficient':s==='WARNING'?'warning':s==='OVER CONSUMPTION'?'over':''}
function renderTable(){const sorted=[...state.filtered].sort((a,b)=>(b.Date+b.Time).localeCompare(a.Date+a.Time)),pages=Math.max(1,Math.ceil(sorted.length/state.pageSize));state.page=Math.min(state.page,pages);const rows=sorted.slice((state.page-1)*state.pageSize,state.page*state.pageSize);el('transactionBody').innerHTML=rows.map(r=>`<tr><td>${dateID(r.Date)}</td><td>${r.Time||''}</td><td>${(r.Shift||'').replace('All Shift ','')}</td><td>${r.Unit_Code||''}</td><td>${r.Category||''}</td><td>${r.Fuel_Truck||''}</td><td>${fmt(r.Fuel_Liter)}</td><td>${fmt1(r.Actual_LHM)}</td><td class="status ${statusCls(r.Consumption_Status)}">${r.Consumption_Status||''}</td></tr>`).join('');el('pageInfo').textContent=`${state.page} / ${pages}`;el('prevPage').disabled=state.page<=1;el('nextPage').disabled=state.page>=pages}

function getReconForFilter(){
  const target=el('dateTo').value||'';
  const rows=(reconData.daily||[]).filter(x=>!target||x.date<=target);
  return rows.length?rows[rows.length-1]:null;
}
function reconStatusClass(s){
  return s==='BALANCE'?'balance':s==='WATCH'?'watch':s==='INVESTIGATE'?'investigate':'baseline';
}
function renderReconciliation(){
  const r=getReconForFilter();
  if(!r){
    ['kpiReceipt','kpiBookStock','kpiPhysicalStock','kpiVariance'].forEach(id=>el(id).textContent='0');
    el('kpiVariancePct').textContent='0%';el('kpiReconStatus').textContent='NO DATA';el('kpiReconDate').textContent='-';
    el('reconSummary').innerHTML='<div class="recon-line"><span>No reconciliation data</span><strong>-</strong></div>';
    return;
  }
  el('kpiReceipt').textContent=fmt(r.receipt);
  el('kpiBookStock').textContent=r.book_closing==null?'-':fmt(r.book_closing);
  el('kpiPhysicalStock').textContent=fmt(r.physical_closing);
  el('kpiVariance').textContent=r.variance_liter==null?'-':`${r.variance_liter>=0?'+':''}${fmt(r.variance_liter)}`;
  el('kpiVariancePct').textContent=r.variance_pct==null?'-':`(${r.variance_pct>=0?'+':''}${(r.variance_pct*100).toFixed(2)}%)`;
  el('kpiReconStatus').textContent=r.status||'-';
  el('kpiReconDate').textContent=dateID(r.date);

  const lines=[
    ['Opening Stock',r.opening_stock],
    ['Fuel Receipt',r.receipt],
    ['Fuel Issued',r.issued],
    ['Book Closing',r.book_closing],
    ['Physical Closing',r.physical_closing],
    ['Variance',r.variance_liter]
  ];
  el('reconSummary').innerHTML=lines.map(([k,v])=>`<div class="recon-line"><span>${k}</span><strong>${v==null?'-':fmt(v)+' L'}</strong></div>`).join('')
    +`<div class="recon-line"><span>Status</span><strong><i class="recon-status ${reconStatusClass(r.status)}">${r.status}</i></strong></div>`;

  const target=el('dateTo').value||'';
  const rows=(reconData.daily||[]).filter(x=>!target||x.date<=target).slice(-15);
  chart('recon','reconChart',{
    type:'line',
    data:{
      labels:rows.map(x=>x.date.slice(8,10)+'/'+x.date.slice(5,7)),
      datasets:[
        {label:'Book Stock',data:rows.map(x=>x.book_closing),borderColor:'#ff8b1f',backgroundColor:'rgba(255,139,31,.12)',tension:.3,spanGaps:true},
        {label:'Physical Stock',data:rows.map(x=>x.physical_closing),borderColor:'#328af4',backgroundColor:'rgba(50,138,244,.10)',tension:.3,spanGaps:true}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{color:txt,boxWidth:10}},datalabels:{display:false}},
      scales:{x:{ticks:{color:txt},grid:{display:false}},y:{ticks:{color:txt,callback:v=>fmt(v)},grid:{color:grid}}}
    }
  });
}
function renderAll(){renderKPIs();renderStock();renderUnitType();renderCharts();renderReconciliation();renderRanks();renderTable()}

function normalize(rows){return rows.map((r,i)=>{const num=x=>(x===''||x==null)?null:Number(x);let date=r.Date;if(typeof date==='number'){const p=XLSX.SSF.parse_date_code(date);date=`${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`}else if(date){const dt=new Date(date);if(!Number.isNaN(dt.getTime()))date=dt.toISOString().slice(0,10)}const actual=num(r.Actual_L_per_HM_KM??r.Actual_LHM),std=num(r.Standard_LHM),vp=num(r.Variance_Pct);let st=r.Consumption_Status||r.Status||'';if(!st)st=std==null?'NO STANDARD':vp==null?'NO DATA':vp<=-.1?'EFFICIENT':vp<=.1?'NORMAL':vp<=.2?'WARNING':'OVER CONSUMPTION';return{Transaction_ID:r.Transaction_ID||`UP-${i}`,Date:date||'',Day:r.Day||'',Time:r.Time||'',Shift:r.Shift||'',Unit_Code:r.Unit_Code||'',Category:r.Category||'',Unit_Type:r.Unit_Type||'',Fuel_Liter:num(r.Fuel_Liter)||0,Actual_LHM:actual,Fuel_Truck:r.Fuel_Truck||'',Standard_LHM:std,Variance_Pct:vp,Consumption_Status:st}}).filter(r=>r.Date&&r.Unit_Code&&r.Fuel_Liter>0)}
el('excelUpload').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const buf=await file.arrayBuffer(),wb=XLSX.read(buf,{type:'array'}),sheet=wb.SheetNames.includes('Fuel_Usage_Clean')?'Fuel_Usage_Clean':wb.SheetNames[0],rows=XLSX.utils.sheet_to_json(wb.Sheets[sheet],{defval:''}),d=normalize(rows);if(!d.length)throw Error('Data transaksi tidak ditemukan. Gunakan sheet Fuel_Usage_Clean.');state.raw=d;initFilters();applyFilters()}catch(err){alert('Gagal membaca Excel: '+err.message)}e.target.value=''});
el('exportBtn').addEventListener('click',()=>{const cols=['Date','Time','Shift','Unit_Code','Category','Fuel_Truck','Fuel_Liter','Actual_LHM','Standard_LHM','Variance_Pct','Consumption_Status'];const csv=[cols.join(','),...state.filtered.map(r=>cols.map(c=>`"${String(r[c]??'').replaceAll('"','""')}"`).join(','))].join('\\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='fuel_dashboard_filtered.csv';a.click();URL.revokeObjectURL(a.href)});
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>el(id).addEventListener('change',applyFilters));el('unitSearch').addEventListener('input',applyFilters);el('resetBtn').addEventListener('click',()=>{initFilters();el('unitSearch').value='';applyFilters()});el('prevPage').onclick=()=>{if(state.page>1){state.page--;renderTable()}};el('nextPage').onclick=()=>{state.page++;renderTable()};

function showSection(sectionId){
  document.querySelectorAll('.app-section').forEach(s=>s.classList.remove('active-section'));
  const target=document.getElementById(sectionId)||document.getElementById('dashboard');
  target.classList.add('active-section');
  document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.section===target.id));
  window.scrollTo({top:0,behavior:'smooth'});
  renderSection(target.id);
}
document.querySelectorAll('.nav-link[data-section]').forEach(a=>{
  a.addEventListener('click',e=>{e.preventDefault();showSection(a.dataset.section);history.replaceState(null,'','#'+a.dataset.section)})
});

function renderSection(id){
  if(id==='fuel-usage') renderUsagePage();
  else if(id==='fuel-stock-page') renderStockPage();
  else if(id==='fuel-receipt') renderReceiptPage();
  else if(id==='fuel-truck') renderFuelTruckPage();
  else if(id==='efficiency-page') renderEfficiencyPage();
  else if(id==='data-quality') renderQualityPage();
  else if(id==='master-data') renderMasterPage();
}

function usageAggUnits(){
  const m={};state.filtered.forEach(r=>{const u=r.Unit_Code||'Unknown';if(!m[u])m[u]={unit:u,cat:r.Category||'',type:r.Unit_Type||'',fuel:0,std:r.Standard_LHM,match:r.Standard_Match};m[u].fuel+=n(r.Fuel_Liter)});
  return Object.values(m);
}
function renderUsagePage(){
  const d=state.filtered,total=sumFuel(d),units=new Set(d.map(r=>r.Unit_Code)).size;
  el('usageTotal').textContent=fmt(total);el('usageTransactions').textContent=fmt(d.length);el('usageUnits').textContent=fmt(units);el('usageAvgTxn').textContent=fmt(d.length?total/d.length:0);
  const daily=groupSum(d,'Date'),labels=Object.keys(daily).sort();
  chart('usageDaily','usageDailyChart',{type:'bar',data:{labels:labels.map(x=>x.slice(8,10)+'/'+x.slice(5,7)),datasets:[{data:labels.map(x=>daily[x]),backgroundColor:'#ff8b1f',borderRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{anchor:'end',align:'top',color:'#fff',font:{size:8},formatter:v=>fmt(v)}},scales:{x:{ticks:{color:txt},grid:{display:false}},y:{ticks:{color:txt,callback:v=>fmt(v)},grid:{color:grid}}}}});
  const top=usageAggUnits().sort((a,b)=>b.fuel-a.fuel).slice(0,10);
  el('usageTopUnits').innerHTML=top.map((x,i)=>`<div class="page-list-row"><em>${i+1}</em><div><b>${x.unit}</b><small>${x.cat}</small></div><strong>${fmt(x.fuel)} L</strong></div>`).join('');
  el('usageTableBody').innerHTML=d.slice().sort((a,b)=>(b.Date+b.Time).localeCompare(a.Date+a.Time)).slice(0,300).map(r=>`<tr><td>${dateID(r.Date)}</td><td>${r.Time||''}</td><td>${r.Shift||''}</td><td>${r.Unit_Code||''}</td><td>${r.Category||''}</td><td>${r.Fuel_Truck||''}</td><td>${fmt(r.Fuel_Liter)}</td><td>${fmt1(r.Actual_LHM)}</td><td>${fmt1(r.Standard_LHM)}</td><td>${pct(r.Variance_Pct)}</td><td>${r.Consumption_Status||''}</td></tr>`).join('');
}
function renderStockPage(){
  resolveStockSnapshot();
  const fs=Object.values(stock.fuelStorage||{}).reduce((a,b)=>a+n(b),0),ft=Object.values(stock.fuelTruck||{}).reduce((a,b)=>a+n(b),0);
  el('stockPageTotal').textContent=fmt(stock.total);el('stockPageFS').textContent=fmt(fs);el('stockPageFT').textContent=fmt(ft);el('stockPageDate').textContent=dateID(stock.snapshotDate);el('stockPageTime').textContent=(stock.snapshotTime||'-')+' WITA';
  const fse=Object.entries(stock.fuelStorage||{});chart('stockFS','stockFSChart',{type:'bar',data:{labels:fse.map(x=>x[0]),datasets:[{data:fse.map(x=>x[1]),backgroundColor:'#328af4'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{anchor:'end',align:'top',color:'#fff',formatter:v=>fmt(v)}},scales:{x:{ticks:{color:txt},grid:{display:false}},y:{ticks:{color:txt},grid:{color:grid}}}}});
  const fte=Object.entries(stock.fuelTruck||{});chart('stockFTPage','stockFTChart',{type:'bar',data:{labels:fte.map(x=>x[0]),datasets:[{data:fte.map(x=>x[1]),backgroundColor:'#ff8b1f'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{anchor:'end',align:'top',color:'#fff',formatter:v=>fmt(v)}},scales:{x:{ticks:{color:txt},grid:{display:false}},y:{ticks:{color:txt},grid:{color:grid}}}}});
  const target=el('dateTo').value||'';const rows=(stockData.availableDates||[]).filter(d=>!target||d<=target).slice(-30);
  chart('stockTrend','stockTrendChart',{type:'line',data:{labels:rows.map(x=>x.slice(8,10)+'/'+x.slice(5,7)),datasets:[{label:'Total Stock',data:rows.map(x=>stockData.snapshots[x].total),borderColor:'#36a0ff',backgroundColor:'rgba(54,160,255,.12)',fill:true,tension:.3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:txt}},datalabels:{display:false}},scales:{x:{ticks:{color:txt},grid:{display:false}},y:{ticks:{color:txt,callback:v=>fmt(v)},grid:{color:grid}}}}});
}
function receiptRowsFiltered(){
  const from=el('dateFrom').value,to=el('dateTo').value;
  return (reconData.receiptDetails||[]).filter(r=>(!from||r.date>=from)&&(!to||r.date<=to));
}
function renderReceiptPage(){
  const rows=receiptRowsFiltered(),total=rows.reduce((a,r)=>a+n(r.qty),0),days=new Set(rows.map(r=>r.date)).size,last=rows.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
  el('receiptTotal').textContent=fmt(total);el('receiptDays').textContent=fmt(days);el('receiptAvg').textContent=fmt(days?total/days:0);el('receiptLast').textContent=last?dateID(last.date):'-';el('receiptLastQty').textContent=last?fmt(last.qty)+' L':'0 L';
  const daily={};rows.forEach(r=>daily[r.date]=(daily[r.date]||0)+n(r.qty));const labels=Object.keys(daily).sort();
  chart('receiptPage','receiptChart',{type:'bar',data:{labels:labels.map(x=>x.slice(8,10)+'/'+x.slice(5,7)),datasets:[{data:labels.map(x=>daily[x]),backgroundColor:'#18ad5b'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{anchor:'end',align:'top',color:'#fff',formatter:v=>fmt(v)}},scales:{x:{ticks:{color:txt},grid:{display:false}},y:{ticks:{color:txt,callback:v=>fmt(v)},grid:{color:grid}}}}});
  el('receiptList').innerHTML=rows.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10).map((r,i)=>`<div class="page-list-row"><em>${i+1}</em><div><b>${dateID(r.date)}</b><small>${r.supplier||r.transportir||'Receipt'}</small></div><strong>${fmt(r.qty)} L</strong></div>`).join('');
}
function renderFuelTruckPage(){
  const fuel=groupSum(state.filtered,'Fuel_Truck'),txn={};state.filtered.forEach(r=>txn[r.Fuel_Truck||'Unknown']=(txn[r.Fuel_Truck||'Unknown']||0)+1);const entries=Object.entries(fuel).filter(x=>x[0]!=='Unknown');
  chart('truckPage','truckPageChart',{type:'doughnut',data:{labels:entries.map(x=>x[0]),datasets:[{data:entries.map(x=>x[1]),backgroundColor:['#328af4','#ff8b1f','#20b96a']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{color:txt}},datalabels:{display:false}}}});
  chart('truckTxn','truckTxnChart',{type:'bar',data:{labels:entries.map(x=>x[0]),datasets:[{data:entries.map(x=>txn[x[0]]||0),backgroundColor:'#6437d3'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{anchor:'end',align:'top',color:'#fff'}},scales:{x:{ticks:{color:txt},grid:{display:false}},y:{ticks:{color:txt},grid:{color:grid}}}}});
  const total=sumFuel(state.filtered);el('truckSummaryList').innerHTML=entries.sort((a,b)=>b[1]-a[1]).map((x,i)=>`<div class="page-list-row"><em>${i+1}</em><div><b>${x[0]}</b><small>${txn[x[0]]||0} transactions</small></div><strong>${fmt(x[1])} L (${total?((x[1]/total)*100).toFixed(1):0}%)</strong></div>`).join('');
}
function renderEfficiencyPage(){
  const c={};state.filtered.forEach(r=>c[r.Consumption_Status]=(c[r.Consumption_Status]||0)+1);
  el('effPageEff').textContent=fmt(c.EFFICIENT||0);el('effPageNormal').textContent=fmt(c.NORMAL||0);el('effPageWarning').textContent=fmt(c.WARNING||0);el('effPageOver').textContent=fmt(c['OVER CONSUMPTION']||0);
  const order=['EFFICIENT','NORMAL','WARNING','OVER CONSUMPTION','NO STANDARD','NO DATA'],labs=order.filter(x=>c[x]);const colors={'EFFICIENT':'#20a94e','NORMAL':'#328af4','WARNING':'#ffb12d','OVER CONSUMPTION':'#ef4d3e','NO STANDARD':'#8493a5','NO DATA':'#53687d'};
  chart('effPageStatus','effStatusChart',{type:'doughnut',data:{labels:labs,datasets:[{data:labs.map(x=>c[x]),backgroundColor:labs.map(x=>colors[x])}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{color:txt}},datalabels:{display:false}}}});
  const u=aggregateUnits().filter(x=>x.avgVar!=null).sort((a,b)=>b.avgVar-a.avgVar).slice(0,15);
  el('effVarianceList').innerHTML=u.map((x,i)=>`<div class="page-list-row"><em>${i+1}</em><div><b>${x.unit}</b><small>${x.cat}</small></div><strong class="${x.avgVar>0?'danger':'success'}">${pct(x.avgVar)}</strong></div>`).join('');
}
function renderQualityPage(){
  const total=state.raw.length,missingStd=state.raw.filter(r=>r.Standard_LHM==null).length,missingFT=state.raw.filter(r=>!r.Fuel_Truck).length,missingHM=state.raw.filter(r=>r.Actual_LHM==null).length,units=new Set(state.raw.map(r=>r.Unit_Code)).size;
  const cards=[
    ['Fuel Transactions',total,'Rows loaded','q-good'],
    ['Unique Units',units,'Master entities','q-good'],
    ['Missing Standard',missingStd,missingStd?'Need review':'Complete',missingStd?'q-watch':'q-good'],
    ['Missing Fuel Truck',missingFT,missingFT?'Need review':'Complete',missingFT?'q-watch':'q-good'],
    ['Missing Actual L/HM',missingHM,missingHM?'Check HM/KM data':'Complete',missingHM?'q-watch':'q-good'],
    ['Stock Snapshot Dates',(stockData.availableDates||[]).length,'Dynamic stock history','q-good'],
    ['Reconciliation Days',(reconData.daily||[]).length,'Book vs physical','q-good'],
    ['Fuel Receipt Entries',(reconData.receiptDetails||[]).length,'Clean receipt records','q-good']
  ];
  el('qualityGrid').innerHTML=cards.map(x=>`<article class="quality-card"><small>${x[0]}</small><strong>${fmt(x[1])}</strong><span class="${x[3]}">${x[2]}</span></article>`).join('');
}
function renderMasterPage(){
  const m={};state.raw.forEach(r=>{if(!m[r.Unit_Code])m[r.Unit_Code]={unit:r.Unit_Code,cat:r.Category,type:r.Unit_Type,std:r.Standard_LHM,match:r.Standard_Match}});
  const rows=Object.values(m).sort((a,b)=>a.unit.localeCompare(b.unit));const withStd=rows.filter(x=>x.std!=null).length;
  el('masterUnitCount').textContent=fmt(rows.length);el('masterStdCount').textContent=fmt(withStd);el('masterNoStdCount').textContent=fmt(rows.length-withStd);el('masterCatCount').textContent=fmt(new Set(rows.map(x=>x.cat)).size);
  el('masterTableBody').innerHTML=rows.map(x=>`<tr><td>${x.unit}</td><td>${x.cat||''}</td><td>${x.type||''}</td><td>${fmt1(x.std)}</td><td>${x.std==null?'NO STANDARD':'MATCHED'}</td></tr>`).join('');
}
function csvDownload(filename,headers,rows){
  const csv=[headers.join(','),...rows.map(r=>headers.map(h=>`"${String(r[h]??'').replaceAll('"','""')}"`).join(','))].join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
}
document.querySelectorAll('[data-report]').forEach(btn=>btn.addEventListener('click',()=>{
  const type=btn.dataset.report;
  if(type==='usage') csvDownload('Fuel_Usage_Report.csv',['Date','Time','Shift','Unit_Code','Category','Fuel_Truck','Fuel_Liter','Actual_LHM','Standard_LHM','Variance_Pct','Consumption_Status'],state.filtered);
  if(type==='receipt') csvDownload('Fuel_Receipt_Report.csv',['date','qty','supplier','transportir','reference','fuelTruck'],receiptRowsFiltered());
  if(type==='recon') csvDownload('Fuel_Reconciliation_Report.csv',['date','opening_stock','receipt','issued','book_closing','physical_closing','variance_liter','variance_pct','status'],reconData.daily||[]);
}));
const reconBtn=document.getElementById('downloadReconCsv');if(reconBtn)reconBtn.addEventListener('click',()=>csvDownload('Fuel_Reconciliation_Report.csv',['date','opening_stock','receipt','issued','book_closing','physical_closing','variance_liter','variance_pct','status'],reconData.daily||[]));
const initialSection=location.hash.replace('#','');if(initialSection&&document.getElementById(initialSection))showSection(initialSection);

initFilters();state.filtered=[...state.raw];renderAll();
