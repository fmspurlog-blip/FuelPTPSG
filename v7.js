(()=>{
  const LOGO='data:image/jpeg;base64,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';

  const once=()=>{
    const logo=document.querySelector('.logo-box img');
    if(logo){logo.src=LOGO;logo.alt='PRIMA - PT Prima Sarana Gemilang';}

    document.querySelectorAll('#shiftLegend .shift-item small').forEach(x=>{
      const t=x.textContent.toUpperCase();
      if(t.includes('NIGHT')) x.textContent='NIGHT SHIFT';
      else if(t.includes('DAY')) x.textContent='DAY SHIFT';
    });

    const e=document.getElementById('kpiReconStatus');
    if(e){
      e.classList.remove('is-balance','is-watch','is-investigate');
      const t=e.textContent.trim().toUpperCase();
      if(t==='BALANCE')e.classList.add('is-balance');
      else if(t==='WATCH')e.classList.add('is-watch');
      else if(t==='INVESTIGATE')e.classList.add('is-investigate');
    }

    const side=document.querySelector('.side-card');
    if(side && !side.querySelector('.v7-version')){
      const v=document.createElement('div');v.className='v7-version';v.textContent='Dashboard V7 Professional';side.appendChild(v);
    }

    try{
      const charts=window.state?.charts||{};
      Object.entries(charts).forEach(([name,c])=>{
        if(!c || c.$v7done)return;
        c.$v7done=true;
        if(c.options?.plugins?.legend?.labels){
          c.options.plugins.legend.labels.color='#a9bfd5';
          c.options.plugins.legend.labels.font={size:9,weight:'600'};
          c.options.plugins.legend.labels.usePointStyle=true;
          c.options.plugins.legend.labels.pointStyle='circle';
        }
        if(name==='daily'){
          c.options.layout={padding:{top:24,left:4,right:6,bottom:0}};
          if(c.options.plugins.datalabels){
            c.options.plugins.datalabels.color='#f7fbff';
            c.options.plugins.datalabels.font={size:8,weight:'800'};
            c.options.plugins.datalabels.formatter=(v,ctx)=>{
              const count=ctx.chart.data.labels.length;
              return count>20 && ctx.dataIndex%2===1 ? '' : new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
            };
          }
          if(c.options.scales?.x?.ticks)c.options.scales.x.ticks.maxTicksLimit=11;
        }
        if(name==='shift')c.data.datasets.forEach(ds=>ds.borderWidth=3);
        if(name==='truck'||name==='status'){if(c.options.plugins.legend)c.options.plugins.legend.position='right';}
        c.update('none');
      });
    }catch(err){console.warn('V7 one-time polish skipped',err);}
  };

  // Run only a few times during initial render; NO MutationObserver, NO interval loop.
  requestAnimationFrame(once);
  setTimeout(once,350);
  setTimeout(once,900);
})();