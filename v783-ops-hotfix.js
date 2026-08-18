(()=>{
'use strict';
const byId=id=>document.getElementById(id);
const num=v=>Number(v)||0;
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(num(v));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function addStyle(){
 let st=byId('v783-ops-hotfix-style');
 if(!st){st=document.createElement('style');st.id='v783-ops-hotfix-style';document.head.appendChild(st)}
 st.textContent=`
 .shift-panel{overflow:hidden!important}
 .shift-panel .title h3{font-size:15px!important;line-height:1.15!important}
 .shift-panel .shift-content{display:grid!important;grid-template-columns:minmax(190px,1fr) 125px!important;align-items:start!important;gap:4px!important;min-height:205px!important;overflow:hidden!important}
 .shift-panel .chart.donut{width:205px!important;max-width:205px!important;height:205px!important;min-height:205px!important;margin:-4px 0 0 14px!important;justify-self:start!important;overflow:hidden!important}
 .shift-panel .chart.donut canvas{display:block!important;width:205px!important;height:205px!important;max-width:205px!important;max-height:205px!important}
 .shift-panel .shift-legend{margin-top:45px!important;align-self:start!important;display:grid!important;gap:6px!important;min-width:0!important}
 .shift-panel .shift-item small{font-size:10px!important;color:#fff!important;line-height:1.08!important}
 .shift-panel .shift-item strong{font-size:16px!important;color:#fff!important;line-height:1!important;margin:3px 0!important;white-space:nowrap!important}
 .shift-panel .shift-item strong span{font-size:9px!important;color:#fff!important}
 .shift-panel .shift-item>div>span{font-size:9px!important;color:#89c9ff!important}
 .v783-white-legend{position:absolute!important;right:10px!important;top:50px!important;width:145px!important;display:flex!important;flex-direction:column!important;gap:7px!important;z-index:50!important;pointer-events:none!important;color:#fff!important}
 .v783-white-legend .leg{display:grid!important;grid-template-columns:9px minmax(0,1fr)!important;gap:6px!important;align-items:start!important;color:#fff!important;font-size:9px!important;font-weight:800!important;line-height:1.2!important;text-shadow:0 1px 2px #000!important}
 .v783-white-legend .leg span{color:#fff!important;opacity:1!important;-webkit-text-fill-color:#fff!important}
 .v783-white-legend i{width:8px!important;height:8px!important;margin-top:2px!important;display:block!important;border-radius:1px!important}
 #truckChart,#statusChart{position:relative!important;z-index:1!important}
 @media(max-width:768px){
  .shift-panel .shift-content{grid-template-columns:minmax(175px,1fr) 105px!important;min-height:190px!important}
  .shift-panel .chart.donut{width:185px!important;max-width:185px!important;height:185px!important;min-height:185px!important;margin:-2px 0 0 2px!important}
  .shift-panel .chart.donut canvas{width:185px!important;height:185px!important;max-width:185px!important;max-height:185px!important}
  .shift-panel .shift-legend{margin-top:38px!important}
  .v783-white-legend{right:6px!important;top:48px!important;width:125px!important}.v783-white-legend .leg{font-size:8px!important}
 }
 `;
}
function getChart(id){try{const c=byId(id);return c&&window.Chart?Chart.getChart(c):null}catch(_){return null}}
function forceLegend(canvasId){
 const chart=getChart(canvasId),canvas=byId(canvasId);if(!chart||!canvas)return;
 const panel=canvas.closest('.panel');if(!panel)return;
 panel.style.position='relative';
 try{chart.options.plugins.legend.display=false;chart.update('none')}catch(_){}
 panel.querySelectorAll('.v783-white-legend').forEach(x=>x.remove());
 const host=document.createElement('div');host.className='v783-white-legend';
 const ds=chart.data.datasets?.[0]||{}, labels=chart.data.labels||[], colors=Array.isArray(ds.backgroundColor)?ds.backgroundColor:[];
 host.innerHTML=labels.map((l,i)=>`<div class="leg"><i style="background:${colors[i]||'#fff'}"></i><span>${esc(l)} ${fmt(ds.data?.[i])} L</span></div>`).join('');
 panel.appendChild(host);
}
function polishShift(){
 const chart=getChart('shiftChart');if(!chart)return;
 try{chart.options.radius='88%';chart.options.cutout='61%';chart.options.animation=false;chart.resize();chart.update('none')}catch(_){}
}
function apply(){addStyle();polishShift();forceLegend('truckChart');forceLegend('statusChart')}
[200,700,1500,3000].forEach(t=>setTimeout(apply,t));
window.addEventListener('pageshow',()=>setTimeout(apply,120),{passive:true});
document.addEventListener('click',e=>{if(e.target.closest('.nav-link[data-section]'))setTimeout(apply,180)},{passive:true});
document.addEventListener('change',e=>{if(['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].includes(e.target.id))setTimeout(apply,220)},{passive:true});
})();