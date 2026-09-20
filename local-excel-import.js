/* QA-only local Excel preview: capture change before legacy target handler.
 * No network, credentials, localStorage or database writes. Never use for cloud upload.
 */
(function(){
  'use strict';
  const input=document.getElementById('excelUpload');
  if(!input)return;
  let busy=false;
  function validISO(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
    const parsed=new Date(value+'T00:00:00Z');
    return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;
  }
  function showPreviewNotice(){
    let notice=document.getElementById('fuel-local-preview-notice');
    if(!notice){
      notice=document.createElement('div');
      notice.id='fuel-local-preview-notice';
      notice.setAttribute('role','status');
      notice.style.cssText='margin:12px 0;padding:12px 16px;border:2px solid #d97706;border-radius:8px;background:#fff7ed;color:#7c2d12;font-weight:600;line-height:1.5';
      input.parentNode.insertBefore(notice,input.nextSibling);
    }
    notice.textContent='PRATINJAU LOKAL — Data konsumsi berasal dari Excel yang baru dipilih dan tidak disimpan ke cloud. Data penerimaan, stok, dan rekonsiliasi tetap dari sumber sebelumnya; jangan gunakan kombinasi angka ini untuk penutupan stok atau laporan resmi.';
  }
  function checkRows(rows){
    const ids=new Set();
    rows.forEach((row,index)=>{
      const line=index+2;
      const date=row.Date;
      if(date==null||String(date).trim()==='')throw new Error('Tanggal kosong pada baris '+line+'.');
      if(typeof date==='number'){
        const parsed=Number.isFinite(date)&&date>=1&&date<2958466?XLSX.SSF.parse_date_code(date):null;
        const iso=parsed&&`${String(parsed.y).padStart(4,'0')}-${String(parsed.m).padStart(2,'0')}-${String(parsed.d).padStart(2,'0')}`;
        if(!iso||!validISO(iso))throw new Error('Tanggal Excel tidak valid pada baris '+line+'.');
      }else if(typeof date==='string'){
        if(!validISO(date.trim()))throw new Error('Tanggal harus berformat YYYY-MM-DD pada baris '+line+'.');
      }else throw new Error('Tipe tanggal tidak valid pada baris '+line+'.');
      if(!String(row.Unit_Code||'').trim())throw new Error('Kode unit kosong pada baris '+line+'.');
      if(row.Fuel_Liter==null||String(row.Fuel_Liter).trim()===''||!Number.isFinite(Number(row.Fuel_Liter))||Number(row.Fuel_Liter)<=0)throw new Error('Liter tidak valid pada baris '+line+'.');
      const id=String(row.Transaction_ID||'').trim();
      if(id){if(ids.has(id))throw new Error('Transaction_ID duplikat pada baris '+line+'.');ids.add(id)}
    });
  }
  document.addEventListener('change',async function(e){
    if(e.target!==input)return;
    e.stopPropagation();
    if(busy){alert('Impor Excel sebelumnya masih diproses. Tunggu hingga selesai.');return;}
    const file=input.files&&input.files[0];
    if(!file)return;
    busy=true;
    input.disabled=true;
    const previous=state.raw;
    try{
      if(!/\.(xlsx|xls)$/i.test(file.name))throw new Error('Pilih file Excel .xlsx atau .xls.');
      if(file.size>25*1024*1024)throw new Error('File terlalu besar (maksimum 25 MB).');
      const workbook=XLSX.read(await file.arrayBuffer(),{type:'array'});
      const name=workbook.SheetNames.includes('Fuel_Usage_Clean')?'Fuel_Usage_Clean':workbook.SheetNames[0];
      if(!name)throw new Error('Workbook tidak memiliki sheet.');
      const rows=XLSX.utils.sheet_to_json(workbook.Sheets[name],{defval:''});
      if(rows.length>50000)throw new Error('Terlalu banyak baris (maksimum 50.000 transaksi per impor). Pecah file Excel menjadi beberapa bagian.');
      const nonempty=rows.filter(row=>Object.values(row).some(value=>value!==''&&value!==null));
      if(!nonempty.length)throw new Error('Tidak ada transaksi untuk ditampilkan.');
      checkRows(nonempty);
      const normalized=normalize(nonempty);
      if(normalized.length!==nonempty.length)throw new Error('Ada transaksi dengan tanggal, unit, atau liter tidak valid. Tidak ada data yang diganti.');
      window.FUEL_SAFE_UPLOAD_CORE.validate({usage:normalized,receipts:[],stock:{snapshots:{},availableDates:[]}});
      state.raw=normalized;
      try{initFilters();applyFilters()}catch(renderError){
        state.raw=previous;
        try{initFilters();applyFilters()}catch(_){}
        throw renderError;
      }
      try{showPreviewNotice()}catch(_){alert('Pratinjau lokal berhasil, tetapi peringatan stok tidak dapat ditampilkan. Jangan gunakan untuk rekonsiliasi.');}
    }catch(error){alert('Impor Excel dibatalkan: '+error.message)}
    finally{input.value='';input.disabled=false;busy=false;}
  },true);
})();
