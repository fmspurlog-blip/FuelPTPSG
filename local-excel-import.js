/* QA-only local Excel preview: intercept the legacy import before it mutates dashboard state.
 * No network, credential, localStorage or database writes. Never use this for cloud upload.
 */
(function(){
  'use strict';
  const input=document.getElementById('excelUpload');
  if(!input)return;
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
