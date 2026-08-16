(()=>{
'use strict';
const VER='75.8';
function latestStockDate(){
  const s=window.__FUEL_STOCK_DATA;
  const dates=(s?.availableDates||Object.keys(s?.snapshots||{})).filter(Boolean).sort();
  return dates.length?dates[dates.length-1]:'';
}
function syncStockToLatest(){
  const latest=latestStockDate();
  if(!latest)return;
  // Stock panel must always open on the latest available Stock Calculasi snapshot,
  // independent from the fuel-usage period filter.
  try{
    if(typeof stockData!=='undefined'){
      stockData.selectedDate=latest;
      stockData.currentDate=latest;
    }
  }catch(_){ }
  window.__FUEL_STOCK_SELECTED_DATE=latest;
  try{if(typeof renderStock==='function')renderStock(latest)}catch(e){console.warn('latest stock render',e)}
  try{if(location.hash==='#fuel-stock'&&typeof renderFuelStockPage==='function')renderFuelStockPage(latest)}catch(e){console.warn('latest stock page render',e)}
}
function run(){setTimeout(syncStockToLatest,40);setTimeout(syncStockToLatest,180);setTimeout(syncStockToLatest,500)}
run();
window.addEventListener('pageshow',run);
window.addEventListener('hashchange',run);
window.addEventListener('change',e=>{
  if(e.target?.id==='excelUpload')setTimeout(run,250);
  if(['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].includes(e.target?.id))setTimeout(syncStockToLatest,100);
});
})();
