/* V78.4 additive patch: preserves existing fuel pages and calculations. */
(()=>{'use strict';
const style=document.createElement('style');style.id='v784-responsive-style';style.textContent=`
html{max-width:100%;overflow-x:hidden}body{max-width:100%;overflow-x:hidden}
.table-wrap,.page-table,.v783-receipt-wrap{max-width:100%;overflow-x:auto!important;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
.table-wrap table,.page-table table,.v783-receipt-wrap table{min-width:680px}
.row-middle .panel:nth-child(3),.row-middle .panel:nth-child(4){min-width:0!important;position:relative!important;overflow:hidden!important}
.row-middle .panel:nth-child(3) .chart,.row-middle .panel:nth-child(4) .chart{width:calc(100% - 155px)!important;max-width:calc(100% - 155px)!important;min-width:105px!important;height:190px!important;margin:0!important}
.row-middle .panel:nth-child(3) .chart canvas,.row-middle .panel:nth-child(4) .chart canvas{max-width:100%!important;max-height:100%!important}
.row-middle .panel:nth-child(3) .v783-white-legend,.row-middle .panel:nth-child(4) .v783-white-legend{width:140px!important;right:8px!important;top:52px!important;gap:9px!important;overflow-wrap:anywhere}
.row-middle .panel:nth-child(3) .v783-white-legend .leg,.row-middle .panel:nth-child(4) .v783-white-legend .leg{font-size:10px!important;line-height:1.35!important}
.filters input,.filters select,.filters button,.nav-link{min-height:40px}
@media(max-width:1100px){.row-middle{grid-template-columns:repeat(2,minmax(0,1fr))!important}.row-middle .panel:nth-child(3) .chart,.row-middle .panel:nth-child(4) .chart{height:205px!important}}
@media(max-width:768px){.row-middle{grid-template-columns:minmax(0,1fr)!important}.row-middle .panel:nth-child(3),.row-middle .panel:nth-child(4){min-height:230px!important}.row-middle .panel:nth-child(3) .chart,.row-middle .panel:nth-child(4) .chart{width:calc(100% - 142px)!important;max-width:calc(100% - 142px)!important;height:180px!important}.row-middle .panel:nth-child(3) .v783-white-legend,.row-middle .panel:nth-child(4) .v783-white-legend{width:130px!important}.filters button,.filters select,.filters input,.nav-link{min-height:44px!important;touch-action:manipulation}}
@media(max-width:380px){.row-middle .panel:nth-child(3) .chart,.row-middle .panel:nth-child(4) .chart{width:calc(100% - 125px)!important;max-width:calc(100% - 125px)!important}.row-middle .panel:nth-child(3) .v783-white-legend,.row-middle .panel:nth-child(4) .v783-white-legend{width:115px!important}}
`;document.head.appendChild(style);
// Export only a temporary Blob. Never append exported files to application state or storage.
window.FUEL_EXPORT_TEMPORARY=function(rows,filename='fuel-report.xlsx'){
 if(!window.XLSX)throw new Error('SheetJS belum tersedia');
 const safe=Array.isArray(rows)?rows:[];
 const wb=XLSX.utils.book_new();const ws=XLSX.utils.json_to_sheet(safe);
 XLSX.utils.book_append_sheet(wb,ws,'Fuel Report');
 const bytes=XLSX.write(wb,{bookType:'xlsx',type:'array'});
 const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
 const a=document.createElement('a');a.href=url;a.download=filename;a.hidden=true;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
 };
// Explicit, opt-in temporary cache cleanup: does NOT touch fuel data or master data.
window.FUEL_CLEAR_TEMPORARY_CACHE=async function(){
 if(!('caches' in window))return 0;
 const names=await caches.keys();const temp=names.filter(n=>/^fuelptpsg-temp-/i.test(n));
 await Promise.all(temp.map(n=>caches.delete(n)));return temp.length;
 };
// Avoid continuous redraw: only resize charts on an actual container change.
if('ResizeObserver' in window){let scheduled=false;const resize=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;for(const id of ['truckChart','statusChart']){const el=document.getElementById(id);const chart=el&&window.Chart?.getChart(el);if(chart)chart.resize();}})};const ro=new ResizeObserver(resize);for(const id of ['truckChart','statusChart']){const el=document.getElementById(id);if(el?.parentElement)ro.observe(el.parentElement);}}
})();