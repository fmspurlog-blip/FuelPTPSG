(()=>{
  const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);

  function getS(){try{return typeof state!=='undefined'?state:null}catch(_){return null}}
  function getStock(){try{return typeof stock!=='undefined'?stock:null}catch(_){return null}}

  function setVersion(){
    const v=document.querySelector('.v7-version');
    if(v)v.textContent='Dashboard V7.2.9 Professional';
  }

  function compactStock(){
    const s=getStock();
    const total=document.querySelector('.stock-total');
    if(!total)return;
    total.classList.remove('v726-stock-total');
    total.classList.add('v727-stock-total');
    const fs=Object.values(s?.fuelStorage||{}).reduce((a,b)=>a+(Number(b)||0),0);
    const ft=Object.values(s?.fuelTruck||{}).reduce((a,b)=>a+(Number(b)||0),0);
    const val=fs+ft || Number(s?.total)||0;
    const el=document.getElementById('stockTotal');
    if(el)el.textContent=fmt(val);
    const label=total.querySelector(':scope > small');
    if(label)label.textContent='TOTAL STOCK';
  }

  function fixTruckLegend(){
    const st=getS();
    const c=st?.charts?.truck;
    if(!c)return;
    const wrap=document.getElementById('truckChart')?.parentElement;
    if(!wrap)return;
    let host=wrap.querySelector('.v729-truck-legend');
    if(!host){
      host=document.createElement('div');
      host.className='v729-truck-legend';
      wrap.appendChild(host);
    }
    wrap.classList.add('v729-chart-grid');
    const vals=c.data?.datasets?.[0]?.data||[];
    const labels=c.data?.labels||[];
    const colors=c.data?.datasets?.[0]?.backgroundColor||[];
    const total=vals.reduce((a,b)=>a+(Number(b)||0),0);
    host.innerHTML=labels.map((l,i)=>`<div class="v729-truck-row"><i style="background:${Array.isArray(colors)?colors[i]:colors}"></i><span><b>${l}</b><strong>${fmt(vals[i])} L</strong><small>${total?((Number(vals[i])||0)/total*100).toFixed(2):0}%</small></span></div>`).join('');
    if(c.options?.plugins?.legend)c.options.plugins.legend.display=false;
    try{c.resize();c.update('none')}catch(_){ }
  }

  function stabilizeCharts(){
    const st=getS();
    if(!st?.charts)return;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      Object.values(st.charts).forEach(c=>{
        if(!c?.canvas?.isConnected)return;
        const sec=c.canvas.closest('.app-section');
        if(sec&&!sec.classList.contains('active-section'))return;
        try{c.resize();c.update('none')}catch(_){ }
      });
      fixTruckLegend();
    }));
  }

  function afterFilter(){
    compactStock();
    stabilizeCharts();
  }

  setVersion();
  setTimeout(afterFilter,120);
  setTimeout(afterFilter,500);

  ['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',()=>setTimeout(afterFilter,80));
  });
  document.getElementById('unitSearch')?.addEventListener('input',()=>setTimeout(afterFilter,100));
  document.getElementById('resetBtn')?.addEventListener('click',()=>setTimeout(afterFilter,120));
  window.addEventListener('resize',stabilizeCharts);
  window.addEventListener('hashchange',()=>setTimeout(stabilizeCharts,100));
})();