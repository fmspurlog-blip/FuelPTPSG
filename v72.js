(()=>{
  const fmtID=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
  const dateID72=s=>{
    if(!s)return '-';
    const d=new Date(String(s).slice(0,10)+'T00:00:00');
    return Number.isNaN(d.getTime())?String(s):new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
  };
  const parseDate72=v=>{
    if(v==null||v==='')return '';
    if(typeof v==='number'){
      const p=XLSX.SSF.parse_date_code(v);
      return p?`${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`:'';
    }
    if(v instanceof Date&&!Number.isNaN(v.getTime()))return v.toISOString().slice(0,10);
    const s=String(v).trim();
    const m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if(m)return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
    const d=new Date(s);
    return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10);
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

  function normalizeUsage72(rows){
    const num=x=>(x===''||x==null)?null:Number(x);
    return rows.map((r,i)=>{
      const date=parseDate72(r.Date);
      const actual=num(r.Actual_L_per_HM_KM??r.Actual_LHM);
      const std=num(r.Standard_LHM);
      const vp=num(r.Variance_Pct);
      let st=r.Consumption_Status||r.Status||'';
      if(!st)st=std==null?'NO STANDARD':vp==null?'NO DATA':vp<=-.1?'EFFICIENT':vp<=.1?'NORMAL':vp<=.2?'WARNING':'OVER CONSUMPTION';
      return {Transaction_ID:r.Transaction_ID||`UP-${i+1}`,Date:date||'',Day:r.Day||'',Time:r.Time||'',Shift:r.Shift||'',Unit_Code:r.Unit_Code||'',Category:r.Category||'',Unit_Type:r.Unit_Type||'',Fuel_Liter:num(r.Fuel_Liter)||0,Meter_Before:num(r.Meter_Before),Meter_Current:num(r.Meter_Current),Delta_HM_KM:num(r.Delta_HM_KM),Actual_LHM:actual,Fuel_Truck:r.Fuel_Truck||'',Mtech_Code:r.Mtech_Code||'',Unit_Group_Code:r.Unit_Group_Code||'',Manpower:r.Manpower||'',Unit_Position:r.Unit_Position||'',Standard_LHM:std,Variance_LHM:num(r.Variance_LHM),Variance_Pct:vp,Consumption_Status:st,Standard_Match:r.Standard_Match||''};
    }).filter(r=>r.Date&&r.Unit_Code&&r.Fuel_Liter>0);
  }

  function normalizeReceipts72(rows){
    return rows.map(r=>({
      date:parseDate72(r.Date??r.Tanggal_Masuk??r.Tanggal),
      supplier:String(r.Supplier??r.SUPPLIER??'').trim(),
      transportir:String(r.Transporter??r.Transportir??'').trim(),
      reference:String(r.No_Surat_Jalan??r.No_SuratJalan??r.Reference??r.Surat_Jalan??'').trim(),
      qty:Number(r.Qty_Received_Liter??r.Qty_Diterima??r.Qty??r.Quantity??0)||0,
      fuelTruck:String(r.Fuel_Truck??'').trim(),
      remarks:String(r.Remarks??r.Keterangan??'').trim()
    })).filter(r=>r.date&&r.qty>0);
  }

  function recalcReceiptIntoDaily72(){
    if(typeof reconData==='undefined'||!reconData)return;
    const sums={};
    (reconData.receiptDetails||[]).forEach(r=>sums[r.date]=(sums[r.date]||0)+(Number(r.qty)||0));
    (reconData.daily||[]).forEach(r=>{
      if(Object.prototype.hasOwnProperty.call(sums,r.date)){
        r.receipt=sums[r.date];
        if(r.opening_stock!=null){
          r.book_closing=(Number(r.opening_stock)||0)+(Number(r.receipt)||0)-(Number(r.issued)||0);
          if(r.physical_closing!=null){
            r.variance_liter=(Number(r.physical_closing)||0)-r.book_closing;
            r.variance_pct=r.book_closing? r.variance_liter/r.book_closing : null;
            const a=Math.abs(r.variance_pct||0),rules=reconData.rules||{};
            r.status=a<=(rules.balance_abs_pct??0.0025)?'BALANCE':a<=(rules.watch_abs_pct??0.005)?'WATCH':'INVESTIGATE';
          }
        }
      }
    });
  }

  function installWorkbookImporter72(){
    const input=document.getElementById('excelUpload');
    if(!input||input.$v72importer)return;
    input.$v72importer=true;
    input.addEventListener('change',async e=>{
      const file=e.target.files?.[0];
      if(!file)return;
      e.stopImmediatePropagation();
      try{
        const buf=await file.arrayBuffer();
        const wb=XLSX.read(buf,{type:'array'});
        let usageCount=0,receiptCount=0;
        if(wb.SheetNames.includes('Fuel_Usage_Clean')){
          const rows=XLSX.utils.sheet_to_json(wb.Sheets['Fuel_Usage_Clean'],{defval:''});
          const clean=normalizeUsage72(rows);
          if(clean.length){state.raw=clean;usageCount=clean.length;}
        }
        if(wb.SheetNames.includes('Fuel_Receipt')){
          const rows=XLSX.utils.sheet_to_json(wb.Sheets['Fuel_Receipt'],{defval:''});
          const receipts=normalizeReceipts72(rows);
          reconData.receiptDetails=receipts;
          receiptCount=receipts.length;
          recalcReceiptIntoDaily72();
        }
        if(!usageCount&&!receiptCount)throw new Error('Tidak ada data valid pada sheet Fuel_Usage_Clean atau Fuel_Receipt.');

        if(usageCount){initFilters();}
        const dates=[
          ...(usageCount?state.raw.map(r=>r.Date):[]),
          ...(receiptCount?(reconData.receiptDetails||[]).map(r=>r.date):[])
        ].filter(Boolean).sort();
        if(dates.length){
          const from=document.getElementById('dateFrom'),to=document.getElementById('dateTo');
          if(from)from.value=dates[0];
          if(to)to.value=dates[dates.length-1];
        }
        if(typeof applyFilters==='function')applyFilters();
        if(typeof renderReceiptPage==='function')renderReceiptPage();
        if(typeof renderReconciliation==='function')renderReconciliation();
        polishCharts();
        setTimeout(renderIncomingDetail,20);
        alert(`Import Excel berhasil.\nFuel Usage: ${usageCount} baris\nFuel Receipt: ${receiptCount} baris`);
      }catch(err){
        console.error('V7.2 import error',err);
        alert('Gagal import Excel: '+err.message);
      }finally{
        e.target.value='';
      }
    },true);
  }

  function applyV72(){
    polishCharts();
    wrapReceiptRenderer();
    installWorkbookImporter72();
    if(document.getElementById('fuel-receipt')?.classList.contains('active-section'))renderIncomingDetail();
    const version=document.querySelector('.v7-version');
    if(version)version.textContent='Dashboard V7.2.2 Professional';
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