(()=>{
'use strict';
const VER='77.5';
const UKEY='fuelptpsg_usage_v756',RKEY='fuelptpsg_receipts_v754',SKEY='fuelptpsg_stock_v754';
const clone=x=>JSON.parse(JSON.stringify(x));
const byId=id=>document.getElementById(id);
const isoPlus1=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')))return s;const d=new Date(s+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)};
const isBrokenTime=v=>/^18\d{2}-\d{2}-\d{2}/.test(String(v||''))||/^1899-/.test(String(v||''));
const fmtDate=s=>{if(!s)return'-';const d=new Date(s+'T00:00:00');return Number.isNaN(d.getTime())?s:new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(d)};
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
function cloudSerializationDetected(){try{const rows=(typeof state!=='undefined'&&Array.isArray(state.raw))?state.raw:[];return rows.some(r=>isBrokenTime(r.Time))}catch(_){return false}}
function repairCloudDatesAndTimes(){
  try{
    if(typeof state==='undefined'||!Array.isArray(state.raw)||!state.raw.length)return false;
    const broken=cloudSerializationDetected();
    if(!broken)return false;
    state.raw=state.raw.map(r=>({...r,Date:isoPlus1(r.Date),Time:isBrokenTime(r.Time)?'':r.Time}));
    state.filtered=[];state.page=1;
    try{localStorage.setItem(UKEY,JSON.stringify(state.raw))}catch(_){ }
    if(Array.isArray(window.__FUEL_RECEIPTS)){
      window.__FUEL_RECEIPTS=window.__FUEL_RECEIPTS.map(r=>({...r,Date:isoPlus1(r.Date)}));
      try{localStorage.setItem(RKEY,JSON.stringify(window.__FUEL_RECEIPTS))}catch(_){ }
    }
    const st=window.__FUEL_STOCK_DATA;
    if(st?.snapshots){
      const fixed={};Object.entries(st.snapshots).forEach(([d,s])=>{fixed[isoPlus1(d)]={...s,time:isBrokenTime(s?.time)?'06:00':(s?.time||'06:00')}});
      st.snapshots=fixed;st.availableDates=Object.keys(fixed).sort();
      try{if(typeof stockData!=='undefined'){stockData.snapshots=clone(fixed);stockData.availableDates=[...st.availableDates]}}catch(_){ }
      try{localStorage.setItem(SKEY,JSON.stringify(st))}catch(_){ }
    }
    return true;
  }catch(e){console.warn('V77.5 serialization repair',e);return false}
}
function forceExactPeriod(){
  try{if(typeof state==='undefined'||!Array.isArray(state.raw)||!state.raw.length)return;const dates=state.raw.map(r=>r.Date).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort();if(!dates.length)return;const a=dates[0],b=dates.at(-1);if(byId('dateFrom'))byId('dateFrom').value=a;if(byId('dateTo'))byId('dateTo').value=b;if(typeof applyFilters==='function')applyFilters();if(byId('periodSide'))byId('periodSide').textContent=`${a.split('-').reverse().join('/')} - ${b.split('-').reverse().join('/')}`;}catch(e){console.warn('period fix',e)}
}
function forceChartReadability(){
  try{
    if(window.Chart){Chart.defaults.color='#fff';if(Chart.defaults.plugins?.legend?.labels)Chart.defaults.plugins.legend.labels.color='#fff'}
    const charts=(typeof state!=='undefined'&&state.charts)||{};
    ['truck','status'].forEach(name=>{const c=charts[name];if(!c)return;const lg=((c.options.plugins||(c.options.plugins={})).legend||(c.options.plugins.legend={}));lg.labels={...(lg.labels||{}),color:'#fff',font:{...((lg.labels||{}).font||{}),weight:'900',size:name==='truck'?10:9}};const ds=c.data?.datasets?.[0];if(ds){if(name==='truck'){const pal=['#ff8b1f','#328af4','#21bc67','#ffc43b','#8b5cf6','#00b8d9','#ef4d3e','#94a3b8'];ds.backgroundColor=(ds.data||[]).map((_,i)=>pal[i%pal.length])}else{const map={'OVER CONSUMPTION':'#ef4d3e','WARNING':'#ff8b1f','NORMAL':'#328af4','EFFICIENT':'#20a94e','NO STANDARD':'#8493a5','NO DATA':'#53687d'};ds.backgroundColor=(c.data.labels||[]).map((x,i)=>map[String(x||'').toUpperCase()]||['#ef4d3e','#ff8b1f','#328af4','#20a94e'][i%4])}}c.update('none')});
  }catch(e){console.warn('chart readability',e)}
}
function renderReceiptClassic(){
  const list=byId('receiptList');if(!list)return;const data=Array.isArray(window.__FUEL_RECEIPTS)?window.__FUEL_RECEIPTS:[];const from=byId('dateFrom')?.value||'',to=byId('dateTo')?.value||'';
  const rows=data.filter(r=>(!from||r.Date>=from)&&(!to||r.Date<=to)).sort((a,b)=>String(b.Date).localeCompare(String(a.Date))).slice(0,12);
  list.innerHTML=rows.map(r=>`<div class="page-list-row v775-receipt"><div><b>${fmtDate(r.Date)}</b><small>${r.Supplier||'-'} • SJ/DO: ${r.No_Surat_Jalan||r.No_DO||r.DO||'-'}${r.Transporter?' • '+r.Transporter:''}</small><small>Ref PO: ${r.Ref_PO||r.Reference||r.PO||'-'}</small></div><strong>${fmt(r.Qty)} L</strong></div>`).join('')||'<div class="page-list-row"><div><b>No receipt data</b></div></div>';
}
function fixLogo(){
  const box=document.querySelector('.logo-box');if(!box)return;const url=new URL('prima-logo.png',location.href).href+'?v='+VER;
  box.style.setProperty('background',`#fff url("${url}") center/88% auto no-repeat`,'important');
  box.style.setProperty('min-height','76px','important');box.style.setProperty('height','76px','important');
  let img=box.querySelector('img.v775-logo');if(!img){img=document.createElement('img');img.className='v775-logo';img.alt='PRIMA';img.src=url;img.style.cssText='display:block;width:88%;height:66px;object-fit:contain;opacity:.001;pointer-events:none';box.appendChild(img)}
}
function updateHeaderMeta(){
  try{const dates=(typeof state!=='undefined'&&Array.isArray(state.raw)?state.raw:[]).map(r=>r.Date).filter(Boolean).sort();if(!dates.length)return;const max=dates.at(-1);const txt=new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(max+'T00:00:00'))+' DATA';if(byId('topLastUpdate'))byId('topLastUpdate').textContent=txt;if(byId('updateSide'))byId('updateSide').textContent=txt;}catch(_){ }
}
function refreshAll(){const changed=repairCloudDatesAndTimes();forceExactPeriod();forceChartReadability();renderReceiptClassic();fixLogo();updateHeaderMeta();if(changed){setTimeout(()=>{try{if(typeof renderAll==='function')renderAll();if(typeof renderStock==='function')renderStock();if(typeof renderFuelStockPage==='function')renderFuelStockPage()}catch(_){ }forceExactPeriod();forceChartReadability();renderReceiptClassic()},80)}}
let lastSig='';function sig(){try{const rows=(typeof state!=='undefined'&&Array.isArray(state.raw))?state.raw:[];const st=window.__FUEL_STOCK_DATA?.availableDates||[];return `${rows.length}|${rows[0]?.Date||''}|${rows.at(-1)?.Date||''}|${st.at(-1)||''}|${document.querySelector('#v77CloudStatus')?.textContent||''}`}catch(_){return ''}}
function watch(){const s=sig();if(s&&s!==lastSig){lastSig=s;refreshAll()}setTimeout(watch,350)}
const style=document.createElement('style');style.textContent=`#truckChart,#statusChart{color:#fff!important}.v775-receipt small{display:block;color:#8fa7bf;font-size:10px;margin-top:3px}.v775-receipt strong{color:#fff!important;white-space:nowrap}.logo-box .prima-text-logo,.logo-box img.v741-logo{display:none!important}`;document.head.appendChild(style);
[50,180,500,1000].forEach(t=>setTimeout(refreshAll,t));watch();
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>byId(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>setTimeout(()=>{forceChartReadability();renderReceiptClassic()},100)));
window.addEventListener('pageshow',()=>setTimeout(refreshAll,80));window.addEventListener('focus',()=>setTimeout(refreshAll,80));
})();
