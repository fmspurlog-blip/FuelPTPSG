(()=>{
'use strict';
try{
  resolveStockSnapshot=function(){
    const dates=[...(stockData?.availableDates||[])].filter(Boolean).sort();
    const selected=dates.at(-1)||'';
    const s=selected?(stockData?.snapshots||{})[selected]:null;
    stock=s?{...s,snapshotDate:selected,snapshotTime:s.time||'06:00'}:{fuelStorage:{},fuelTruck:{},total:0,snapshotDate:'',snapshotTime:''};
  };
}catch(e){console.warn('V77.12 stock snapshot patch',e)}
function refresh(){
  try{if(typeof renderStock==='function')renderStock()}catch(e){console.warn('V77.12 renderStock',e)}
  try{if(typeof renderFuelStockPage==='function'&&document.getElementById('fuel-stock-page')?.classList.contains('active-section'))renderFuelStockPage()}catch(e){console.warn('V77.12 stock page',e)}
  const h=document.querySelector('.hero h1');if(h)h.textContent='FUEL MANAGEMENT SYSTEM V77.12';
  document.title='Fuel Management System V77.12 | PT Prima Sarana Gemilang';
}
try{if(typeof renderAll==='function'&&!renderAll.__v7712stock){const old=renderAll;const fn=function(...a){const r=old.apply(this,a);queueMicrotask(refresh);return r};fn.__v7712stock=true;renderAll=fn}}catch(_){ }
try{if(typeof applyFilters==='function'&&!applyFilters.__v7712stock){const old=applyFilters;const fn=function(...a){const r=old.apply(this,a);queueMicrotask(refresh);return r};fn.__v7712stock=true;applyFilters=fn}}catch(_){ }
refresh();[300,1200,3500].forEach(t=>setTimeout(refresh,t));
})();
