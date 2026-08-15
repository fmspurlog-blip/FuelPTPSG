(()=>{
'use strict';
const VER='75.4';
const RKEY='fuelptpsg_receipts_v754', SKEY='fuelptpsg_stock_v754';
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
let lastReceiptSig='',lastStockSig='';

function safeGet(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}}
function safeSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){console.warn('localStorage',e)}}

function applyLogo(){
  const base=location.pathname.endsWith('/')?location.pathname:location.pathname.replace(/[^/]*$/,'');
  const url=`${location.origin}${base}prima-logo.png?v=${VER}`;
  let s=document.getElementById('v754-logo-style');if(!s){s=document.createElement('style');s.id='v754-logo-style';document.head.appendChild(s)}
  s.textContent=`.logo-box{background:#fff url("${url}") center/94% auto no-repeat!important;min-height:76px!important;height:76px!important;overflow:hidden!important}.logo-box img,.logo-box .prima-text-logo,.logo-box .v743-logo-fallback{opacity:0!important;visibility:hidden!important}`;
}

function receiptSig(data){return (data||[]).map(r=>`${r.Date}|${r.Qty}|${r.Fuel_Truck}|${r.No_Surat_Jalan}`).join(';')}
function stockSig(data){return JSON.stringify(data?.availableDates||[])+'|'+JSON.stringify(data?.snapshots||{})}

function filteredReceipts(){
 const d=window.__FUEL_RECEIPTS||[];
 const from=document.getElementById('dateFrom')?.value||'',to=document.getElementById('dateTo')?.value||'',truck=document.getElementById('truckFilter')?.value||'';
 return d.filter(r=>(!from||r.Date>=from)&&(!to||r.Date<=to)&&(!truck||r.Fuel_Truck===truck));
}
function renderReceipt(){
 const data=[...filteredReceipts()].sort((a,b)=>a.Date.localeCompare(b.Date));
 const total=data.reduce((a,r)=>a+(Number(r.Qty)||0),0),days=new Set(data.map(r=>r.Date)).size,last=data.at(-1);
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
 set('receiptTotal',fmt(total));set('receiptDays',fmt(days));set('receiptAvg',fmt(days?total/days:0));
 set('receiptLast',last?new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(last.Date+'T00:00:00')):'-');
 set('receiptLastQty',last?`${fmt(last.Qty)} L`:'0 L');
 const list=document.getElementById('receiptList');
 if(list)list.innerHTML=[...data].reverse().slice(0,8).map(r=>`<div class="page-list-row"><div><b>${new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(r.Date+'T00:00:00'))}</b><small>${r.Supplier||'-'} · SJ ${r.No_Surat_Jalan||'-'} · ${r.Fuel_Truck||'-'}</small></div><strong>${fmt(r.Qty)} L</strong></div>`).join('')||'<div class="page-list-row"><div><b>No receipt data</b></div></div>';
 const canvas=document.getElementById('receiptChart');
 if(canvas&&window.Chart&&typeof state!=='undefined'){
  const daily={};data.forEach(r=>daily[r.Date]=(daily[r.Date]||0)+(Number(r.Qty)||0));const labs=Object.keys(daily).sort();
  if(state.charts.receipt)state.charts.receipt.destroy();
  state.charts.receipt=new Chart(canvas,{type:'bar',data:{labels:labs.map(d=>d.slice(8,10)+'/'+d.slice(5,7)),datasets:[{data:labs.map(d=>daily[d]),backgroundColor:'#25bd68',borderRadius:3,maxBarThickness:34}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{anchor:'end',align:'top',color:'#fff',font:{size:9,weight:'bold'},formatter:v=>fmt(v)}},scales:{x:{ticks:{color:'#a6bad0'},grid:{display:false}},y:{beginAtZero:true,ticks:{color:'#a6bad0',callback:v=>fmt(v)},grid:{color:'#29425a80'}}}}});
 }
}
function applyStock(parsed){
 if(!parsed)return;
 try{if(typeof stockData!=='undefined'){stockData.snapshots=parsed.snapshots||{};stockData.availableDates=parsed.availableDates||[]}}catch(_){ }
 window.__FUEL_STOCK_DATA=parsed;
 try{if(typeof renderStock==='function')renderStock();if(typeof renderFuelStockPage==='function')renderFuelStockPage()}catch(e){console.warn('stock render',e)}
}

function restore(){
 const r=safeGet(RKEY),s=safeGet(SKEY);
 if(Array.isArray(r)&&r.length){window.__FUEL_RECEIPTS=r;lastReceiptSig=receiptSig(r)}
 if(s&&s.snapshots){applyStock(s);lastStockSig=stockSig(s)}
 applyLogo();
 setTimeout(renderReceipt,80);setTimeout(renderReceipt,300);setTimeout(()=>applyStock(window.__FUEL_STOCK_DATA),200);
}
function persistCurrent(){
 const r=window.__FUEL_RECEIPTS||[];const rs=receiptSig(r);
 if(r.length&&rs&&rs!==lastReceiptSig){lastReceiptSig=rs;safeSet(RKEY,r);setTimeout(renderReceipt,30);setTimeout(renderReceipt,180)}
 const s=window.__FUEL_STOCK_DATA;const ss=s?stockSig(s):'';
 if(s&&s.availableDates?.length&&ss!==lastStockSig){lastStockSig=ss;safeSet(SKEY,s);applyStock(s)}
}
function refresh(){applyLogo();renderReceipt();applyStock(window.__FUEL_STOCK_DATA)}
restore();
setInterval(persistCurrent,350);
['dateFrom','dateTo','truckFilter'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>{setTimeout(refresh,80);setTimeout(refresh,240)}));
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>{setTimeout(refresh,100);setTimeout(refresh,320);setTimeout(refresh,700)}));
window.addEventListener('hashchange',()=>{setTimeout(refresh,80);setTimeout(refresh,300)});
window.addEventListener('pageshow',()=>{restore();setTimeout(refresh,180)});
window.addEventListener('resize',()=>setTimeout(applyLogo,80),{passive:true});
new MutationObserver(()=>applyLogo()).observe(document.querySelector('.sidebar')||document.body,{childList:true,subtree:true});
})();