(()=>{
'use strict';
const AUTHORITATIVE_STOCK={
  snapshots:{
    '2026-08-16':{
      fuelStorage:{FS01:0,FS02:0,FS03:0,FS04:0,FS05:0,FS06:0},
      fuelTruck:{FTRL44G004:4149,FTRL44G005:0},
      total:4149,
      time:'06:00'
    }
  },
  availableDates:['2026-08-16']
};
const SKEY='fuelptpsg_stock_v754';
function apply(){
  try{localStorage.setItem(SKEY,JSON.stringify(AUTHORITATIVE_STOCK))}catch(_){ }
  window.__FUEL_STOCK_DATA=JSON.parse(JSON.stringify(AUTHORITATIVE_STOCK));
  if(window.FUEL_STATIC_DATA)window.FUEL_STATIC_DATA.stock=JSON.parse(JSON.stringify(AUTHORITATIVE_STOCK));
  try{
    if(typeof stockData!=='undefined'){
      stockData.snapshots=JSON.parse(JSON.stringify(AUTHORITATIVE_STOCK.snapshots));
      stockData.availableDates=[...AUTHORITATIVE_STOCK.availableDates];
    }
  }catch(_){ }
  try{if(typeof renderStock==='function')renderStock()}catch(e){console.warn('stock authority render',e)}
  try{if(typeof renderFuelStockPage==='function')renderFuelStockPage()}catch(_){ }
}
apply();
setTimeout(apply,80);setTimeout(apply,300);setTimeout(apply,900);
window.addEventListener('pageshow',()=>setTimeout(apply,100));
window.addEventListener('hashchange',()=>setTimeout(apply,100));
})();
