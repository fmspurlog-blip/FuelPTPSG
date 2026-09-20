/* V78.5 presentation-only patch. Does not modify stock, usage, exports or authentication. */
(()=>{'use strict';
const css=document.createElement('style');css.id='v785-chart-calendar';css.textContent=`
/* Visible native calendar affordance on dark backgrounds */
.filters input[type=date]{color-scheme:dark!important;color:#fff!important;min-height:44px!important;padding-right:9px!important;cursor:pointer!important}
.filters input[type=date]::-webkit-calendar-picker-indicator{filter:brightness(0) invert(1)!important;opacity:1!important;cursor:pointer!important;width:19px!important;height:19px!important}
.filters input[type=date]::-webkit-datetime-edit{color:#fff!important}
/* Donut and legend share a stable grid instead of absolute-position overlays. */
.row-middle .panel:nth-child(3),.row-middle .panel:nth-child(4){display:grid!important;grid-template-columns:minmax(0,1fr) minmax(145px,45%)!important;grid-template-rows:auto minmax(170px,1fr)!important;column-gap:10px!important;align-items:center!important;overflow:visible!important;min-width:0!important}
.row-middle .panel:nth-child(3)>.title,.row-middle .panel:nth-child(4)>.title{grid-column:1/-1!important;grid-row:1!important}
.row-middle .panel:nth-child(3)>.chart,.row-middle .panel:nth-child(4)>.chart{grid-column:1!important;grid-row:2!important;width:100%!important;max-width:100%!important;min-width:0!important;height:185px!important;min-height:185px!important;margin:0!important;display:flex!important;align-items:center!important;justify-content:center!important}
.row-middle .panel:nth-child(3)>.chart canvas,.row-middle .panel:nth-child(4)>.chart canvas{max-width:100%!important;max-height:185px!important}
.row-middle .panel:nth-child(3)>.v783-white-legend,.row-middle .panel:nth-child(4)>.v783-white-legend{position:static!important;grid-column:2!important;grid-row:2!important;width:auto!important;min-width:0!important;max-width:100%!important;display:flex!important;flex-direction:column!important;gap:9px!important;transform:none!important;overflow:visible!important;pointer-events:auto!important;z-index:auto!important}
.row-middle .panel:nth-child(3) .v783-white-legend .leg,.row-middle .panel:nth-child(4) .v783-white-legend .leg{display:grid!important;grid-template-columns:10px minmax(0,1fr)!important;gap:7px!important;font-size:10px!important;line-height:1.4!important;overflow-wrap:anywhere!important;white-space:normal!important;color:#fff!important}
.row-middle .panel:nth-child(3) .v783-ext-legend,.row-middle .panel:nth-child(4) .v783-ext-legend{display:none!important}
/* Reserve a wider chart area for category end labels. */
.row-middle .panel:nth-child(2){min-width:0!important;overflow:visible!important}
.row-middle .panel:nth-child(2) .chart{width:100%!important;min-width:0!important;overflow:visible!important}
@media(max-width:1250px){.row-middle .panel:nth-child(3),.row-middle .panel:nth-child(4){grid-template-columns:minmax(0,1fr) minmax(135px,43%)!important}}
@media(max-width:768px){.row-middle .panel:nth-child(3),.row-middle .panel:nth-child(4){grid-template-columns:minmax(0,1fr) minmax(135px,44%)!important;min-height:230px!important;padding:12px!important}.row-middle .panel:nth-child(3)>.chart,.row-middle .panel:nth-child(4)>.chart{height:175px!important;min-height:175px!important}.row-middle .panel:nth-child(3)>.chart canvas,.row-middle .panel:nth-child(4)>.chart canvas{max-height:175px!important}}
@media(max-width:380px){.row-middle .panel:nth-child(3),.row-middle .panel:nth-child(4){grid-template-columns:minmax(0,1fr) 125px!important;column-gap:4px!important}.row-middle .panel:nth-child(3) .v783-white-legend .leg,.row-middle .panel:nth-child(4) .v783-white-legend .leg{font-size:9px!important}}
`;document.head.appendChild(css);
function adjust(){
 for(const id of ['truckChart','statusChart']){const el=document.getElementById(id);const chart=el&&window.Chart?.getChart(el);if(!chart)continue;try{chart.options.maintainAspectRatio=false;chart.options.animation=false;chart.resize();chart.update('none')}catch(e){console.warn('V78.5 chart resize',e)}}
 const el=document.getElementById('categoryChart'),chart=el&&window.Chart?.getChart(el);
 if(chart){try{chart.options.layout=chart.options.layout||{};chart.options.layout.padding={...(chart.options.layout.padding||{}),right:Math.max(76,Number(chart.options.layout.padding?.right)||0)};chart.options.animation=false;chart.resize();chart.update('none')}catch(e){console.warn('V78.5 category chart',e)}}
}
// Run after the older hotfix has finished, and on explicit filter/navigation updates only.
setTimeout(adjust,1700);
document.addEventListener('change',e=>{if(['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].includes(e.target?.id))setTimeout(adjust,350)},{passive:true});
window.addEventListener('pageshow',()=>setTimeout(adjust,200),{passive:true});
})();