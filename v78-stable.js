(()=>{
'use strict';
const VER='78.0';
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
const dateID=s=>{if(!s)return'-';const d=new Date(String(s)+'T00:00:00');return Number.isNaN(d.getTime())?String(s):new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)};
const dateLong=s=>{if(!s)return'-';const d=new Date(String(s)+'T00:00:00');return Number.isNaN(d.getTime())?String(s):new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(d)};
const dayName=s=>{if(!s)return'-';const d=new Date(String(s)+'T00:00:00');return Number.isNaN(d.getTime())?'-':new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(d)};

/* ---------- FINAL BRAND: no external image dependency ---------- */
function renderBrand(){
  const box=document.querySelector('.logo-box');
  if(!box)return;
  box.innerHTML=`<div class="v78-brand"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 8h23a5 5 0 0 1 5 5v35H13V13a5 5 0 0 1 5-5Z" fill="#1288f7"/><path d="M20 16h18v12H20z" fill="#dff1ff"/><path d="M46 20h6l6 7v18a6 6 0 0 1-12 0V34h5v11a1 1 0 0 0 2 0V29l-7-8Z" fill="#ff9b25"/><path d="M9 48h42v8H9z" fill="#0b5ca8"/><circle cx="29" cy="39" r="4" fill="#fff"/></svg><div><strong>REFUELING CONTROL</strong><span>FUEL MANAGEMENT SYSTEM</span><small>PT PRIMA SARANA GEMILANG</small></div></div>`;
}

/* ---------- STOCK: newest stock is independent from Fuel Usage period ---------- */
function normalizeStockTime(){ return '06:00'; }
function newestStock(){
  const dates=[...(typeof stockData!=='undefined'&&stockData?.availableDates||[])].filter(Boolean).sort();
  const selected=dates.at(-1)||'';
  const s=selected?(stockData?.snapshots||{})[selected]:null;
  return s?{...s,snapshotDate:selected,snapshotTime:normalizeStockTime(s.time)}:{fuelStorage:{},fuelTruck:{},total:0,snapshotDate:'',snapshotTime:'06:00'};
}
try{resolveStockSnapshot=function(){stock=newestStock();};}catch(e){console.warn('V78 stock resolver',e)}
function renderStockFinal(){
  try{stock=newestStock();}catch(_){return}
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
  set('stockDay',dayName(stock.snapshotDate));
  set('stockDate',dateLong(stock.snapshotDate));
  set('stockTime',`${normalizeStockTime()} WITA`);
  set('stockTotal',fmt(stock.total));
  const storage=document.getElementById('storageList');
  if(storage)storage.innerHTML=Object.entries(stock.fuelStorage||{}).reverse().map(([k,v])=>`<div class="stock-row"><b>${k}</b><div class="bar-track"><div class="bar-fill" style="width:${stock.total?Math.min(100,(Number(v)||0)/stock.total*100):0}%"></div></div><span class="stock-value">${Number(v)?fmt(v):'-'}</span></div>`).join('');
  const truck=document.getElementById('truckStockList');
  if(truck){const vals=Object.values(stock.fuelTruck||{}).map(Number),max=Math.max(1,...vals);truck.innerHTML=Object.entries(stock.fuelTruck||{}).reverse().map(([k,v])=>`<div class="stock-row"><b>${k}</b><div class="bar-track"><div class="bar-fill" style="width:${(Number(v)||0)/max*100}%"></div></div><span class="stock-value">${Number(v)?fmt(v):'-'}</span></div>`).join('')}
  set('stockPageTotal',fmt(stock.total));
  const fs=Object.values(stock.fuelStorage||{}).reduce((a,b)=>a+(Number(b)||0),0),ft=Object.values(stock.fuelTruck||{}).reduce((a,b)=>a+(Number(b)||0),0);
  set('stockPageFS',fmt(fs));set('stockPageFT',fmt(ft));set('stockPageDate',dateID(stock.snapshotDate));set('stockPageTime','06:00 WITA');
}

/* ---------- RECEIPT: one permanent renderer, cloud source only ---------- */
let receiptBacking=Array.isArray(window.__FUEL_RECEIPTS)?window.__FUEL_RECEIPTS:[];
let stockBacking=window.__FUEL_STOCK_DATA||{snapshots:{},availableDates:[]};
function receiptRows(){
  const from=document.getElementById('dateFrom')?.value||'',to=document.getElementById('dateTo')?.value||'',truck=document.getElementById('truckFilter')?.value||'';
  return (receiptBacking||[]).map(r=>({date:r.Date||r.date||'',supplier:r.Supplier||r.supplier||'',sj:r.No_Surat_Jalan||r.No_DO||r.DO||r['No SJ/DO']||'',qty:Number(r.Qty??r.qty)||0,transporter:r.Transporter||r.transportir||'',fuelTruck:r.Fuel_Truck||r.fuelTruck||'',po:r.Ref_PO||r.Reference||r.PO||r['Ref PO']||''})).filter(r=>r.date&&r.qty>0&&(!from||r.date>=from)&&(!to||r.date<=to)&&(!truck||r.fuelTruck===truck)).sort((a,b)=>a.date.localeCompare(b.date));
}
function renderReceiptFinal(){
  const rows=receiptRows(),total=rows.reduce((a,r)=>a+r.qty,0),days=new Set(rows.map(r=>r.date)).size,last=rows.at(-1),set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
  set('receiptTotal',fmt(total));set('receiptDays',fmt(days));set('receiptAvg',fmt(days?total/days:0));set('receiptLast',last?dateID(last.date):'-');set('receiptLastQty',last?`${fmt(last.qty)} L`:'0 L');
  const daily={};rows.forEach(r=>daily[r.date]=(daily[r.date]||0)+r.qty);const labs=Object.keys(daily).sort();
  const canvas=document.getElementById('receiptChart');
  if(canvas&&window.Chart&&typeof state!=='undefined'){
    try{state.charts.receiptPage?.destroy();}catch(_){}
    state.charts.receiptPage=new Chart(canvas,{type:'bar',data:{labels:labs.map(d=>d.slice(8,10)+'/'+d.slice(5,7)),datasets:[{data:labs.map(d=>daily[d]),backgroundColor:'#18ad5b',borderRadius:3,maxBarThickness:34}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{anchor:'end',align:'top',color:'#fff',font:{size:9,weight:'bold'},formatter:v=>fmt(v)}},scales:{x:{ticks:{color:'#a6bad0'},grid:{display:false}},y:{beginAtZero:true,ticks:{color:'#a6bad0',callback:v=>fmt(v)},grid:{color:'#29425a80'}}}}});
  }
  const list=document.getElementById('receiptList');
  if(list)list.innerHTML=[...rows].reverse().slice(0,10).map(r=>`<div class="page-list-row v78-receipt"><div><b>${dateLong(r.date)}</b><small>${r.supplier||'-'}${r.sj?' • SJ/DO: '+r.sj:''}${r.transporter?' • '+r.transporter:''}</small><small>Ref PO: ${r.po||'-'}</small></div><strong>${fmt(r.qty)} L</strong></div>`).join('')||'<div class="page-list-row"><div><b>No receipt data</b></div></div>';
}
try{renderReceiptPage=renderReceiptFinal;}catch(_){}
try{
  Object.defineProperty(window,'__FUEL_RECEIPTS',{configurable:true,get:()=>receiptBacking,set:v=>{receiptBacking=Array.isArray(v)?v:[];queueMicrotask(()=>{if(document.getElementById('fuel-receipt')?.classList.contains('active-section'))renderReceiptFinal();});}});
  Object.defineProperty(window,'__FUEL_STOCK_DATA',{configurable:true,get:()=>stockBacking,set:v=>{stockBacking=v||{snapshots:{},availableDates:[]};try{stockData.snapshots={...(stockBacking.snapshots||{})};stockData.availableDates=[...(stockBacking.availableDates||[])].sort();}catch(_){}queueMicrotask(renderStockFinal);}});
}catch(e){console.warn('V78 cloud setters',e)}

/* ---------- CHART LEGENDS: white at final render ---------- */
function fixLegends(){
  try{if(window.Chart){Chart.defaults.color='#fff';if(Chart.defaults.plugins?.legend?.labels)Chart.defaults.plugins.legend.labels.color='#fff'}if(typeof state==='undefined')return;['truck','status'].forEach(name=>{const c=state.charts?.[name];if(!c)return;const lg=((c.options.plugins||(c.options.plugins={})).legend||(c.options.plugins.legend={})),labels=(lg.labels||(lg.labels={}));labels.color='#fff';labels.font={...(labels.font||{}),weight:'900',size:name==='truck'?9:8};const old=labels.generateLabels;if(old&&!old.__v78){const w=chart=>old(chart).map(x=>({...x,fontColor:'#fff',color:'#fff'}));w.__v78=true;labels.generateLabels=w}c.update('none')})}catch(e){console.warn('V78 legends',e)}
}

/* ---------- FINAL UI ---------- */
function enforceFinal(){
  const h=document.querySelector('.hero h1');if(h)h.textContent='FUEL MANAGEMENT SYSTEM V78 STABLE';
  document.title='Fuel Management System V78 Stable | PT Prima Sarana Gemilang';
  renderBrand();renderStockFinal();fixLegends();
  if(document.getElementById('fuel-receipt')?.classList.contains('active-section'))renderReceiptFinal();
}
const style=document.createElement('style');style.id='v78-stable-style';style.textContent=`
.logo-box{background:#071c2d!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}.v78-brand{width:100%;height:100%;min-height:76px;display:flex;align-items:center;gap:8px;padding:8px 9px;box-sizing:border-box;background:linear-gradient(135deg,#081c2d,#0d2b43)}.v78-brand svg{width:38px;height:38px;flex:0 0 38px}.v78-brand div{min-width:0;display:flex;flex-direction:column}.v78-brand strong{color:#fff;font-size:12px;line-height:1.05;letter-spacing:.3px;white-space:nowrap}.v78-brand span{color:#ff9b25;font-size:8px;font-weight:900;margin-top:3px;letter-spacing:.35px}.v78-brand small{color:#93abc1;font-size:7px;font-weight:700;margin-top:2px;white-space:nowrap}
.stock-panel{position:relative!important;padding-bottom:92px!important}.stock-panel .stock-total{position:absolute!important;top:auto!important;left:76%!important;right:auto!important;bottom:10px!important;transform:translateX(-50%)!important;width:108px!important;text-align:center!important;z-index:5!important;margin:0!important}.stock-panel .stock-total>small{display:block!important;color:#fff!important;font-weight:900!important;margin-bottom:4px!important}.stock-panel .stock-orb{width:76px!important;height:76px!important;margin:0 auto!important}.stock-panel .stock-meta{position:relative!important;z-index:6!important}.stock-panel #stockTime{min-width:72px!important}.v78-receipt small{display:block!important;color:#96abc0!important;font-size:10px!important;line-height:1.35!important;margin-top:3px!important}.v78-receipt b,.v78-receipt>strong{color:#fff!important;font-weight:900!important}
@media(max-width:768px){.v78-brand{min-height:64px;padding:7px}.v78-brand svg{width:32px;height:32px;flex-basis:32px}.v78-brand strong{font-size:10px}.v78-brand span{font-size:7px}.v78-brand small{font-size:6px}.stock-panel{padding-bottom:88px!important}.stock-panel .stock-total{left:74%!important}}
`;document.head.appendChild(style);

try{if(typeof renderAll==='function'&&!renderAll.__v78){const old=renderAll;const f=function(...a){const r=old.apply(this,a);queueMicrotask(enforceFinal);return r};f.__v78=true;renderAll=f}}catch(_){}
try{if(typeof applyFilters==='function'&&!applyFilters.__v78){const old=applyFilters;const f=function(...a){const r=old.apply(this,a);queueMicrotask(enforceFinal);return r};f.__v78=true;applyFilters=f}}catch(_){}
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>requestAnimationFrame(()=>{enforceFinal();if(a.dataset.section==='fuel-receipt')renderReceiptFinal();})));
['dateFrom','dateTo','truckFilter','shiftFilter','categoryFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>requestAnimationFrame(enforceFinal)));
window.addEventListener('pageshow',enforceFinal);
enforceFinal();
})();
