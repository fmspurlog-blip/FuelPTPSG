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
    // Capture phase blocks the unvalidated legacy handler on the input itself.
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
      const nonempty=rows.filter(row=>Object.values(row).some(value=>value!==''&&value!==null));
      if(!nonempty.length)throw new Error('Tidak ada transaksi untuk ditampilkan.');
      checkRows(nonempty);
      const normalized=normalize(nonempty);
      if(normalized.length!==nonempty.length)throw new Error('Ada transaksi dengan tanggal, unit, atau liter tidak valid. Tidak ada data yang diganti.');
      window.FUEL_SAFE_UPLOAD_CORE.validate({usage:normalized,receipts:[],stock:{snapshots:{},availableDates:[]}});
      // Preview only. Never call the remote uploader or persist this dataset.
      state.raw=normalized;
      try{initFilters();applyFilters()}catch(renderError){
        state.raw=previous;
        try{initFilters();applyFilters()}catch(_){}
        throw renderError;
      }
    }catch(error){alert('Impor Excel dibatalkan: '+error.message)}
    finally{input.value='';input.disabled=false;busy=false;}
  },true);
})();
