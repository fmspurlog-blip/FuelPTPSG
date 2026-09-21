/* Single owner for dashboard Chart.js presentation. No data, stock or auth changes. */
(()=>{'use strict';
const css=document.createElement('style');css.id='fms-chart-components';css.textContent=`
html,body{max-width:100%;overflow-x:hidden}
.table-wrap,.page-table,.fms-receipt-wrap{max-width:100%;overflow-x:auto!important;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
.table-wrap table,.page-table table{min-width:680px}
.filters input,.filters select,.filters button,.nav-link{min-height:44px;touch-action:manipulation}
.filters input[type=date]{color-scheme:dark!important;color:#fff!important;cursor:pointer!important}
.filters input[type=date]::-webkit-calendar-picker-indicator{filter:brightness(0) invert(1)!important;opacity:1!important;cursor:pointer!important}
.row-middle{align-items:stretch!important}.row-middle>.panel{min-width:0!important;box-sizing:border-box!important}
/* v731.css uses high-specificity :has(#truckChart) with display:flex!important.
   Override that original rule explicitly instead of adding another runtime overlay. */
.row-middle>.panel.fms-donut-panel:has(#truckChart),.row-middle>.panel.fms-donut-panel:has(#statusChart){display:grid!important;grid-template-columns:minmax(0,45%) minmax(0,55%)!important;grid-template-rows:auto minmax(0,1fr)!important;gap:4px!important;align-items:center!important;min-height:256px!important;overflow:hidden!important}
.row-middle>.panel.fms-donut-panel>.title{grid-column:1/-1!important;grid-row:1!important;min-width:0!important}
.row-middle>.panel.fms-donut-panel:has(#truckChart)>.chart.medium,.row-middle>.panel.fms-donut-panel:has(#statusChart)>.chart.medium{grid-column:1!important;grid-row:2!important;display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;height:164px!important;min-height:0!important;max-height:164px!important;margin:0!important;position:relative!important;overflow:hidden!important}
.row-middle>.panel.fms-donut-panel>.chart.medium canvas{display:block!important;max-width:100%!important;max-height:164px!important}
.row-middle>.panel.fms-donut-panel:has(#truckChart)>.fms-chart-legend,.row-middle>.panel.fms-donut-panel:has(#statusChart)>.fms-chart-legend{grid-column:2!important;grid-row:2!important;min-width:0!important;max-width:100%!important;width:100%!important;display:grid!important;gap:6px!important;align-self:center!important;justify-self:stretch!important;color:#fff!important;overflow-wrap:anywhere!important}
.fms-legend-entry{display:grid!important;grid-template-columns:9px minmax(0,1fr)!important;gap:6px!important;align-items:start!important;min-width:0!important;color:#fff!important}
.fms-legend-swatch{width:9px;height:9px;border-radius:2px;margin-top:3px;display:block}
.fms-legend-copy{min-width:0;display:grid;gap:1px;overflow-wrap:anywhere}
.fms-legend-label{font:750 10px/1.25 'Segoe UI',Arial,sans-serif!important;color:#fff!important}
.fms-legend-value{font:800 11px/1.25 'Segoe UI',Arial,sans-serif!important;color:#fff!important;font-variant-numeric:tabular-nums}
.fms-legend-percent{font:600 9px/1.15 'Segoe UI',Arial,sans-serif;color:#9ecbff}
.fms-legend-empty{font:600 10px/1.4 'Segoe UI',Arial,sans-serif;color:#c5d5e8}
/* Status has four entries. Show all statuses + liters; percent is optional and
   omitted to keep the entire legend inside its desktop panel. */
.row-middle>.panel.fms-donut-panel:has(#statusChart) .fms-legend-percent{display:none!important}
.shift-panel{min-width:0!important;overflow:hidden!important}
.shift-panel .shift-content{display:grid!important;grid-template-columns:minmax(0,53%) minmax(0,47%)!important;gap:4px!important;align-items:center!important;min-height:0!important;height:190px!important;overflow:hidden!important}
.shift-panel .chart.donut{height:162px!important;max-height:162px!important;min-height:0!important;width:100%!important;max-width:100%!important;margin:0!important;overflow:hidden!important;position:relative!important}
.shift-panel .chart.donut canvas{display:block!important;max-height:162px!important;max-width:100%!important}
.shift-panel .shift-legend{margin:0!important;transform:none!important;min-width:0!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:7px!important;align-self:center!important;overflow-wrap:anywhere!important}
.shift-panel .shift-item{min-width:0!important;gap:5px!important;grid-template-columns:9px minmax(0,1fr)!important}
.shift-panel .shift-item strong{font-size:14px!important;margin:2px 0!important;overflow-wrap:anywhere}
.shift-panel .shift-item small{font-size:9px!important;overflow-wrap:anywhere}
.shift-panel .shift-dot{width:9px;height:9px}
.row-middle>.panel:nth-child(2){min-width:0!important;overflow:hidden!important}
.row-middle>.panel:nth-child(2) .chart.medium{width:100%!important;max-width:100%!important;min-width:0!important;overflow:hidden!important}
@media(max-width:1300px){.row-middle{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:850px){.row-middle{grid-template-columns:minmax(0,1fr)!important}}
@media(max-width:768px){.row-middle>.panel.fms-donut-panel>.chart.medium{height:170px!important;max-height:170px!important;min-height:0!important}.row-middle>.panel.fms-donut-panel>.chart.medium canvas{max-height:170px!important}.shift-panel .shift-content{grid-template-columns:minmax(0,50%) minmax(0,50%)!important;height:185px!important}.shift-panel .chart.donut,.shift-panel .chart.donut canvas{max-height:155px!important;height:155px!important}.filters input,.filters select,.filters button,.nav-link{min-height:44px!important}}
@media(max-width:390px){.fms-legend-label{font-size:9px!important}.fms-legend-value{font-size:10px!important}.shift-panel .shift-item strong{font-size:12px!important}}
`;document.head.appendChild(css);
const ids=new Set(['truckChart','statusChart']);
const format=v=>Number(v||0).toLocaleString('id-ID',{maximumFractionDigits:0});
const chartID=chart=>chart.canvas?.id||'';
function legendHTML(chart){
 const panel=chart.canvas?.closest('.panel');if(!panel)return;
 panel.classList.add('fms-donut-panel');
 panel.querySelectorAll('.v783-ext-legend,.v783-white-legend,.v786-legend').forEach(n=>n.remove());
 let host=panel.querySelector(':scope > .fms-chart-legend');
 if(!host){host=document.createElement('div');host.className='fms-chart-legend';host.setAttribute('aria-label','Keterangan diagram');panel.appendChild(host)}
 const ds=chart.data.datasets?.[0]||{},labels=chart.data.labels||[],values=ds.data||[];
 const total=values.reduce((n,v)=>n+(Number(v)||0),0),sig=JSON.stringify([labels,values,ds.backgroundColor]);
 if(host.dataset.signature===sig)return;host.dataset.signature=sig;
 const frag=document.createDocumentFragment();
 labels.forEach((label,i)=>{
  const item=document.createElement('div');item.className='fms-legend-entry';
  const swatch=document.createElement('i');swatch.className='fms-legend-swatch';swatch.style.backgroundColor=Array.isArray(ds.backgroundColor)?ds.backgroundColor[i]||'#fff':ds.backgroundColor||'#fff';
  const copy=document.createElement('div');copy.className='fms-legend-copy';
  const name=document.createElement('span');name.className='fms-legend-label';name.textContent=String(label??'');
  const qty=document.createElement('span');qty.className='fms-legend-value';qty.textContent=format(values[i])+' L';
  const pct=document.createElement('span');pct.className='fms-legend-percent';pct.textContent=(total?100*(Number(values[i])||0)/total:0).toFixed(2)+'%';
  copy.append(name,qty,pct);item.append(swatch,copy);frag.append(item);
 });
 if(!labels.length){const empty=document.createElement('span');empty.className='fms-legend-empty';empty.textContent='Tidak ada data pada periode ini';frag.append(empty)}
 host.replaceChildren(frag);
}
const plugin={
 id:'fmsChartComponents',
 beforeInit(chart){const id=chartID(chart),opts=chart.config.options;
  // Never write chart.options: it is Chart.js's resolving proxy (recursive setter).
  if(ids.has(id)){opts.plugins=opts.plugins||{};opts.plugins.legend={...(opts.plugins.legend||{}),display:false};opts.maintainAspectRatio=false;opts.animation=false;chart.canvas.closest('.panel')?.classList.add('fms-donut-panel')}
  // Keep a 120px label gutter for 12-digit values on narrow phones while retaining the plot.
  if(id==='categoryChart'){opts.plugins=opts.plugins||{};opts.plugins.datalabels={...(opts.plugins.datalabels||{}),display:false};opts.layout={...(opts.layout||{}),padding:{...(opts.layout?.padding||{}),right:120}};opts.animation=false}
 },
 afterUpdate(chart){if(ids.has(chartID(chart)))legendHTML(chart)},
 afterDatasetsDraw(chart){if(chartID(chart)!=='categoryChart')return;const ctx=chart.ctx,ds=chart.data.datasets?.[0];if(!ds)return;
 let total=ds.data.reduce((n,v)=>n+(Number(v)||0),0);try{if(typeof state!=='undefined'&&Array.isArray(state.filtered))total=state.filtered.reduce((n,r)=>n+(Number(r.Fuel_Liter)||0),0)||total}catch(_){}
 const meta=chart.getDatasetMeta(0);ctx.save();ctx.fillStyle='#fff';ctx.font='700 9px Segoe UI, Arial, sans-serif';ctx.textBaseline='middle';ctx.textAlign='left';
 meta.data.forEach((bar,i)=>{const v=Number(ds.data[i])||0;const label=format(v)+' ('+(total?(v/total*100):0).toFixed(1)+'%)';ctx.fillText(label,chart.chartArea.right+5,bar.y,Math.max(55,chart.width-chart.chartArea.right-8))});ctx.restore();}
};
if(window.Chart&&!Chart.registry.plugins.get(plugin.id))Chart.register(plugin);
})();