(()=>{
'use strict';
const D=window.FUEL_STATIC_DATA||{};
const UKEY='fuelptpsg_usage_v756',RKEY='fuelptpsg_receipts_v754',SKEY='fuelptpsg_stock_v754';
const hasLocal=k=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(v)?v.length>0:!!(v&&Object.keys(v).length)}catch(_){return false}};
function applyPublic(){
  if(!D.usage?.length)return;
  try{
    if(typeof state!=='undefined'&&!hasLocal(UKEY)){
      state.raw=D.usage.map(r=>({...r}));state.filtered=[];state.page=1;
      if(typeof initFilters==='function')initFilters();
      if(typeof applyFilters==='function')applyFilters();
      else if(typeof renderAll==='function'){state.filtered=[...state.raw];renderAll();}
    }
  }catch(e){console.warn('public usage',e)}
  if(!hasLocal(RKEY)&&Array.isArray(D.receipts))window.__FUEL_RECEIPTS=D.receipts.map(r=>({...r}));
  if(!hasLocal(SKEY)&&D.stock){
    window.__FUEL_STOCK_DATA=JSON.parse(JSON.stringify(D.stock));
    try{if(typeof stockData!=='undefined'){stockData.snapshots=window.__FUEL_STOCK_DATA.snapshots;stockData.availableDates=window.__FUEL_STOCK_DATA.availableDates}}catch(_){ }
  }
  try{if(typeof renderReceipt==='function')renderReceipt()}catch(_){ }
  try{if(typeof renderStock==='function')renderStock()}catch(_){ }
  try{if(typeof renderFuelStockPage==='function')renderFuelStockPage()}catch(_){ }
}
setTimeout(applyPublic,80);setTimeout(applyPublic,350);setTimeout(applyPublic,900);
window.addEventListener('pageshow',()=>setTimeout(applyPublic,120));
window.addEventListener('hashchange',()=>setTimeout(applyPublic,120));
})();
