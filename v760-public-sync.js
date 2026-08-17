(()=>{
'use strict';
const D=window.FUEL_STATIC_DATA||{};
const UKEY='fuelptpsg_usage_v756',RKEY='fuelptpsg_receipts_v754',SKEY='fuelptpsg_stock_v754',METAKEY='fuelptpsg_upload_meta_v764';
const get=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
const set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){ }};
const maxUsage=d=>Array.isArray(d)&&d.length?[...d].map(x=>x.Date||'').sort().at(-1)||'':'';
const maxReceipt=d=>Array.isArray(d)&&d.length?[...d].map(x=>x.Date||'').sort().at(-1)||'':'';
const maxStock=s=>s?.availableDates?.length?[...s.availableDates].sort().at(-1):Object.keys(s?.snapshots||{}).sort().at(-1)||'';
const uploadAuthority=()=>{const m=get(METAKEY);return !!(m&&m.source==='excel-upload'&&m.savedAt)};

// Setelah user upload Excel, dataset lokal menjadi sumber utama dan menggantikan dataset lama.
// Public snapshot hanya dipakai bila belum pernah ada upload Excel yang tersimpan di browser ini.
function chooseUsage(){
  const l=get(UKEY),p=D.usage||[];
  if(uploadAuthority()&&Array.isArray(l)&&l.length)return l;
  if(maxUsage(l)>maxUsage(p)&&Array.isArray(l)&&l.length)return l;
  return p;
}
function chooseReceipt(){
  const l=get(RKEY),p=D.receipts||[];
  if(uploadAuthority()&&Array.isArray(l))return l;
  if(maxReceipt(l)>maxReceipt(p)&&Array.isArray(l)&&l.length)return l;
  return p;
}
function chooseStock(){
  const l=get(SKEY),p=D.stock;
  if(uploadAuthority()&&l?.snapshots)return l;
  if(maxStock(l)>maxStock(p)&&l?.snapshots)return l;
  return p;
}
function applyBest(){
  const u=chooseUsage(),r=chooseReceipt(),s=chooseStock();
  if(Array.isArray(u)&&u.length){
    set(UKEY,u);
    try{
      if(typeof state!=='undefined'){
        state.raw=u.map(x=>({...x}));state.filtered=[];state.page=1;
        if(typeof initFilters==='function')initFilters();
        if(typeof applyFilters==='function')applyFilters();
        else if(typeof renderAll==='function'){state.filtered=[...state.raw];renderAll()}
      }
    }catch(e){console.warn('public/local usage sync',e)}
  }
  if(Array.isArray(r)){window.__FUEL_RECEIPTS=r.map(x=>({...x}));set(RKEY,window.__FUEL_RECEIPTS)}
  if(s?.snapshots){
    window.__FUEL_STOCK_DATA=JSON.parse(JSON.stringify(s));set(SKEY,window.__FUEL_STOCK_DATA);
    try{if(typeof stockData!=='undefined'){stockData.snapshots=window.__FUEL_STOCK_DATA.snapshots;stockData.availableDates=window.__FUEL_STOCK_DATA.availableDates}}catch(_){ }
  }
  try{if(typeof renderReceipt==='function')renderReceipt()}catch(_){ }
  try{if(typeof renderStock==='function')renderStock()}catch(_){ }
  try{if(typeof renderFuelStockPage==='function')renderFuelStockPage()}catch(_){ }
}
setTimeout(applyBest,50);setTimeout(applyBest,250);setTimeout(applyBest,700);
// Do not re-apply public data on hash navigation; that used to overwrite a fresh upload.
window.addEventListener('pageshow',()=>setTimeout(applyBest,100));
})();
