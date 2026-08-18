(async()=>{
  if(location.search){const hash=location.hash||'#dashboard';history.replaceState(null,'',location.pathname+hash)}
  const q='78-perf3';
  const addCss=href=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l)};
  ['v6.css','v7.css','v71.css','v72.css','v724.css','v726.css','v730.css','v731.css','v733.css','v760-mobile.css'].forEach(x=>addCss(x+'?v='+q));
  const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)});
  const safeLoad=async src=>{try{await load(src)}catch(e){console.warn('Optional script failed:',src,e)}};
  const clone=x=>{try{return JSON.parse(JSON.stringify(x))}catch(_){return x}};
  const validUsage=a=>Array.isArray(a)&&a.some(r=>r&&r.Date&&r.Unit_Code&&Number(r.Fuel_Liter)>0);
  const maxDate=a=>validUsage(a)?a.reduce((m,r)=>String(r?.Date||'')>m?String(r.Date):m,''):'';

  // V78.2 STARTUP RULE: NEVER wait for Google Apps Script before showing dashboard.
  // The public snapshot is a local GitHub asset and is the guaranteed fallback.
  await safeLoad('v760-public-data.js?v='+q);
  const staticData=window.FUEL_STATIC_DATA||{};
  let staticUsage=validUsage(staticData.usage)?staticData.usage.map(r=>({...r})):[];
  let cachedUsage=[];
  try{
    const c=JSON.parse(localStorage.getItem('fuelptpsg_usage_v756')||'[]');
    if(validUsage(c)) cachedUsage=c;
    else if(Array.isArray(c)&&c.length) localStorage.removeItem('fuelptpsg_usage_v756');
  }catch(_){
    try{localStorage.removeItem('fuelptpsg_usage_v756')}catch(__){}
  }

  // Use the newest valid dataset, but always have static snapshot available.
  window.FUEL_DATA=(cachedUsage.length&&maxDate(cachedUsage)>=maxDate(staticUsage)?cachedUsage:staticUsage).map(r=>({...r}));
  window.__FUEL_DEFAULT_WB=null;

  // Preload non-usage data before app.js so dashboard does not need cloud to become usable.
  let cachedReceipts=null,cachedStock=null;
  try{cachedReceipts=JSON.parse(localStorage.getItem('fuelptpsg_receipts_v754')||'null')}catch(_){}
  try{cachedStock=JSON.parse(localStorage.getItem('fuelptpsg_stock_v754')||'null')}catch(_){}
  const receipts=Array.isArray(cachedReceipts)&&cachedReceipts.length?cachedReceipts:(Array.isArray(staticData.receipts)?staticData.receipts:[]);
  const stock=(cachedStock&&typeof cachedStock==='object'&&Object.keys(cachedStock.snapshots||{}).length)?cachedStock:(staticData.stock||{snapshots:{},availableDates:[]});
  const recon=staticData.recon||window.RECON_DATA||{daily:[],availableDates:[],receiptDetails:receipts};
  window.__FUEL_RECEIPTS=clone(receipts);
  window.__FUEL_STOCK_DATA=clone(stock);
  window.STOCK_DATA=clone(stock);
  window.RECON_DATA=clone(recon);

  // Render the complete core dashboard first.
  await load('app.js?v='+q);
  try{if(typeof stockData!=='undefined'){stockData.snapshots=clone(stock.snapshots||{});stockData.availableDates=[...(stock.availableDates||[])]}}catch(_){}
  try{if(typeof initFilters==='function')initFilters()}catch(e){console.warn('initFilters',e)}
  try{if(typeof applyFilters==='function')applyFilters()}catch(e){console.warn('applyFilters',e)}

  // Local UI enhancements next. None may block the dashboard.
  const bootUI=async()=>{
    for(const s of ['v741.js','v78-stable.js','v78-final-ui.js','v78-ui-lock.js']) await safeLoad(s+'?v='+q);
  };
  setTimeout(()=>bootUI(),40);

  // Cloud configuration and synchronization are delayed deliberately.
  // Even when Apps Script is slow/offline, the dashboard stays fully usable.
  setTimeout(async()=>{
    await safeLoad('v77-config.js?v='+q);
    if(String(window.FUEL_V77?.apiUrl||'').trim()) safeLoad('v770-remote-sync.js?v='+q);
  },5000);
})();
