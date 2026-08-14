(()=>{
  const fmt726=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);

  function setHeaderAndTrendTitle(){
    const sub=document.querySelector('.hero p');
    if(sub)sub.textContent='PT PRIMA SARANA GEMILANG SITE ABM';
    const trend=document.querySelector('.trend-panel .title h3');
    if(trend)trend.innerHTML='Daily Fuel Consumption <small>(Total/Liter)</small>';
    const version=document.querySelector('.v7-version');
    if(version)version.textContent='Dashboard V7.2.6 Professional';
  }

  function moveStockTotal(){
    const total=document.querySelector('.stock-panel .stock-total');
    const truckList=document.getElementById('truckStockList');
    const truckCol=truckList?.parentElement;
    if(!total||!truckCol)return;
    total.classList.add('v726-stock-total');
    if(total.parentElement!==truckCol)truckCol.appendChild(total);
  }

  function polishCharts726(){
    try{
      const charts=(typeof state!=='undefined'&&state&&state.charts)?state.charts:{};
      const daily=charts.daily;
      if(daily){
        daily.options.plugins=daily.options.plugins||{};
        daily.options.plugins.legend=daily.options.plugins.legend||{};
        daily.options.plugins.legend.display=false;
        daily.options.layout={padding:{top:20,right:6,bottom:2,left:2}};
        daily.update('none');
      }

      const cat=charts.cat;
      if(cat){
        cat.options.layout={padding:{top:1,right:92,bottom:1,left:0}};
        cat.options.plugins=cat.options.plugins||{};
        if(cat.options.plugins.datalabels){
          cat.options.plugins.datalabels.anchor='end';
          cat.options.plugins.datalabels.align='right';
          cat.options.plugins.datalabels.clamp=false;
          cat.options.plugins.datalabels.clip=false;
          cat.options.plugins.datalabels.offset=5;
          cat.options.plugins.datalabels.font={size:8.4,weight:'bold'};
          cat.options.plugins.datalabels.color='#d8e6f4';
        }
        cat.update('none');
      }

      const shift=charts.shift;
      if(shift){
        shift.options.cutout='67%';
        shift.options.layout={padding:{top:2,right:2,bottom:2,left:2}};
        shift.update('none');
      }

      ['truck','status'].forEach(name=>{
        const c=charts[name];
        if(!c)return;
        c.options.layout={padding:{top:1,right:1,bottom:1,left:1}};
        c.update('none');
        if(typeof buildHtmlLegend==='function')buildHtmlLegend(name,c);
      });
    }catch(err){console.warn('V7.2.6 chart polish skipped',err);}
  }

  function joinUnitTypeValues(){
    const pairs=[
      ['productionFuel','productionPct'],
      ['supportFuel','supportPct']
    ];
    pairs.forEach(([valueId,pctId])=>{
      const value=document.getElementById(valueId);
      if(!value)return;
      const unit=value.nextElementSibling;
      if(unit&&unit.tagName==='SPAN')unit.textContent='Liter';
      const pct=document.getElementById(pctId);
      if(pct)pct.style.display='block';
    });
  }

  function installPrintCard(){
    const reports=document.getElementById('reports');
    if(!reports)return;
    const reconBtn=reports.querySelector('[data-report="recon"]');
    const card=reconBtn?.closest('.report-card');
    if(card){
      card.classList.add('v726-print-card');
      card.innerHTML='<h3>Print Dashboard</h3><p>Export tampilan dashboard penuh untuk print A4 landscape.</p><button id="printDashboardBtn" type="button">PRINT DASHBOARD A4</button>';
    }
    const old=document.getElementById('downloadReconCsv');
    if(old)old.style.display='none';

    const btn=document.getElementById('printDashboardBtn');
    if(btn&&!btn.$v726){
      btn.$v726=true;
      btn.addEventListener('click',()=>{
        const previousHash=location.hash;
        const dashboardLink=document.querySelector('.nav-link[data-section="dashboard"]');
        if(dashboardLink)dashboardLink.click();
        else location.hash='#dashboard';
        setTimeout(()=>{
          document.body.classList.add('print-dashboard');
          const cleanup=()=>{
            document.body.classList.remove('print-dashboard');
            window.removeEventListener('afterprint',cleanup);
            if(previousHash&&previousHash!=='#dashboard')location.hash=previousHash;
          };
          window.addEventListener('afterprint',cleanup);
          window.print();
          setTimeout(()=>document.body.classList.remove('print-dashboard'),1500);
        },180);
      });
    }
  }

  function makeTruckLegendStronger(){
    const host=document.querySelector('.v72-truck-legend');
    if(!host)return;
    host.querySelectorAll('.v72-legend-row span').forEach(span=>{
      const t=(span.textContent||'').trim();
      span.textContent=t.replace(/\s{2,}/g,'  ');
    });
  }

  function apply726(){
    setHeaderAndTrendTitle();
    moveStockTotal();
    joinUnitTypeValues();
    installPrintCard();
    polishCharts726();
    makeTruckLegendStronger();
  }

  apply726();
  [250,650,1200,2000].forEach(ms=>setTimeout(apply726,ms));
  ['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',()=>setTimeout(apply726,100));
  });
  document.getElementById('unitSearch')?.addEventListener('input',()=>setTimeout(apply726,100));
  window.addEventListener('hashchange',()=>setTimeout(apply726,80));
})();
