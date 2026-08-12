(()=>{
  const fmtID=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
  const dateID72=s=>{
    if(!s)return '-';
    const d=new Date(String(s).slice(0,10)+'T00:00:00');
    return Number.isNaN(d.getTime())?String(s):new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
  };

  function legendText(name,label,value,total){
    if(name==='truck') return `${label}  ${fmtID(value)} L`;
    const pct=total?((Number(value||0)/total)*100).toFixed(2):'0.00';
    return `${label}  ${fmtID(value)} L  (${pct}%)`;
  }

  function buildHtmlLegend(name,c){
    const canvas=c?.canvas;
    const chartWrap=canvas?.parentElement;
    if(!chartWrap)return;
    chartWrap.classList.add('v72-chart-with-legend');
    let host=chartWrap.querySelector(`.v72-${name}-legend`);
    if(!host){
      host=document.createElement('div');
      host.className=`v72-html-legend v72-${name}-legend`;
      chartWrap.appendChild(host);
    }
    const labels=c.data?.labels||[];
    const ds=c.data?.datasets?.[0]||{};
    const values=ds.data||[];
    const colors=Array.isArray(ds.backgroundColor)?ds.backgroundColor:[];
    const total=values.reduce((a,b)=>a+(Number(b)||0),0);
    host.innerHTML=labels.map((label,i)=>`<div class="v72-legend-row"><i style="background:${colors[i]||'#fff'}"></i><span>${legendText(name,label,values[i],total)}</span></div>`).join('');
  }

  function polishCharts(){
    try{
      const charts=(typeof state!=='undefined'&&state&&state.charts)?state.charts:{};
      ['truck','status'].forEach(name=>{
        const c=charts[name];
        if(!c)return;
        if(c.options?.plugins?.legend)c.options.plugins.legend.display=false;
        c.options.layout={padding:{top:2,right:2,bottom:2,left:2}};
        c.resize();
        c.update('none');
        buildHtmlLegend(name,c);
      });

      const shift=charts.shift;
      if(shift){
        shift.options.layout={padding:{top:8,right:8,bottom:8,left:8}};
        shift.options.cutout='68%';
        shift.resize();
        shift.update('none');
      }
    }catch(err){console.warn('V7.2 chart polish skipped',err);}
  }

  function receiptRows(){
    const source=(typeof reconData!=='undefined'&&reconData&&Array.isArray(reconData.receiptDetails))
      ? reconData.receiptDetails
      : ((window.RECON_DATA&&Array.isArray(window.RECON_DATA.receiptDetails))?window.RECON_DATA.receiptDetails:[]);
    const from=document.getElementById('dateFrom')?.value||'';
    const to=document.getElementById('dateTo')?.value||'';
    return source.filter(r=>(!from||r.date>=from)&&(!to||r.date<=to))
      .slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  }

  function renderIncomingDetail(){
    const host=document.getElementById('receiptList');
    if(!host)return;
    const rows=receiptRows();
    host.classList.remove('page-list');
    host.innerHTML=`<div class="receipt-detail-wrap">
      <table class="receipt-detail-table">
        <thead><tr><th>TANGGAL MASUK</th><th>SUPPLIER</th><th>NO. SURAT JALAN</th><th>QTY DITERIMA</th></tr></thead>
        <tbody>${rows.length?rows.map(r=>`<tr>
          <td>${dateID72(r.date)}</td>
          <td>${r.supplier||r.transportir||'-'}</td>
          <td>${r.reference||r.suratJalan||r.noSuratJalan||'-'}</td>
          <td>${fmtID(r.qty)} L</td>
        </tr>`).join(''):`<tr class="receipt-empty-row"><td colspan="4">Belum ada data fuel incoming pada periode yang dipilih.</td></tr>`}</tbody>
      </table>
    </div>`;
  }

  function wrapReceiptRenderer(){
    try{
      if(typeof renderReceiptPage==='function'&&!renderReceiptPage.$v72wrapped){
        const original=renderReceiptPage;
        const wrapped=function(){
          const result=original.apply(this,arguments);
          setTimeout(renderIncomingDetail,0);
          return result;
        };
        wrapped.$v72wrapped=true;
        renderReceiptPage=wrapped;
      }
    }catch(err){console.warn('V7.2 receipt wrapper skipped',err);}
  }

  function applyV72(){
    polishCharts();
    wrapReceiptRenderer();
    if(document.getElementById('fuel-receipt')?.classList.contains('active-section'))renderIncomingDetail();
    const version=document.querySelector('.v7-version');
    if(version)version.textContent='Dashboard V7.2 Professional';
  }

  applyV72();
  setTimeout(applyV72,350);
  setTimeout(applyV72,900);
  setTimeout(applyV72,1600);

  ['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',()=>setTimeout(()=>{
      polishCharts();
      if(document.getElementById('fuel-receipt')?.classList.contains('active-section'))renderIncomingDetail();
    },60));
  });
  document.getElementById('unitSearch')?.addEventListener('input',()=>setTimeout(polishCharts,60));
})();