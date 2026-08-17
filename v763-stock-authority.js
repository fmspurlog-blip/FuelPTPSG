(()=>{
'use strict';
// v76.4: hard-coded stock snapshot removed.
// Stock now follows the currently uploaded/persisted workbook data.
function applyStoredStock(){
  try{
    const raw=localStorage.getItem('fuelptpsg_stock_v754');
    if(!raw)return;
    const s=JSON.parse(raw);
    if(!s?.snapshots)return;
    window.__FUEL_STOCK_DATA=JSON.parse(JSON.stringify(s));
    if(typeof stockData!=='undefined'){
      stockData.snapshots=JSON.parse(JSON.stringify(s.snapshots||{}));
      stockData.availableDates=[...(s.availableDates||Object.keys(s.snapshots||{}).sort())];
    }
    if(typeof renderStock==='function')renderStock();
    if(typeof renderFuelStockPage==='function')renderFuelStockPage();
  }catch(e){console.warn('stored stock restore',e)}
}
setTimeout(applyStoredStock,120);
window.addEventListener('pageshow',()=>setTimeout(applyStoredStock,140));
})();
