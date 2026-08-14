(()=>{
  const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
  const getS=()=>{try{return typeof state!=='undefined'?state:null}catch(_){return null}};
  const getStock=()=>{try{return typeof stock!=='undefined'?stock:null}catch(_){return null}};
  const getRecon=()=>{try{return typeof reconData!=='undefined'?reconData:null}catch(_){return null}};
  const getStockData=()=>{try{return typeof stockData!=='undefined'?stockData:null}catch(_){return null}};
  const el=id=>document.getElementById(id);

  function setVersion(){const v=document.querySelector('.v7-version');if(v)v.textContent='Dashboard V7.2.9 Professional'}

  function syncDateSensitiveStock(){
    try{
      const sd=getStockData(),s=getStock();
      const from=el('dateFrom')?.value||'',to=el('dateTo')?.value||'';
      const dates=(sd?.availableDates||[]).filter(d=>(!from||d>=from)&&(!to||d<=to)).sort();
      const selected=dates.at(-1)||null;
      if(selected&&s){const snap=sd.snapshots?.[selected];if(snap)Object.assign(s,snap,{snapshotDate:selected,snapshotTime:snap.time||''});}
      else if(s)Object.assign(s,{fuelStorage:{},fuelTruck:{},total:0,snapshotDate:'',snapshotTime:''});
      if(typeof renderStock==='function')renderStock();
    }catch(err){console.warn('v72.9 stock date sync',err)}
  }

  function syncReconciliationRange(){
    try{
      const rd=getRecon();if(!rd)return;
      const from=el('dateFrom')?.value||'',to=el('dateTo')?.value||'';
      const rows=(rd.daily||[]).filter(r=>(!from||r.date>=from)&&(!to||r.date<=to));
      const last=rows.at(-1);if(!last)return;
      if(el('kpiReceipt'))el('kpiReceipt').textContent=fmt(last.receipt);
      if(el('kpiBookStock'))el('kpiBookStock').textContent=last.book_closing==null?'-':fmt(last.book_closing);
      if(el('kpiPhysicalStock'))el('kpiPhysicalStock').textContent=last.physical_closing==null?'-':fmt(last.physical_closing);
      if(el('kpiVariance'))el('kpiVariance').textContent=last.variance==null?'-':fmt(last.variance);
      if(el('kpiVariancePct'))el('kpiVariancePct').textContent=last.variance_pct==null?'-':`(${(Number(last.variance_pct)*100).toFixed(2)}%)`;
      if(el('kpiReconStatus'))el('kpiReconStatus').textContent=last.status||'-';
    }catch(err){console.warn('v72.9 recon sync',err)}
  }

  function compactStock(){
    const s=getStock(),total=document.querySelector('.stock-total');if(!total)return;
    total.classList.remove('v726-stock-total');total.classList.add('v727-stock-total');
    const fs=Object.values(s?.fuelStorage||{}).reduce((a,b)=>a+(Number(b)||0),0),ft=Object.values(s?.fuelTruck||{}).reduce((a,b)=>a+(Number(b)||0),0);
    const val=fs+ft||Number(s?.total)||0;if(el('stockTotal'))el('stockTotal').textContent=fmt(val);
    const label=total.querySelector(':scope > small');if(label)label.textContent='TOTAL STOCK';
  }

  function fixTruckLegend(){
    const c=getS()?.charts?.truck,wrap=el('truckChart')?.parentElement;if(!c||!wrap)return;
    let host=wrap.querySelector('.v729-truck-legend');if(!host){host=document.createElement('div');host.className='v729-truck-legend';wrap.appendChild(host)}
    wrap.classList.add('v729-chart-grid');
    const vals=c.data?.datasets?.[0]?.data||[],labels=c.data?.labels||[],colors=c.data?.datasets?.[0]?.backgroundColor||[],total=vals.reduce((a,b)=>a+(Number(b)||0),0);
    host.innerHTML=labels.map((l,i)=>`<div class="v729-truck-row"><i style="background:${Array.isArray(colors)?colors[i]:colors}"></i><span><b>${l}</b><strong>${fmt(vals[i])} L</strong><small>${total?((Number(vals[i])||0)/total*100).toFixed(2):0}%</small></span></div>`).join('');
    if(c.options?.plugins?.legend)c.options.plugins.legend.display=false;try{c.resize();c.update('none')}catch(_){ }
  }

  function stabilizeCharts(){
    const charts=getS()?.charts||{};
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      Object.values(charts).forEach(c=>{if(!c?.canvas?.isConnected)return;const sec=c.canvas.closest('.app-section');if(sec&&!sec.classList.contains('active-section'))return;try{c.resize();c.update('none')}catch(_){}});
      fixTruckLegend();
    }));
  }

  function refreshAll(){syncDateSensitiveStock();syncReconciliationRange();compactStock();stabilizeCharts()}
  setVersion();setTimeout(refreshAll,160);setTimeout(refreshAll,700);
  ['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>el(id)?.addEventListener('change',()=>setTimeout(refreshAll,130)));
  el('unitSearch')?.addEventListener('input',()=>setTimeout(refreshAll,150));
  el('resetBtn')?.addEventListener('click',()=>setTimeout(refreshAll,160));
  window.addEventListener('resize',stabilizeCharts);window.addEventListener('hashchange',()=>setTimeout(stabilizeCharts,100));
})();