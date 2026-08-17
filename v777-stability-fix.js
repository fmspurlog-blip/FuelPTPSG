(()=>{
'use strict';
const VER='77.7';
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
const dateLong=s=>{if(!s)return'-';const d=new Date(String(s)+'T00:00:00');return Number.isNaN(d.getTime())?String(s):new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(d)};

/* ---------- PRIMA logo: Safari/iPhone-safe and self-healing ---------- */
let logoBusy=false;
function buildLogo(){
  const box=document.querySelector('.logo-box');
  if(!box||logoBusy)return;
  if(box.dataset.v777Logo==='1'&&box.querySelector('.v777-logo-wrap'))return;
  logoBusy=true;
  try{
    box.dataset.v777Logo='1';
    box.className='logo-box v777-logo-box';
    box.replaceChildren();
    const wrap=document.createElement('div');
    wrap.className='v777-logo-wrap';
    const fallback=document.createElement('div');
    fallback.className='v777-logo-fallback';
    fallback.innerHTML='<span class="v777-prima-word">PRIMA</span><span class="v777-prima-dot red"></span><span class="v777-prima-dot orange"></span>';
    const img=document.createElement('img');
    img.className='v777-logo-img';
    img.alt='PRIMA - PT Prima Sarana Gemilang';
    img.src=location.origin+location.pathname.replace(/[^/]*$/,'')+'prima-logo.png?v='+VER;
    img.setAttribute('fetchpriority','high');
    img.loading='eager';
    img.decoding='async';
    img.onload=()=>{img.classList.add('is-loaded')};
    img.onerror=()=>{img.classList.remove('is-loaded')};
    wrap.append(fallback,img);
    box.appendChild(wrap);
  }finally{logoBusy=false}
}

const logoBox=document.querySelector('.logo-box');
if(logoBox){
  const logoObserver=new MutationObserver(()=>queueMicrotask(buildLogo));
  logoObserver.observe(logoBox,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
}

/* ---------- RECENT RECEIPT: one permanent renderer ---------- */
function receiptSource(){
  const direct=Array.isArray(window.__FUEL_RECEIPTS)?window.__FUEL_RECEIPTS:[];
  if(direct.length)return direct.map(r=>({
    date:r.Date||r.date||'',supplier:r.Supplier||r.supplier||'',sj:r.No_Surat_Jalan||r.No_DO||r.DO||r.no_sj||'',qty:Number(r.Qty??r.qty)||0,transporter:r.Transporter||r.transportir||'',po:r.Ref_PO||r.Reference||r.PO||r.ref_po||''
  }));
  try{return (reconData.receiptDetails||[]).map(r=>({date:r.date||r.Date||'',supplier:r.supplier||r.Supplier||'',sj:r.no_sj||r.No_Surat_Jalan||'',qty:Number(r.qty??r.Qty)||0,transporter:r.transportir||r.Transporter||'',po:r.ref_po||r.Ref_PO||r.Reference||''}))}catch(_){return []}
}

let receiptBusy=false;
let receiptObserver=null;
function receiptMarkup(){
  const from=document.getElementById('dateFrom')?.value||'',to=document.getElementById('dateTo')?.value||'';
  const rows=receiptSource().filter(r=>(!from||r.date>=from)&&(!to||r.date<=to)).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,10);
  return rows.map(r=>`<div class="page-list-row v777-receipt"><div class="v777-receipt-main"><b>${dateLong(r.date)}</b><small>${r.supplier||'-'}${r.sj?' • SJ/DO: '+r.sj:''}${r.transporter?' • '+r.transporter:''}</small><small>Ref PO: ${r.po||'-'}</small></div><strong>${fmt(r.qty)} L</strong></div>`).join('')||'<div class="page-list-row v777-receipt-empty"><div><b>No receipt data</b></div></div>';
}
function renderPermanentReceipt(){
  const list=document.getElementById('receiptList');
  if(!list||receiptBusy)return;
  const html=receiptMarkup();
  if(list.dataset.v777Html===html&&list.innerHTML===html)return;
  receiptBusy=true;
  try{
    if(receiptObserver)receiptObserver.disconnect();
    list.innerHTML=html;
    list.dataset.v777Html=html;
  }finally{
    if(receiptObserver)receiptObserver.observe(list,{childList:true,subtree:true,characterData:true});
    receiptBusy=false;
  }
}
function attachReceiptObserver(){
  const list=document.getElementById('receiptList');if(!list)return;
  if(!receiptObserver)receiptObserver=new MutationObserver(()=>{if(!receiptBusy)queueMicrotask(renderPermanentReceipt)});
  receiptObserver.disconnect();
  receiptObserver.observe(list,{childList:true,subtree:true,characterData:true});
  renderPermanentReceipt();
}

/* ---------- styles ---------- */
let style=document.getElementById('v777-stability-style');
if(!style){style=document.createElement('style');style.id='v777-stability-style';document.head.appendChild(style)}
style.textContent=`
.v777-logo-box{background:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;min-height:76px!important;height:76px!important;padding:0!important;position:relative!important}
.v777-logo-wrap{position:relative!important;width:94%!important;height:70px!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#fff!important}
.v777-logo-fallback{position:absolute!important;inset:0!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#fff!important;overflow:hidden!important}
.v777-prima-word{font-family:Arial,Helvetica,sans-serif!important;font-size:34px!important;font-weight:950!important;font-style:italic!important;letter-spacing:-1px!important;color:#155f9f!important;transform:skewX(-10deg)!important}
.v777-prima-dot{position:absolute!important;width:8px!important;height:8px!important;border-radius:50%!important;top:20px!important}.v777-prima-dot.red{background:#e8372f!important;left:58%!important}.v777-prima-dot.orange{background:#ff9a21!important;left:62%!important;top:28px!important}
.v777-logo-img{position:absolute!important;inset:0!important;margin:auto!important;width:100%!important;height:70px!important;object-fit:contain!important;object-position:center!important;background:#fff!important;display:block!important;visibility:visible!important;opacity:0!important;filter:none!important;box-shadow:none!important;transform:none!important}.v777-logo-img.is-loaded{opacity:1!important}
#receiptList .v777-receipt{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:9px 10px!important}
#receiptList .v777-receipt-main{display:block!important;min-width:0!important;flex:1!important}#receiptList .v777-receipt-main b{display:block!important;color:#fff!important;font-weight:900!important}#receiptList .v777-receipt-main small{display:block!important;color:#95abc1!important;font-size:10px!important;margin-top:3px!important;white-space:normal!important;line-height:1.35!important}#receiptList .v777-receipt>strong{color:#fff!important;white-space:nowrap!important;font-weight:900!important}
`;

buildLogo();attachReceiptObserver();
[40,120,350,800,1600,2600,4200].forEach(t=>setTimeout(()=>{buildLogo();attachReceiptObserver()},t));
window.addEventListener('pageshow',()=>setTimeout(()=>{buildLogo();attachReceiptObserver()},30));
window.addEventListener('focus',()=>setTimeout(()=>{buildLogo();renderPermanentReceipt()},30));
window.addEventListener('hashchange',()=>setTimeout(()=>{buildLogo();attachReceiptObserver()},20));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>setTimeout(renderPermanentReceipt,10)));
})();
