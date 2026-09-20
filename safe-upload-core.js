/* Isolated upload transaction core. Not wired to production. No credentials stored. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.FUEL_SAFE_UPLOAD_CORE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function validate(data){
    if(!data||!Array.isArray(data.usage)||!data.usage.length)throw new Error('Fuel Usage kosong.');
    if(!data.usage.every(r=>r&&typeof r.Date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.Date)&&String(r.Unit_Code||'').trim()&&Number.isFinite(Number(r.Fuel_Liter))&&Number(r.Fuel_Liter)>0))throw new Error('Fuel Usage mengandung baris tidak valid.');
    if(!Array.isArray(data.receipts))throw new Error('Fuel Receipt harus berupa array.');
    if(!data.stock||typeof data.stock!=='object'||!data.stock.snapshots||typeof data.stock.snapshots!=='object'||!Array.isArray(data.stock.availableDates))throw new Error('Format stock tidak valid.');
    return data;
  }
  function createUploader(deps){
    if(!deps||typeof deps.send!=='function'||typeof deps.apply!=='function'||typeof deps.getPassword!=='function')throw new TypeError('Upload dependencies incomplete.');
    let busy=false,requiresReconciliation=false;
    return async function upload(data){
      if(busy)throw new Error('Upload lain masih berjalan.');
      if(requiresReconciliation)throw new Error('Status upload sebelumnya belum dapat dipastikan. Periksa data server sebelum mencoba lagi.');
      busy=true;
      try{
        validate(data);
        const password=await deps.getPassword();
        if(typeof password!=='string'||!password)throw new Error('AUTH DIBATALKAN');
        // A rejected HTTP response confirms rejection; a thrown transport error cannot prove no server commit.
        let response;
        try{response=await deps.send({action:'replace',password,data});}
        catch(error){
          requiresReconciliation=true;
          const uncertain=new Error('Koneksi terputus atau respons tidak diterima. Status penyimpanan server belum pasti; periksa server sebelum mengunggah ulang.');
          uncertain.cause=error;uncertain.remoteOutcomeUnknown=true;throw uncertain;
        }
        if(!response||response.ok!==true||!response.updatedAt)throw new Error(response&&response.error?String(response.error):'Server tidak mengonfirmasi upload.');
        // A server-confirmed commit must not be repeated even if applying it locally fails.
        requiresReconciliation=true;
        let applied=false;
        try{applied=await deps.apply(data,response)}catch(error){
          const failure=new Error('Server mengonfirmasi upload, tetapi dashboard gagal memperbarui data. Muat ulang data dari server; jangan unggah ulang sebelum memeriksa status.');
          failure.cause=error;failure.remoteCommitted=true;throw failure;
        }
        if(applied===false){const failure=new Error('Server mengonfirmasi upload, tetapi dashboard menolak data. Muat ulang dari server.');failure.remoteCommitted=true;throw failure;}
        // Successful upload is complete; subsequent intentional uploads are allowed.
        requiresReconciliation=false;
        return response;
      }finally{busy=false;}
    };
  }
  return Object.freeze({validate,createUploader});
});
