(()=>{
'use strict';
const VER='77.13';
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
const dateID=s=>{if(!s)return'-';const d=new Date(String(s)+'T00:00:00');return Number.isNaN(d.getTime())?String(s):new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)};
const dateLong=s=>{if(!s)return'-';const d=new Date(String(s)+'T00:00:00');return Number.isNaN(d.getTime())?String(s):new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(d)};

/* Keep v741 password flow from re-catching its own programmatic file-input click. */
window.addEventListener('click',e=>{if(e.target?.id==='excelUpload')e.stopPropagation();},true);

function renderLogo(){
  const box=document.querySelector('.logo-box');if(!box)return;
  if(box.dataset.v7713==='1')return;
  box.dataset.v7713='1';
  box.innerHTML=`<svg class="v7713-prima" viewBox="0 0 360 110" role="img" aria-label="PRIMA" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="110" rx="8" fill="#fff"/><g transform="translate(25 25) skewX(-11)"><text x="0" y="49" font-family="Arial,Helvetica,sans-serif" font-size="60" font-weight="900" letter-spacing="-4" fill="#135b9c">PRIMA</text><path d="M4 62 H292" stroke="#135b9c" stroke-width="4" stroke-linecap="round"/><circle cx="208" cy="16" r="8" fill="#e43c32"/><circle cx="225" cy="24" r="7" fill="#f39a22"/></g></svg>`;
}
function renderUnitIcons(){
  const nodes=document.querySelectorAll('.unit-type-panel .unit-icon');
  if(nodes[0])nodes[0].innerHTML='<img src="excavator-icon.svg?v=77.13" alt="Excavator" loading="eager">';
  if(nodes[1])nodes[1].innerHTML='<img src="gears-icon.svg?v=77.13" alt="General Support" loading="eager">';
}

/* Make chart legend color correct at creation time, not with delayed repair loops. */
try{
  if(typeof chart==='function'&&!chart.__v7713){
    const oldChart=chart;
    const wrapped=function(name,id,cfg){
      if(name==='truck'||name==='status'){
        const p=cfg.options||(cfg.options={});p.plugins=p.plugins||{};p.plugins.legend=p.plugins.legend||{};
        const lg=p.plugins.legend,labels=lg.labels||(lg.labels={});
        labels.color='#fff';labels.font={...(labels.font||{}),weight:'900',size:name==='truck'?9:8};
        const original=labels.generateLabels;
        if(original){labels.generateLabels=c=>original(c).map(x=>({...x,fontColor:'#fff',color:'#fff'}));}
      }
      return oldChart(name,id,cfg);
    };
    wrapped.__v7713=true;chart=wrapped;
  }
}catch(e){console.warn('V77.13 chart patch',e)}

/* Fuel Stock is independent from Fuel Usage dateTo: always use newest Stock snapshot. */
try{
  resolveStockSnapshot=function(){
    const dates=[...(stockData?.availableDates||[])].filter(Boolean).sort();
    const selected=dates.at(-1)||'';
    const s=selected?(stockData?.snapshots||{})[selected]:null;
    stock=s?{...s,snapshotDate:selected,snapshotTime:s.time||'06:00'}:{fuelStorage:{},fuelTruck:{},total:0,snapshotDate:'',snapshotTime:''};
  };
}catch(e){console.warn('V77.13 stock resolver',e)}

let receiptBacking=Array.isArray(window.__FUEL_RECEIPTS)?window.__FUEL_RECEIPTS:[];
let stockBacking=window.__FUEL_STOCK_DATA||{snapshots:{},availableDates:[]};
try{
  Object.defineProperty(window,'__FUEL_RECEIPTS',{configurable:true,get:()=>receiptBacking,set:v=>{receiptBacking=Array.isArray(v)?v:[];queueMicrotask(()=>{if(document.getElementById('fuel-receipt')?.classList.contains('active-section'))renderReceiptStable();});}});
  Object.defineProperty(window,'__FUEL_STOCK_DATA',{configurable:true,get:()=>stockBacking,set:v=>{stockBacking=v||{snapshots:{},availableDates:[]};try{stockData.snapshots={...(stockBacking.snapshots||{})};stockData.availableDates=[...(stockBacking.availableDates||[])].sort();}catch(_){}queueMicrotask(()=>{try{renderStock();}catch(_){}if(document.getElementById('fuel-stock-page')?.classList.contains('active-section')){try{renderStockPage();}catch(_){}}});}});
}catch(e){console.warn('V77.13 cloud setters',e)}

function receiptRows(){
  const from=document.getElementById('dateFrom')?.value||'',to=document.getElementById('dateTo')?.value||'',truck=document.getElementById('truckFilter')?.value||'';
  return (receiptBacking||[]).map(r=>({date:r.Date||r.date||'',supplier:r.Supplier||r.supplier||'',sj:r.No_Surat_Jalan||r.No_DO||r.DO||'',qty:Number(r.Qty??r.qty)||0,transporter:r.Transporter||r.transportir||'',fuelTruck:r.Fuel_Truck||r.fuelTruck||'',po:r.Ref_PO||r.Reference||r.PO||''})).filter(r=>r.date&&r.qty>0&&(!from||r.date>=from)&&(!to||r.date<=to)&&(!truck||r.fuelTruck===truck)).sort((a,b)=>a.date.localeCompare(b.date));
}
function renderReceiptStable(){
  const rows=receiptRows(),total=rows.reduce((a,r)=>a+r.qty,0),days=new Set(rows.map(r=>r.date)).size,last=rows.at(-1);
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
  set('receiptTotal',fmt(total));set('receiptDays',fmt(days));set('receiptAvg',fmt(days?total/days:0));set('receiptLast',last?dateID(last.date):'-');set('receiptLastQty',last?fmt(last.qty)+' L':'0 L');
  const daily={};rows.forEach(r=>daily[r.date]=(daily[r.date]||0)+r.qty);const labs=Object.keys(daily).sort();
  const canvas=document.getElementById('receiptChart');
  if(canvas&&window.Chart&&typeof state!=='undefined'){
    try{if(state.charts.receiptPage)state.charts.receiptPage.destroy();}catch(_){}
    state.charts.receiptPage=new Chart(canvas,{type:'bar',data:{labels:labs.map(d=>d.slice(8,10)+'/'+d.slice(5,7)),datasets:[{data:labs.map(d=>daily[d]),backgroundColor:'#18ad5b',borderRadius:3,maxBarThickness:34}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{anchor:'end',align:'top',color:'#fff',font:{size:9,weight:'bold'},formatter:v=>fmt(v)}},scales:{x:{ticks:{color:'#a6bad0'},grid:{display:false}},y:{beginAtZero:true,ticks:{color:'#a6bad0',callback:v=>fmt(v)},grid:{color:'#29425a80'}}}}});
  }
  const list=document.getElementById('receiptList');
  if(list)list.innerHTML=[...rows].reverse().slice(0,10).map(r=>`<div class="page-list-row v7713-receipt"><div><b>${dateLong(r.date)}</b><small>${r.supplier||'-'}${r.sj?' • SJ/DO: '+r.sj:''}${r.transporter?' • '+r.transporter:''}</small><small>Ref PO: ${r.po||'-'}</small></div><strong>${fmt(r.qty)} L</strong></div>`).join('')||'<div class="page-list-row"><div><b>No receipt data</b></div></div>';
}
try{renderReceiptPage=renderReceiptStable;}catch(_){}

const style=document.createElement('style');style.id='v7713-style';style.textContent=`
.logo-box{background:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}.v7713-prima{display:block!important;width:94%!important;max-height:72px!important;height:auto!important}.unit-type-panel .unit-icon img{max-width:100%!important;max-height:54px!important;object-fit:contain!important;display:block!important;margin:auto!important}.v7713-receipt small{display:block!important;color:#96abc0!important;font-size:10px!important;line-height:1.35!important;margin-top:3px!important}.v7713-receipt b,.v7713-receipt>strong{color:#fff!important;font-weight:900!important}@media(max-width:768px){.v7713-prima{max-height:54px!important}}
`;document.head.appendChild(style);

function enforce(){
  const h=document.querySelector('.hero h1');if(h)h.textContent='FUEL MANAGEMENT SYSTEM V77.13';document.title='Fuel Management System V77.13 | PT Prima Sarana Gemilang';
  renderLogo();renderUnitIcons();
  try{renderStock();}catch(_){}
  if(document.getElementById('fuel-receipt')?.classList.contains('active-section'))renderReceiptStable();
}
try{if(typeof renderAll==='function'&&!renderAll.__v7713){const old=renderAll;const f=function(...a){const r=old.apply(this,a);queueMicrotask(enforce);return r};f.__v7713=true;renderAll=f}}catch(_){}
try{if(typeof applyFilters==='function'&&!applyFilters.__v7713){const old=applyFilters;const f=function(...a){const r=old.apply(this,a);queueMicrotask(enforce);return r};f.__v7713=true;applyFilters=f}}catch(_){}
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>requestAnimationFrame(()=>{enforce();if(a.dataset.section==='fuel-receipt')renderReceiptStable();})));
['dateFrom','dateTo','truckFilter'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>requestAnimationFrame(()=>{if(document.getElementById('fuel-receipt')?.classList.contains('active-section'))renderReceiptStable();})));
enforce();
})();
