(()=>{
'use strict';
const CFG=window.FUEL_V77||{};
const API=String(CFG.apiUrl||'').trim();
const POLL=Math.max(15000,Number(CFG.pollMs)||60000);
const TIMEOUT=Math.max(5000,Number(CFG.requestTimeoutMs)||20000);
const META_KEY='fuelptpsg_v77_remote_meta';
let syncing=false,lastRemoteStamp='';
const clone=x=>JSON.parse(JSON.stringify(x));
const fmtDateTime=s=>{try{return new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(s))}catch(_){return s||'-'}};
function setCloudStatus(text,ok=true){
  let e=document.getElementById('v77CloudStatus');
  if(!e){
    const host=document.querySelector('.hero-status');
    if(!host)return;
    e=document.createElement('span');e.id='v77CloudStatus';e.style.cssText='font-size:10px;font-weight:900;padding:5px 8px;border-radius:6px;margin-left:6px;border:1px solid #2b4f6d;';host.appendChild(e);
  }
  e.textContent=text;e.style.color=ok?'#44e28b':'#ffb24a';e.style.background=ok?'rgba(29,148,87,.12)':'rgba(255,139,31,.12)';
}
function endpoint(params={}){const u=new URL(API);Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));u.searchParams.set('_',Date.now());return u.toString()}
async function fetchJson(url,opt={}){
  const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),TIMEOUT);
  try{const r=await fetch(url,{cache:'no-store',redirect:'follow',...opt,signal:ctl.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}
}
function applyRemote(payload){
  if(!payload?.ok||!payload.data)return false;
  const d=payload.data;
  try{
    if(Array.isArray(d.usage)&&d.usage.length&&typeof state!=='undefined'){
      state.raw=d.usage.map(r=>({...r}));state.filtered=[];state.page=1;
      try{localStorage.setItem('fuelptpsg_usage_v756',JSON.stringify(state.raw))}catch(_){ }
      if(typeof initFilters==='function')initFilters();
      if(typeof applyFilters==='function')applyFilters();else if(typeof renderAll==='function'){state.filtered=[...state.raw];renderAll();}
    }
    if(Array.isArray(d.receipts)){
      window.__FUEL_RECEIPTS=d.receipts.map(r=>({...r}));
      try{localStorage.setItem('fuelptpsg_receipts_v754',JSON.stringify(window.__FUEL_RECEIPTS))}catch(_){ }
      if(typeof renderReceipt==='function')renderReceipt();
    }
    if(d.stock?.snapshots){
      window.__FUEL_STOCK_DATA=clone(d.stock);
      try{localStorage.setItem('fuelptpsg_stock_v754',JSON.stringify(window.__FUEL_STOCK_DATA))}catch(_){ }
      try{if(typeof stockData!=='undefined'){stockData.snapshots=clone(d.stock.snapshots||{});stockData.availableDates=[...(d.stock.availableDates||[])]}}catch(_){ }
      if(typeof renderStock==='function')renderStock();if(typeof renderFuelStockPage==='function')renderFuelStockPage();
    }
    if(d.recon&&typeof reconData!=='undefined'){
      if(Array.isArray(d.recon.daily))reconData.daily=clone(d.recon.daily);
      if(Array.isArray(d.recon.availableDates))reconData.availableDates=[...d.recon.availableDates];
      if(Array.isArray(d.recon.receiptDetails))reconData.receiptDetails=clone(d.recon.receiptDetails);
      if(typeof renderReconciliation==='function')renderReconciliation();
    }
    lastRemoteStamp=payload.updatedAt||'';
    localStorage.setItem(META_KEY,JSON.stringify({updatedAt:lastRemoteStamp,version:payload.version||'V77'}));
    setCloudStatus(`☁ CLOUD ${fmtDateTime(lastRemoteStamp)}`,true);
    return true;
  }catch(e){console.error('V77 apply remote failed',e);return false}
}
async function pullRemote(force=false){
  if(!API||syncing)return false;syncing=true;
  try{
    const p=await fetchJson(endpoint({action:'latest'}));
    if(!p?.ok)throw new Error(p?.error||'Remote database error');
    if(force||!lastRemoteStamp||p.updatedAt!==lastRemoteStamp)applyRemote(p);
    else setCloudStatus(`☁ CLOUD ${fmtDateTime(p.updatedAt)}`,true);
    return true;
  }catch(e){console.warn('V77 remote pull',e);setCloudStatus('☁ CLOUD OFFLINE',false);return false}
  finally{syncing=false}
}
function currentPayload(){
  let usage=[];try{usage=(typeof state!=='undefined'&&Array.isArray(state.raw))?clone(state.raw):[]}catch(_){ }
  return {usage,receipts:clone(window.__FUEL_RECEIPTS||[]),stock:clone(window.__FUEL_STOCK_DATA||{snapshots:{},availableDates:[]}),recon:(typeof reconData!=='undefined'?clone(reconData):null)};
}
async function pushRemote(){
  if(!API)return false;
  const pwd=window.__FUEL_UPLOAD_PASSWORD||'';
  if(!pwd){setCloudStatus('☁ CLOUD: AUTH REQUIRED',false);return false}
  const data=currentPayload();
  if(!data.usage.length)throw new Error('Fuel Usage kosong, tidak dikirim ke cloud.');
  setCloudStatus('☁ CLOUD SYNCING...',false);
  const p=await fetchJson(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'replace',password:pwd,data})});
  if(!p?.ok)throw new Error(p?.error||'Cloud upload failed');
  lastRemoteStamp=p.updatedAt||'';setCloudStatus(`☁ CLOUD ${fmtDateTime(lastRemoteStamp)}`,true);
  try{localStorage.setItem(META_KEY,JSON.stringify({updatedAt:lastRemoteStamp,version:p.version||'V77'}))}catch(_){ }
  setTimeout(()=>{try{window.__FUEL_UPLOAD_PASSWORD=''}catch(_){ }},120000);
  return true;
}
function schedulePushAfterExcel(){
  setTimeout(async()=>{
    try{const ok=await pushRemote();if(ok){alert('V77 DATABASE PERMANENT berhasil disinkronkan.\nData terbaru sekarang dapat dibaca dari PC dan HP lain secara otomatis.')}}
    catch(e){console.error('V77 cloud push',e);setCloudStatus('☁ CLOUD SYNC FAILED',false);alert('Data tampil di perangkat ini, tetapi sinkronisasi V77 ke database pusat gagal: '+(e?.message||e));}
  },900);
}
if(!API){setTimeout(()=>setCloudStatus('☁ V77 DATABASE BELUM DIHUBUNGKAN',false),800);return;}
try{const m=JSON.parse(localStorage.getItem(META_KEY)||'null');lastRemoteStamp=m?.updatedAt||''}catch(_){ }
pullRemote(true);
setInterval(()=>pullRemote(false),POLL);
window.addEventListener('pageshow',()=>setTimeout(()=>pullRemote(true),120));
window.addEventListener('focus',()=>setTimeout(()=>pullRemote(false),120));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pullRemote(false)});
window.addEventListener('change',e=>{if(e.target?.id==='excelUpload'&&e.target.files?.length)schedulePushAfterExcel()},false);
window.FUEL_V77_SYNC={pull:()=>pullRemote(true),push:pushRemote};
})();
