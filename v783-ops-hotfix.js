(()=>{
'use strict';
const $=s=>document.querySelector(s);
const byId=id=>document.getElementById(id);
const num=v=>Number(v)||0;
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(num(v));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const dateID=s=>{if(!s)return'-';try{return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(s+'T00:00:00'))}catch(_){return s}};
const dayID=s=>{if(!s)return'-';try{return new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(new Date(s+'T00:00:00'))}catch(_){return'-'}};

function addStyle(){
 let st=byId('v783-ops-hotfix-style');
 if(!st){st=document.createElement('style');st.id='v783-ops-hotfix-style';document.head.appendChild(st)}
 st.textContent=`
 .shift-panel{overflow:hidden!important}
 .shift-panel .title h3{font-size:15px!important;line-height:1.15!important}
 .shift-panel .shift-content{display:grid!important;grid-template-columns:minmax(245px,1fr) 132px!important;align-items:start!important;gap:4px!important;min-height:245px!important}
 .shift-panel .chart.donut{width:265px!important;max-width:265px!important;height:265px!important;min-height:265px!important;margin:-8px 0 0 12px!important;justify-self:start!important;overflow:visible!important}
 .shift-panel .chart.donut canvas{display:block!important;width:265px!important;height:265px!important;max-width:265px!important;max-height:265px!important}
 .shift-panel .shift-legend{margin-top:58px!important;align-self:start!important;display:grid!important;gap:7px!important;min-width:0!important}
 .shift-panel .shift-item{grid-template-columns:10px minmax(0,1fr)!important;gap:7px!important}
 .shift-panel .shift-item small{font-size:10px!important;color:#fff!important;line-height:1.08!important;white-space:normal!important}
 .shift-panel .shift-item strong{font-size:17px!important;color:#fff!important;line-height:1!important;margin:3px 0!important;white-space:nowrap!important}
 .shift-panel .shift-item strong span{font-size:9px!important;color:#fff!important}
 .shift-panel .shift-item>div>span{font-size:9px!important;color:#89c9ff!important}

 .v783-white-legend{position:absolute!important;right:12px!important;top:52px!important;width:150px!important;display:flex!important;flex-direction:column!important;gap:8px!important;z-index:20!important;pointer-events:none!important}
 .v783-white-legend .leg{display:grid!important;grid-template-columns:10px minmax(0,1fr)!important;gap:7px!important;align-items:start!important;color:#fff!important;font-size:10px!important;font-weight:800!important;line-height:1.18!important;text-shadow:0 1px 2px #000!important}
 .v783-white-legend .leg span{color:#fff!important;opacity:1!important;filter:none!important}
 .v783-white-legend i{width:9px!important;height:9px!important;margin-top:2px!important;display:block!important;border-radius:1px!important}
 .row-middle .panel:nth-child(3),.row-middle .panel:nth-child(4){position:relative!important;overflow:hidden!important}
 .row-middle .panel:nth-child(3) .chart.medium,.row-middle .panel:nth-child(4) .chart.medium{padding-right:155px!important;box-sizing:border-box!important}

 .v783-distribution-summary{display:grid;gap:7px;margin:4px 0 14px}
 .v783-distribution-summary h3,.v783-dist-detail h3{margin:0 0 8px;color:#ffad20;font-size:14px}
 .v783-distribution-summary .sum-row{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:8px 10px;border:1px solid #284862;border-radius:6px;background:#0a1d31;color:#fff;font-size:11px}
 .v783-distribution-summary .sum-row strong,.v783-distribution-summary .sum-row span{color:#fff}.v783-distribution-summary .sum-row span{font-weight:800}.v783-distribution-summary .sum-row b{color:#5fe291}
 .v783-dist-detail{margin-top:10px}.v783-dist-table{width:100%;border-collapse:collapse;color:#fff;font-size:11px}.v783-dist-table th{text-align:left;color:#8dc7ff;padding:8px;border-bottom:1px solid #31516b;white-space:nowrap}.v783-dist-table td{padding:8px;border-bottom:1px dashed #29425a}.v783-dist-table td:nth-child(5),.v783-dist-table td:nth-child(6){font-weight:800}.v783-dist-table td:nth-child(6){color:#5fe291}

 @media(max-width:768px){
  .shift-panel .shift-content{grid-template-columns:minmax(215px,1fr) 108px!important;min-height:225px!important}
  .shift-panel .chart.donut{width:225px!important;max-width:225px!important;height:225px!important;min-height:225px!important;margin:-4px 0 0 0!important}
  .shift-panel .chart.donut canvas{width:225px!important;height:225px!important;max-width:225px!important;max-height:225px!important}
  .shift-panel .shift-legend{margin-top:48px!important}
  .v783-white-legend{position:static!important;width:auto!important;margin:8px 0 0!important}.row-middle .panel:nth-child(3) .chart.medium,.row-middle .panel:nth-child(4) .chart.medium{padding-right:0!important}
  .v783-dist-table{font-size:9px}.v783-dist-table th,.v783-dist-table td{padding:6px 4px}.v783-distribution-summary .sum-row{font-size:10px;grid-template-columns:1fr auto}
 }
 `;
}

function getChartByCanvas(id){
 try{
  const c=byId(id); if(!c||typeof Chart==='undefined')return null;
  return Chart.getChart(c)||null;
 }catch(_){return null}
}

function renderWhiteLegend(canvasId){
 const chart=getChartByCanvas(canvasId); if(!chart)return;
 const panel=byId(canvasId)?.closest('.panel'); if(!panel)return;
 try{
  if(chart.options?.plugins?.legend){chart.options.plugins.legend.display=false;chart.update('none')}
 }catch(_){}
 let host=panel.querySelector('.v783-white-legend');
 if(!host){host=document.createElement('div');host.className='v783-white-legend';panel.appendChild(host)}
 const ds=chart.data.datasets?.[0]||{},labels=chart.data.labels||[],colors=Array.isArray(ds.backgroundColor)?ds.backgroundColor:[];
 host.innerHTML=labels.map((l,i)=>`<div class="leg"><i style="background:${colors[i]||'#fff'}"></i><span>${esc(l)} ${fmt(ds.data?.[i])} L</span></div>`).join('');
}

function polishShift(){
 const chart=getChartByCanvas('shiftChart'); if(!chart)return;
 try{
  chart.options.radius='92%';
  chart.options.cutout='62%';
  chart.options.animation=false;
  chart.resize(265,265);
  chart.update('none');
 }catch(_){}
}

function polishDashboardCharts(){
 polishShift();
 renderWhiteLegend('truckChart');
 renderWhiteLegend('statusChart');
}

function renderTruckPerformance(){
 const host=byId('truckSummaryList');if(!host)return;
 const rows=(typeof state!=='undefined'&&Array.isArray(state.filtered)?state.filtered:[]).filter(r=>r?.Date&&r?.Fuel_Truck&&num(r.Fuel_Liter)>0);
 if(!rows.length){host.innerHTML='<div style="padding:18px;color:#9bb0c4;text-align:center">Belum ada data distribusi pada periode ini.</div>';return}
 const total=rows.reduce((a,r)=>a+num(r.Fuel_Liter),0),byFt={},grouped={};
 rows.forEach(r=>{
  const ft=String(r.Fuel_Truck),liter=num(r.Fuel_Liter);byFt[ft]=(byFt[ft]||0)+liter;
  const k=`${r.Date}|${ft}`;if(!grouped[k])grouped[k]={date:r.Date,ft,txn:0,liter:0};grouped[k].txn++;grouped[k].liter+=liter;
 });
 const summary=Object.entries(byFt).sort((a,b)=>b[1]-a[1]);
 const detail=Object.values(grouped).sort((a,b)=>a.date.localeCompare(b.date)||String(a.ft).localeCompare(String(b.ft)));
 host.className='v783-truck-performance';
 host.innerHTML=`<div class="v783-distribution-summary"><h3>DISTRIBUTION</h3>${summary.map(([ft,v])=>`<div class="sum-row"><strong>${esc(ft)}</strong><span>${fmt(v)} Liter</span><b>${total?((v/total)*100).toFixed(2):'0.00'}%</b></div>`).join('')}</div><div class="v783-dist-detail"><h3>Distribution & Truck Performance</h3><div class="table-wrap"><table class="v783-dist-table"><thead><tr><th>Date</th><th>Day</th><th>Kode Unit</th><th>Total transaksi</th><th>Total Distribusi</th><th>Persent</th></tr></thead><tbody>${detail.map(x=>`<tr><td>${dateID(x.date)}</td><td>${esc(dayID(x.date))}</td><td>${esc(x.ft)}</td><td>${fmt(x.txn)}</td><td>${fmt(x.liter)} L</td><td>${total?((x.liter/total)*100).toFixed(2):'0.00'}%</td></tr>`).join('')}</tbody></table></div></div>`;
}

function apply(){addStyle();polishDashboardCharts();renderTruckPerformance()}
setTimeout(apply,350);setTimeout(apply,1200);setTimeout(apply,2800);
window.addEventListener('pageshow',()=>setTimeout(apply,120),{passive:true});
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>setTimeout(apply,160),{passive:true}));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>byId(id)?.addEventListener('change',()=>setTimeout(apply,180),{passive:true}));
})();