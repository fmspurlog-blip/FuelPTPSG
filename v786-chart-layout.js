/* V78.6: presentation only. Does not modify fuel data, stock or exports. */
(()=>{'use strict';
const style=document.createElement('style');style.id='v786-layout';style.textContent=`
.row-middle{align-items:stretch!important}
.row-middle>.panel{min-width:0!important;box-sizing:border-box!important}
.row-middle>.panel:nth-child(3),.row-middle>.panel:nth-child(4){position:relative!important;display:grid!important;grid-template-columns:minmax(0,1fr) minmax(118px,44%)!important;grid-template-rows:auto minmax(0,1fr)!important;column-gap:8px!important;align-items:center!important;overflow:hidden!important;min-height:220px!important}
.row-middle>.panel:nth-child(3)>.title,.row-middle>.panel:nth-child(4)>.title{grid-column:1/-1!important;grid-row:1!important;min-width:0!important}
.row-middle>.panel:nth-child(3)>.chart,.row-middle>.panel:nth-child(4)>.chart{grid-column:1!important;grid-row:2!important;width:100%!important;max-width:100%!important;min-width:0!important;height:165px!important;min-height:0!important;margin:0!important;position:relative!important;overflow:hidden!important;display:flex!important;align-items:center!important;justify-content:center!important}
.row-middle>.panel:nth-child(3)>.chart canvas,.row-middle>.panel:nth-child(4)>.chart canvas{max-width:100%!important;max-height:165px!important}
.row-middle>.panel .v783-white-legend,.row-middle>.panel .v783-ext-legend{display:none!important}
.row-middle>.panel .v786-legend{grid-column:2!important;grid-row:2!important;position:static!important;display:flex!important;flex-direction:column!important;gap:8px!important;width:100%!important;min-width:0!important;max-width:100%!important;overflow:hidden!important;align-self:center!important;z-index:2!important}
.v786-legend-row{display:grid!important;grid-template-columns:9px minmax(0,1fr)!important;gap:6px!important;align-items:start!important;min-width:0!important;font:700 10px/1.35 'Segoe UI',Arial,sans-serif!important;color:#fff!important;overflow-wrap:anywhere!important}
.v786-legend-row i{display:block;width:9px;height:9px;margin-top:2px;border-radius:1px}
.shift-panel{overflow:hidden!important;min-width:0!important}
.shift-panel .shift-content{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(105px,38%)!important;gap:5px!important;align-items:center!important;min-width:0!important;min-height:0!important;overflow:hidden!important}
.shift-panel .chart.donut{width:100%!important;max-width:100%!important;height:190px!important;min-height:0!important;margin:0!important;overflow:hidden!important}
.shift-panel .chart.donut canvas{max-width:100%!important;max-height:190px!important}
.shift-panel .shift-legend{min-width:0!important;margin:0!important;transform:none!important;overflow-wrap:anywhere!important}
.row-middle>.panel:nth-child(2){overflow:hidden!important;min-width:0!important}
.row-middle>.panel:nth-child(2) .chart{max-width:100%!important;overflow:hidden!important}
@media(max-width:1200px){.row-middle{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:768px){.row-middle{grid-template-columns:minmax(0,1fr)!important}.row-middle>.panel:nth-child(3),.row-middle>.panel:nth-child(4){grid-template-columns:minmax(0,1fr) minmax(125px,43%)!important;min-height:215px!important}.shift-panel .chart.donut{height:170px!important}.shift-panel .chart.donut canvas{max-height:170px!important}}
@media(max-width:380px){.v786-legend-row{font-size:9px!important}.row-middle>.panel:nth-child(3),.row-middle>.panel:nth-child(4){grid-template-columns:minmax(0,1fr) 120px!important}}
`;document.head.appendChild(style);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function apply(){
 for(const id of ['truckChart','statusChart']){
  const canvas=document.getElementById(id),chart=canvas&&window.Chart?.getChart(canvas),panel=canvas?.closest('.panel');if(!chart||!panel)continue;
  panel.querySelectorAll('.v783-white-legend,.v783-ext-legend').forEach(n=>n.remove());
  let legend=panel.querySelector('.v786-legend');if(!legend){legend=document.createElement('div');legend.className='v786-legend';panel.appendChild(legend)}
  const ds=chart.data.datasets?.[0]||{},colors=ds.backgroundColor,labels=chart.data.labels||[];
  legend.replaceChildren(...labels.map((label,i)=>{const row=document.createElement('div');row.className='v786-legend-row';const sw=document.createElement('i');sw.style.backgroundColor=Array.isArray(colors)?colors[i]||'#fff':colors||'#fff';const txt=document.createElement('span');txt.textContent=String(label)+' '+Number(ds.data?.[i]||0).toLocaleString('id-ID')+' L';row.append(sw,txt);return row}));
  try{chart.options.plugins.legend.display=false;chart.options.maintainAspectRatio=false;chart.options.animation=false;chart.resize();chart.update('none')}catch(e){console.warn('V78.6 donut resize',e)}
 }
 const category=document.getElementById('categoryChart'),c=category&&window.Chart?.getChart(category);
 if(c){try{c.options.layout=c.options.layout||{};c.options.layout.padding={...(c.options.layout.padding||{}),right:90};c.options.animation=false;c.resize();c.update('none')}catch(e){console.warn('V78.6 category',e)}}
 const shift=document.getElementById('shiftChart'),s=shift&&window.Chart?.getChart(shift);if(s){try{s.options.maintainAspectRatio=false;s.options.animation=false;s.resize();s.update('none')}catch(e){console.warn('V78.6 shift',e)}}
}
setTimeout(apply,1500);window.addEventListener('pageshow',()=>setTimeout(apply,180));document.addEventListener('change',e=>{if(['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].includes(e.target?.id))setTimeout(apply,220)});
})();