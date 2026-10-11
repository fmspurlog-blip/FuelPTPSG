/* Offline regression: Excel source row numbers survive blank-row filtering. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('local-excel-import.js','utf8');
async function run(rows){
  let handler;const alerts=[];
  const previous=[{Date:'2026-09-01',Unit_Code:'OLD',Fuel_Liter:10}];
  const state={raw:previous};
  const input={files:[{name:'qa.xlsx',size:100,arrayBuffer:async()=>new ArrayBuffer(1)}],disabled:false,value:'qa.xlsx'};
  const document={getElementById:id=>id==='excelUpload'?input:{textContent:''},addEventListener:(_,fn)=>{handler=fn}};
  const context={document,state,window:{FUEL_SAFE_UPLOAD_CORE:{validate:()=>{}}},XLSX:{read:()=>({SheetNames:['Fuel_Usage_Clean'],Sheets:{Fuel_Usage_Clean:{}}}),utils:{sheet_to_json:()=>rows}},normalize:r=>r,initFilters:()=>{},applyFilters:()=>{},alert:m=>alerts.push(m),Date,Number,String,Object,Set,Error};
  vm.runInNewContext(source,context);
  await handler({target:input,stopPropagation:()=>{}});
  assert.equal(state.raw,previous,'rejected import must preserve prior data');
  assert.equal(input.disabled,false);
  return alerts[0];
}
(async()=>{
  const blank={Date:'',Unit_Code:'',Fuel_Liter:''};
  const valid={Date:'2026-09-02',Unit_Code:'A',Fuel_Liter:10};
  const missing={Date:'2026-09-02',Unit_Code:'',Fuel_Liter:10};
  Object.defineProperty(missing,'__rowNum__',{value:17,enumerable:false});
  assert.match(await run([valid,blank,missing]),/baris 18/);
  assert.match(await run([valid,blank,{Date:'2026-09-02',Unit_Code:'',Fuel_Liter:10}]),/baris 4/);
  assert.match(await run([valid,null]),/baris 3/);
  console.log('PASS: local Excel errors retain original row numbers and reject malformed rows (offline).');
})().catch(e=>{console.error(e);process.exitCode=1});
