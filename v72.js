(()=>{
  const fmtID=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
  const dateID72=s=>{
    if(!s)return '-';
    const d=new Date(String(s).slice(0,10)+'T00:00:00');
    return Number.isNaN(d.getTime())?String(s):new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
  };

  function polishCharts(){
    try{
      const charts=(window.state&&window.state.charts)?window.state.charts:{};
      ['truck','status'].forEach(name=>{
        const c=charts[name];
        if(!c||!c.options||!c.options.plugins||!c.options.plugins.legend)return;
        const labels=c.options.plugins.legend.labels||(c.options.plugins.legend.labels={});
        labels.color='#ffffff';
        labels.font={size:name==='status'?8.5:9.5,weight:'800'};
        labels.padding=12;
        labels.boxWidth=9;
        labels.usePointStyle=false;
        c.options.plugins.legend.position='right';
        c.options.plugins.legend.align='center';
        c.update('none');
      });

      const shift=charts.shift;
      if(shift){
        shift.options.layout={padding:{top:5,right:4,bottom:5,left:4}};
        shift.options.cutout='67%';
        shift.resize();
        shift.update('none');
      }
    }catch(err){console.warn('V7.2 chart polish skipped',err);}
  }

  function receiptRows(){
    const source=(window.reconData&&Array.isArray(window.reconData.receiptDetails))
      ? window.reconData.receiptDetails
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
      ${rows.length?`<table class="receipt-detail-table">
        <thead><tr><th>TANGGAL MASUK</th><th>SUPPLIER</th><th>NO. SURAT JALAN</th><th>QTY DITERIMA</th></tr></thead>
        <tbody>${rows.map(r=>`<tr>
          <td>${dateID72(r.date)}</td>
          <td>${r.supplier||r.transportir||'-'}</td>
          <td>${r.reference||r.suratJalan||r.noSuratJalan||'-'}</td>
          <td>${fmtID(r.qty)} L</td>
        </tr>`).join('')}</tbody>
      </table>`:`<div class="receipt-empty">Belum ada data fuel incoming pada periode yang dipilih.</div>`}
    </div>`;
  }

  function wrapReceiptRenderer(){
    if(typeof window.renderReceiptPage==='function'&&!window.renderReceiptPage.$v72wrapped){
      const original=window.renderReceiptPage;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        setTimeout(renderIncomingDetail,0);
        return result;
      };
      wrapped.$v72wrapped=true;
      window.renderReceiptPage=wrapped;
    }
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
  setTimeout(applyV72,1000);
  setTimeout(applyV72,1800);

  ['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',()=>setTimeout(()=>{polishCharts();if(document.getElementById('fuel-receipt')?.classList.contains('active-section'))renderIncomingDetail();},40));
  });
  document.getElementById('unitSearch')?.addEventListener('input',()=>setTimeout(polishCharts,40));
})();
