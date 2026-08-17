// V77.5 BACKEND READ PATCH
// Tambahkan file ini ke project Google Apps Script yang sama.
// Lalu di Code.gs ubah satu baris dalam readDatabase_():
//   const usage=readObjects_(...)
// menjadi readObjectsV775_(...), dan lakukan hal yang sama untuk Receipts, Stock, Recon.

function readObjectsV775_(sheet){
  if(!sheet||sheet.getLastRow()<2||sheet.getLastColumn()<1)return [];
  const range=sheet.getDataRange();
  const values=range.getValues();
  const headers=values.shift().map(String);
  return values.filter(r=>r.some(v=>v!==''&&v!==null)).map(row=>{
    const o={};
    headers.forEach((h,i)=>{
      if(!h)return;
      const v=row[i];
      if(v instanceof Date){
        if(/^time$/i.test(h)) o[h]=Utilities.formatDate(v,'Asia/Makassar','HH:mm');
        else if(/^date$/i.test(h)||/date/i.test(h)) o[h]=Utilities.formatDate(v,'Asia/Makassar','yyyy-MM-dd');
        else o[h]=Utilities.formatDate(v,'Asia/Makassar','yyyy-MM-dd HH:mm:ss');
      }else o[h]=v;
    });
    return o;
  });
}

// Replacement readDatabase_ untuk V77.5.
function readDatabaseV775_(){
  const ss=db_();
  const usage=readObjectsV775_(ss.getSheetByName(V77.SHEETS.USAGE));
  const receipts=readObjectsV775_(ss.getSheetByName(V77.SHEETS.RECEIPTS));
  const stockRaw=readObjectsV775_(ss.getSheetByName(V77.SHEETS.STOCK));
  const snapshots={};
  stockRaw.forEach(r=>{
    if(!r.Date)return;
    let fs={},ft={};
    try{fs=JSON.parse(r.FuelStorageJSON||'{}')}catch(_){ }
    try{ft=JSON.parse(r.FuelTruckJSON||'{}')}catch(_){ }
    snapshots[String(r.Date)]={time:String(r.Time||''),total:Number(r.Total)||0,fuelStorage:fs,fuelTruck:ft};
  });
  const availableDates=Object.keys(snapshots).sort();
  const daily=readObjectsV775_(ss.getSheetByName(V77.SHEETS.RECON));
  return {usage,receipts,stock:{snapshots,availableDates},recon:{daily,availableDates:daily.map(r=>r.date||r.Date).filter(Boolean).sort(),receiptDetails:receipts}};
}

// Gunakan fungsi ini pada doGet action latest:
// return json_({ok:true,version:V77.VERSION,updatedAt:getUpdatedAt_(),data:readDatabaseV775_()});
