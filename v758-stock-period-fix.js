(()=>{
'use strict';
const VER='75.9';

function latestStockDate(){
  const s=window.__FUEL_STOCK_DATA;
  const dates=[...(s?.availableDates||Object.keys(s?.snapshots||{}))]
    .filter(Boolean)
    .map(String)
    .sort((a,b)=>a.localeCompare(b));
  return dates.length?dates.at(-1):'';
}

function latestSnapshot(){
  const data=window.__FUEL_STOCK_DATA;
  const date=latestStockDate();
  return {date,snapshot:date?(data?.snapshots||{})[date]:null};
}

// IMPORTANT: app.js originally resolves stock using dateTo Fuel Usage.
// Replace that resolver so stock is independent from transaction filters
// and always uses the MAX date available in Stock Calculasi.
try{
  resolveStockSnapshot=function(){
    const {date,snapshot}=latestSnapshot();
    stock=snapshot
      ? {...snapshot,snapshotDate:date,snapshotTime:snapshot.time||''}
      : {fuelStorage:{},fuelTruck:{},total:0,snapshotDate:'',snapshotTime:''};
    window.__FUEL_STOCK_SELECTED_DATE=date||'';
  };
}catch(e){console.warn('Unable to override stock resolver',e)}

function syncStockToLatest(){
  const {date}=latestSnapshot();
  if(!date)return;
  try{
    if(typeof stockData!=='undefined'){
      const source=window.__FUEL_STOCK_DATA;
      if(source?.snapshots){
        stockData.snapshots=source.snapshots;
        stockData.availableDates=[...(source.availableDates||Object.keys(source.snapshots))].sort();
      }
      stockData.selectedDate=date;
      stockData.currentDate=date;
    }
  }catch(_){ }
  window.__FUEL_STOCK_SELECTED_DATE=date;
  try{if(typeof renderStock==='function')renderStock()}catch(e){console.warn('latest stock render',e)}
  try{if((location.hash==='#fuel-stock'||location.hash==='#fuel-stock-page')&&typeof renderFuelStockPage==='function')renderFuelStockPage(date)}catch(e){console.warn('latest stock page render',e)}
}

function run(){
  setTimeout(syncStockToLatest,30);
  setTimeout(syncStockToLatest,150);
  setTimeout(syncStockToLatest,450);
  setTimeout(syncStockToLatest,900);
}

run();
window.addEventListener('pageshow',run);
window.addEventListener('hashchange',run);
window.addEventListener('change',e=>{
  if(e.target?.id==='excelUpload')setTimeout(run,220);
  if(['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].includes(e.target?.id))setTimeout(syncStockToLatest,80);
});
})();
