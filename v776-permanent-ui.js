(()=>{
'use strict';
const VER='77.6';
const WHITE='#ffffff';
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
const dateLong=s=>{if(!s)return'-';const d=new Date(String(s)+'T00:00:00');return Number.isNaN(d.getTime())?String(s):new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(d)};

function installLogo(){
  const box=document.querySelector('.logo-box');
  if(!box)return;
  const src=new URL('prima-logo.png',document.baseURI).href+'?v='+VER;
  box.classList.remove('v743-logo-error');
  box.style.setProperty('background','#fff','important');
  box.style.setProperty('display','flex','important');
  box.style.setProperty('align-items','center','important');
  box.style.setProperty('justify-content','center','important');
  box.style.setProperty('overflow','hidden','important');
  box.innerHTML='';
  const img=document.createElement('img');
  img.alt='PRIMA - PT Prima Sarana Gemilang';
  img.src=src;
  img.decoding='sync';
  img.loading='eager';
  img.style.cssText='display:block!important;visibility:visible!important;opacity:1!important;width:92%!important;height:70px!important;max-width:100%!important;object-fit:contain!important;object-position:center!important;filter:none!important;box-shadow:none!important;transform:none!important;background:#fff!important;';
  const fb=document.createElement('span');
  fb.textContent='PRIMA';
  fb.style.cssText='display:none;color:#1269b6;font-size:32px;font-weight:950;font-style:italic;letter-spacing:1px';
  img.onerror=()=>{img.style.display='none';fb.style.display='block'};
  box.append(img,fb);
}

function patchLegend(chartObj,type){
  if(!chartObj)return;
  const legend=((chartObj.options.plugins||(chartObj.options.plugins={})).legend||(chartObj.options.plugins.legend={}));
  legend.display=true;
  legend.position='right';
  const labels=(legend.labels||(legend.labels={}));
  labels.color=WHITE;
  labels.boxWidth=type==='truck'?9:8;
  labels.font={...(labels.font||{}),size:type==='truck'?9:8,weight:'900'};
  labels.generateLabels=c=>{
    const ds=c.data.datasets?.[0]||{};
    return (c.data.labels||[]).map((label,i)=>({
      text:`${label}  ${fmt(ds.data?.[i])} L`,
      fillStyle:Array.isArray(ds.backgroundColor)?ds.backgroundColor[i]:ds.backgroundColor,
      strokeStyle:'transparent',
      lineWidth:0,
      hidden:false,
      index:i,
      fontColor:WHITE
    }));
  };
  chartObj.update('none');
}

function enforceChartLegends(){
  try{
    if(window.Chart){
      Chart.defaults.color=WHITE;
      if(Chart.defaults.plugins?.legend?.labels)Chart.defaults.plugins.legend.labels.color=WHITE;
    }
    if(typeof state!=='undefined'&&state.charts){
      patchLegend(state.charts.truck,'truck');
      patchLegend(state.charts.status,'status');
    }
  }catch(e){console.warn('V77.6 legend patch',e)}
}

function receiptSource(){
  const direct=Array.isArray(window.__FUEL_RECEIPTS)?window.__FUEL_RECEIPTS:[];
  if(direct.length)return direct.map(r=>({
    date:r.Date||r.date||'',supplier:r.Supplier||r.supplier||'',sj:r.No_Surat_Jalan||r.No_DO||r.DO||r.no_sj||'',qty:Number(r.Qty??r.qty)||0,transporter:r.Transporter||r.transportir||'',po:r.Ref_PO||r.Reference||r.PO||r.ref_po||''
  }));
  try{return (reconData.receiptDetails||[]).map(r=>({date:r.date||r.Date||'',supplier:r.supplier||r.Supplier||'',sj:r.no_sj||r.No_Surat_Jalan||'',qty:Number(r.qty??r.Qty)||0,transporter:r.transportir||r.Transporter||'',po:r.ref_po||r.Ref_PO||r.Reference||''}))}catch(_){return []}
}

function permanentReceiptRender(){
  const list=document.getElementById('receiptList');
  if(!list)return;
  const from=document.getElementById('dateFrom')?.value||'',to=document.getElementById('dateTo')?.value||'';
  const rows=receiptSource().filter(r=>(!from||r.date>=from)&&(!to||r.date<=to)).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,10);
  list.innerHTML=rows.map(r=>`<div class="page-list-row v776-receipt"><div class="v776-receipt-main"><b>${dateLong(r.date)}</b><small>${r.supplier||'-'}${r.sj?' • SJ/DO: '+r.sj:''}${r.transporter?' • '+r.transporter:''}</small><small>Ref PO: ${r.po||'-'}</small></div><strong>${fmt(r.qty)} L</strong></div>`).join('')||'<div class="page-list-row"><div><b>No receipt data</b></div></div>';
}

try{
  if(typeof renderCharts==='function'){
    const originalRenderCharts=renderCharts;
    renderCharts=function(){originalRenderCharts();enforceChartLegends();};
  }
}catch(e){console.warn('V77.6 renderCharts hook',e)}

try{
  if(typeof renderReceiptPage==='function'){
    const originalReceipt=renderReceiptPage;
    renderReceiptPage=function(){originalReceipt();permanentReceiptRender();};
  }
}catch(e){console.warn('V77.6 receipt hook',e)}

const style=document.createElement('style');
style.id='v776-permanent-style';
style.textContent=`
.logo-box img{display:block!important;visibility:visible!important;opacity:1!important}
#receiptList .v776-receipt{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important}
#receiptList .v776-receipt-main{min-width:0!important;display:block!important}
#receiptList .v776-receipt-main b{display:block!important;color:#fff!important}
#receiptList .v776-receipt-main small{display:block!important;color:#95abc1!important;font-size:10px!important;margin-top:3px!important;white-space:normal!important}
#receiptList .v776-receipt>strong{color:#fff!important;white-space:nowrap!important;font-weight:900!important}
`;
document.head.appendChild(style);

installLogo();
setTimeout(()=>{installLogo();enforceChartLegends();permanentReceiptRender()},50);
window.addEventListener('pageshow',()=>{installLogo();enforceChartLegends();permanentReceiptRender()});
window.addEventListener('hashchange',()=>setTimeout(()=>{enforceChartLegends();permanentReceiptRender()},30));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>setTimeout(()=>{enforceChartLegends();permanentReceiptRender()},20)));
})();
