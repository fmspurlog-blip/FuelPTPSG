const V77 = {
  VERSION: '77.0',
  DB_PROPERTY: 'FUEL_V77_SPREADSHEET_ID',
  // Password yang sama dengan tombol Upload dashboard. Simpan hanya HASH, bukan password asli.
  PASSWORD_SHA256: '36a2b763aff10cf6d612a3eb981f83c3ed96946ac04fe1a0daab9b4cdf0fa07d',
  SHEETS: { META:'Meta', USAGE:'Usage', RECEIPTS:'Receipts', STOCK:'Stock', RECON:'Recon' }
};

function setupDatabase(){
  const props=PropertiesService.getScriptProperties();
  let id=props.getProperty(V77.DB_PROPERTY);
  let ss;
  if(id){
    try{ ss=SpreadsheetApp.openById(id); }catch(_){ id=''; }
  }
  if(!id){
    ss=SpreadsheetApp.create('Fuel Management System V77 - Permanent Database');
    id=ss.getId();
    props.setProperty(V77.DB_PROPERTY,id);
  }
  Object.values(V77.SHEETS).forEach(name=>ensureSheet_(ss,name));
  const meta=ss.getSheetByName(V77.SHEETS.META);
  if(meta.getLastRow()===0){
    meta.getRange(1,1,1,4).setValues([['Key','Value','UpdatedAt','Version']]);
    meta.getRange(2,1,1,4).setValues([['database','READY',new Date(),V77.VERSION]]);
  }
  Logger.log('Database ID: '+id);
  Logger.log('Database URL: '+ss.getUrl());
  return {id:id,url:ss.getUrl(),version:V77.VERSION};
}

function doGet(e){
  try{
    const action=String((e&&e.parameter&&e.parameter.action)||'latest').toLowerCase();
    if(action==='health')return json_({ok:true,version:V77.VERSION,updatedAt:getUpdatedAt_()});
    if(action!=='latest')return json_({ok:false,error:'Unknown action'});
    return json_({ok:true,version:V77.VERSION,updatedAt:getUpdatedAt_(),data:readDatabase_()});
  }catch(err){
    return json_({ok:false,error:String(err&&err.message||err),version:V77.VERSION});
  }
}

function doPost(e){
  const lock=LockService.getScriptLock();
  try{
    lock.waitLock(30000);
    const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    if(String(body.action||'').toLowerCase()!=='replace')throw new Error('Unknown action');
    if(!validPassword_(String(body.password||'')))throw new Error('Unauthorized upload');
    if(!body.data||!Array.isArray(body.data.usage)||!body.data.usage.length)throw new Error('Fuel Usage kosong');
    writeDatabase_(body.data);
    const stamp=new Date().toISOString();
    setUpdatedAt_(stamp);
    return json_({ok:true,version:V77.VERSION,updatedAt:stamp,rows:{usage:body.data.usage.length,receipts:(body.data.receipts||[]).length,stock:Object.keys(body.data.stock&&body.data.stock.snapshots||{}).length}});
  }catch(err){
    return json_({ok:false,error:String(err&&err.message||err),version:V77.VERSION});
  }finally{
    try{lock.releaseLock();}catch(_){ }
  }
}

function writeDatabase_(data){
  const ss=db_();
  writeObjects_(ss.getSheetByName(V77.SHEETS.USAGE),data.usage||[]);
  writeObjects_(ss.getSheetByName(V77.SHEETS.RECEIPTS),data.receipts||[]);

  const stockRows=[];
  const stock=data.stock||{};
  Object.keys(stock.snapshots||{}).sort().forEach(date=>{
    const s=stock.snapshots[date]||{};
    stockRows.push({Date:date,Time:s.time||'',Total:Number(s.total)||0,FuelStorageJSON:JSON.stringify(s.fuelStorage||{}),FuelTruckJSON:JSON.stringify(s.fuelTruck||{})});
  });
  writeObjects_(ss.getSheetByName(V77.SHEETS.STOCK),stockRows);

  const reconRows=(data.recon&&Array.isArray(data.recon.daily))?data.recon.daily:[];
  writeObjects_(ss.getSheetByName(V77.SHEETS.RECON),reconRows);
  SpreadsheetApp.flush();
}

function readDatabase_(){
  const ss=db_();
  const usage=readObjects_(ss.getSheetByName(V77.SHEETS.USAGE));
  const receipts=readObjects_(ss.getSheetByName(V77.SHEETS.RECEIPTS));
  const stockRaw=readObjects_(ss.getSheetByName(V77.SHEETS.STOCK));
  const snapshots={};
  stockRaw.forEach(r=>{
    if(!r.Date)return;
    let fs={},ft={};
    try{fs=JSON.parse(r.FuelStorageJSON||'{}')}catch(_){ }
    try{ft=JSON.parse(r.FuelTruckJSON||'{}')}catch(_){ }
    snapshots[String(r.Date)]={time:String(r.Time||''),total:Number(r.Total)||0,fuelStorage:fs,fuelTruck:ft};
  });
  const availableDates=Object.keys(snapshots).sort();
  const daily=readObjects_(ss.getSheetByName(V77.SHEETS.RECON));
  return {usage:usage,receipts:receipts,stock:{snapshots:snapshots,availableDates:availableDates},recon:{daily:daily,availableDates:daily.map(r=>r.date||r.Date).filter(Boolean).sort(),receiptDetails:receipts}};
}

function writeObjects_(sheet,rows){
  sheet.clearContents();
  if(!rows||!rows.length)return;
  const preferred=['Transaction_ID','Date','Day','Time','Shift','Unit_Code','Category','Unit_Type','Fuel_Liter','Meter_Before','Meter_Current','Delta_HM_KM','Actual_LHM','Fuel_Truck','Mtech_Code','Unit_Group_Code','Manpower','Unit_Position','Standard_LHM','Variance_LHM','Variance_Pct','Consumption_Status','Standard_Match'];
  const found={};rows.forEach(r=>Object.keys(r||{}).forEach(k=>found[k]=true));
  const headers=[...preferred.filter(k=>found[k]),...Object.keys(found).filter(k=>!preferred.includes(k)).sort()];
  const values=[headers];
  rows.forEach(r=>values.push(headers.map(h=>cellValue_(r[h]))));
  sheet.getRange(1,1,values.length,headers.length).setValues(values);
  sheet.setFrozenRows(1);
}

function readObjects_(sheet){
  if(!sheet||sheet.getLastRow()<2||sheet.getLastColumn()<1)return [];
  const values=sheet.getDataRange().getValues();
  const headers=values.shift().map(String);
  return values.filter(r=>r.some(v=>v!==''&&v!==null)).map(row=>{
    const o={};headers.forEach((h,i)=>{if(h)o[h]=jsonCell_(row[i]);});return o;
  });
}

function cellValue_(v){
  if(v===undefined||v===null)return '';
  if(typeof v==='object')return JSON.stringify(v);
  return v;
}
function jsonCell_(v){
  if(v instanceof Date)return Utilities.formatDate(v,'GMT','yyyy-MM-dd');
  return v;
}
function db_(){
  const id=PropertiesService.getScriptProperties().getProperty(V77.DB_PROPERTY);
  if(!id)throw new Error('Database belum dibuat. Jalankan setupDatabase() satu kali.');
  return SpreadsheetApp.openById(id);
}
function ensureSheet_(ss,name){return ss.getSheetByName(name)||ss.insertSheet(name)}
function validPassword_(s){return sha256_(s)===V77.PASSWORD_SHA256}
function sha256_(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('')}
function setUpdatedAt_(stamp){
  const sh=db_().getSheetByName(V77.SHEETS.META);sh.clearContents();sh.getRange(1,1,2,4).setValues([['Key','Value','UpdatedAt','Version'],['database','READY',stamp,V77.VERSION]]);
}
function getUpdatedAt_(){
  try{const sh=db_().getSheetByName(V77.SHEETS.META);if(sh.getLastRow()<2)return '';const v=sh.getRange(2,3).getValue();return v instanceof Date?v.toISOString():String(v||'')}catch(_){return ''}
}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
