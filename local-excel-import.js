/* QA-only local Excel preview: intercept the legacy import before it mutates dashboard state.
 * No network, credential, localStorage or database writes. Never use this for cloud upload.
 */
(function(){
  'use strict';
  const input=document.getElementById('excelUpload');
  if(!input)return;
  function checkRows(rows){
    const ids=new Set();
    rows.forEach((row,index)=>{
      const line=index+2;
      const date=row.Date;
      if(date==null||String(date).trim()==='')throw new Error('Tanggal kosong pada baris '+line+'.');
      if(typeof date==='number'){
        if(!Number.isFinite(date)||!XLSX.SSF.parse_date_code(date))throw new Error('Tanggal Excel tidak valid pada baris '+line+'.');
      }else if(typeof date==='string'){
        const value=date.trim();
        if(/^\d{4}-\d{2}-\d{2}$/.test(value)){
          const parsed=new Date(value+'T00:00:00Z');
          if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==value)throw new Error('Tanggal tidak valid pada baris '+line+'.');
        }else if(!Number.isFinite(new Date(value).getTime()))throw new Error('Tanggal tidak valid pada baris '+line+'.');
      }else throw new Error('Tipe tanggal tidak valid pada baris '+line+'.');
      if(!String(row.Unit_Code||'').trim())throw new Error('Kode unit kosong pada baris '+line+'.');
      if(row.Fuel_Liter==null||String(row.Fuel_Liter).trim()===''||!Number.isFinite(Number(row.Fuel_Liter))||Number(row.Fuel_Liter)<=0)throw new Error('Liter tidak valid pada baris '+line+'.');
      const id=String(row.Transaction_ID||'').trim();
      if(id){if(ids.has(id))throw new Error('Transaction_ID duplikat pada baris '+line+'.');ids.add(id)}
    });
  }
  document.addEventListener('change',async function(e){
    if(e.target!==input)return;
    // The legacy target listener mutates state without checking rejected rows.
    e.stopPropagation();
    const file=input.files&&input.files[0];
    if(!file)return;
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
    finally{input.value=''}
  },true);
})();
