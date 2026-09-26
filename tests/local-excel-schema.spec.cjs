/* Offline QA: malformed Excel schemas must preserve the previous dashboard dataset. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('local-excel-import.js','utf8');
async function scenario(rows){
  let change,validations=0,renders=0;
  const previous=[{Date:'2026-09-01',Unit_Code:'OLD',Fuel_Liter:7}];
  const state={raw:previous},alerts=[];
  const notice={textContent:'',setAttribute(){},style:{}};
  const input={files:[{name:'schema.xlsx',size:100,arrayBuffer:async()=>new ArrayBuffer(1)}],value:'schema.xlsx',disabled:false};
  const document={getElementById:id=>id==='excelUpload'?input:notice,addEventListener:(type,handler,capture)=>{assert.equal(type,'change');assert.equal(capture,true);change=handler}};
  vm.runInNewContext(source,{document,state,window:{FUEL_SAFE_UPLOAD_CORE:{validate:()=>{validations++}}},XLSX:{read:()=>({SheetNames:['Fuel_Usage_Clean'],Sheets:{Fuel_Usage_Clean:{}}}),utils:{sheet_to_json:()=>rows}},normalize:value=>value,initFilters(){},applyFilters(){renders++},alert:message=>alerts.push(message),Date,Number,String,Object,Set,Error});
  let stopped=false;
  await change({target:input,stopPropagation(){stopped=true}});
  assert.equal(stopped,true);assert.equal(input.disabled,false);assert.equal(input.value,'');
  return {state,previous,alerts,validations,renders,notice};
}
async function rejected(rows,message){
  const result=await scenario(rows);
  assert.equal(result.state.raw,result.previous,'invalid Excel must preserve the exact original array');
  assert.equal(result.validations,0);assert.equal(result.renders,0);
  assert.equal(result.notice.textContent,'');assert.match(result.alerts[0],message);
}
(async()=>{
  const good={Date:'2026-09-02',Unit_Code:'NEW',Fuel_Liter:12};
  for(const column of ['Date','Unit_Code','Fuel_Liter']){
    const row={...good};delete row[column];
    await rejected([row],new RegExp('Kolom wajib tidak ditemukan: '+column));
  }
  for(const [wrong,correct] of [['date','Date'],['unit_code','Unit_Code'],['Fuel_LITer','Fuel_Liter'],['Date ','Date']]){
    const row={...good};row[wrong]=row[correct];delete row[correct];
    await rejected([row],new RegExp('Kolom wajib tidak ditemukan: '+correct));
  }
  for(const value of [null,'corrupt',[],42]){
    await rejected([good,value],/Struktur transaksi tidak valid pada baris 3/);
  }
  for(const value of [null,{},'corrupt'])await rejected(value,/Format data transaksi Excel tidak valid/);
  for(const value of [[],[{}]])await rejected(value,/Tidak ada transaksi/);
  for(const column of ['Date','Unit_Code','Fuel_Liter']){
    const row={...good,[column]:''};
    await rejected([good,row],column==='Date'?/Tanggal kosong/:column==='Unit_Code'?/Kode unit kosong/:/Liter tidak valid/);
  }
  const accepted=await scenario([{},good]);
  assert.equal(accepted.state.raw[0].Unit_Code,'NEW');assert.equal(accepted.validations,1);assert.equal(accepted.renders,1);
  assert.match(accepted.notice.textContent,/PRATINJAU LOKAL/);
  console.log('PASS: Excel required headers, malformed rows, non-array payloads, empty sheets and later missing values preserve previous data; blank rows may be skipped.');
})().catch(error=>{console.error(error);process.exitCode=1});
