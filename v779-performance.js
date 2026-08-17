(()=>{
'use strict';
const VER='77.11', WHITE='#fff';
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
const dateLong=s=>{if(!s)return'-';const d=new Date(String(s)+'T00:00:00');return Number.isNaN(d.getTime())?String(s):new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(d)};

function renderLogo(){
  const box=document.querySelector('.logo-box'); if(!box)return;
  if(box.querySelector('.v779-prima-logo'))return;
  box.innerHTML=`<svg class="v779-prima-logo" viewBox="0 0 360 110" role="img" aria-label="PRIMA - PT Prima Sarana Gemilang" xmlns="http://www.w3.org/2000/svg"><rect width="360" height="110" rx="8" fill="#fff"/><g transform="translate(28 27) skewX(-12)"><text x="0" y="48" font-family="Arial,Helvetica,sans-serif" font-size="58" font-weight="900" letter-spacing="-4" fill="#135b9c">PRIMA</text><path d="M4 61 H290" stroke="#135b9c" stroke-width="4" stroke-linecap="round"/><circle cx="207" cy="16" r="8" fill="#e43c32"/><circle cx="224" cy="24" r="7" fill="#f39a22"/></g></svg>`;
}
function receiptRows(){const src=Array.isArray(window.__FUEL_RECEIPTS)?window.__FUEL_RECEIPTS:[];return src.map(r=>({date:r.Date||r.date||'',supplier:r.Supplier||r.supplier||'',sj:r.No_Surat_Jalan||r.No_DO||r.DO||r.no_sj||'',qty:Number(r.Qty??r.qty)||0,transporter:r.Transporter||r.transportir||'',po:r.Ref_PO||r.Reference||r.PO||r.ref_po||''}))}
function renderReceiptFinal(){const list=document.getElementById('receiptList');if(!list)return;const from=document.getElementById('dateFrom')?.value||'',to=document.getElementById('dateTo')?.value||'';const rows=receiptRows().filter(r=>(!from||r.date>=from)&&(!to||r.date<=to)).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,10);list.innerHTML=rows.map(r=>`<div class="page-list-row v779-receipt"><div><b>${dateLong(r.date)}</b><small>${r.supplier||'-'}${r.sj?' • SJ/DO: '+r.sj:''}${r.transporter?' • '+r.transporter:''}</small><small>Ref PO: ${r.po||'-'}</small></div><strong>${fmt(r.qty)} L</strong></div>`).join('')||'<div class="page-list-row"><div><b>No receipt data</b></div></div>'}
function patchLegend(c,type){if(!c)return;const p=c.options.plugins||(c.options.plugins={}),lg=p.legend||(p.legend={});lg.labels={...(lg.labels||{}),color:WHITE,font:{...((lg.labels||{}).font||{}),weight:'900',size:type==='truck'?9:8}};const old=lg.labels.generateLabels;if(old&&!lg.labels.__v7711){lg.labels.generateLabels=chart=>old(chart).map(x=>({...x,fontColor:WHITE,color:WHITE}));lg.labels.__v7711=true}c.update('none')}
function fixLegends(){try{if(window.Chart){Chart.defaults.color=WHITE;if(Chart.defaults.plugins?.legend?.labels)Chart.defaults.plugins.legend.labels.color=WHITE}if(typeof state!=='undefined'&&state.charts){patchLegend(state.charts.truck,'truck');patchLegend(state.charts.status,'status')}}catch(e){console.warn('v7711 legend',e)}}
function enforceUi(){
  const h=document.querySelector('.hero h1'); if(h)h.textContent='FUEL MANAGEMENT SYSTEM V77.11';
  document.title='Fuel Management System V77.11 | PT Prima Sarana Gemilang';
  renderLogo(); fixLegends();
  if(document.getElementById('fuel-receipt')?.classList.contains('active-section'))renderReceiptFinal();
}
window.__V77_ENFORCE_UI=enforceUi;

/* Cloud data finishes after this file loads. Wrap final render entry points so legacy UI cannot overwrite V77.11. */
try{if(typeof applyFilters==='function'&&!applyFilters.__v7711){const old=applyFilters;const fn=function(...a){const r=old.apply(this,a);queueMicrotask(enforceUi);return r};fn.__v7711=true;applyFilters=fn}}catch(_){ }
try{if(typeof renderAll==='function'&&!renderAll.__v7711){const old=renderAll;const fn=function(...a){const r=old.apply(this,a);queueMicrotask(enforceUi);return r};fn.__v7711=true;renderAll=fn}}catch(_){ }
try{if(typeof renderReceiptPage==='function'&&!renderReceiptPage.__v7711){const old=renderReceiptPage;const fn=function(...a){const r=old.apply(this,a);renderReceiptFinal();return r};fn.__v7711=true;renderReceiptPage=fn}}catch(_){ }

let style=document.getElementById('v7711-performance-style');if(!style){style=document.createElement('style');style.id='v7711-performance-style';document.head.appendChild(style)}
style.textContent=`.logo-box{background:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}.v779-prima-logo{display:block!important;width:94%!important;height:auto!important;max-height:72px!important;visibility:visible!important;opacity:1!important}#receiptList .v779-receipt{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important}#receiptList .v779-receipt>div{min-width:0!important;flex:1!important}#receiptList .v779-receipt b{display:block!important;color:#fff!important;font-weight:900!important}#receiptList .v779-receipt small{display:block!important;color:#96abc0!important;font-size:10px!important;margin-top:3px!important;line-height:1.35!important;white-space:normal!important}#receiptList .v779-receipt>strong{color:#fff!important;white-space:nowrap!important;font-weight:900!important}@media(max-width:768px){.v779-prima-logo{max-height:52px!important}}`;

enforceUi();
/* Short bounded re-checks only; no polling/MutationObserver. Covers first cloud response. */
[250,1200,3500,6500].forEach(t=>setTimeout(enforceUi,t));
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>requestAnimationFrame(enforceUi)));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>requestAnimationFrame(enforceUi)));
window.addEventListener('pageshow',enforceUi);
})();
