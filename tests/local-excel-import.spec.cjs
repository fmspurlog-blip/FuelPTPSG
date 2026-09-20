/* Offline behavioral test for local Excel preview. No network or production data. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('local-excel-import.js','utf8');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function scenario({rows,readError,renderError}={}){
  let capture=null,legacy=0,alerts=[],renderCount=0,validateCount=0;
  const original=[{Date:'2026-09-01',Unit_Code:'OLD',Fuel_Liter:10}];
  const input={files:[{name:'sample.xlsx',size:100,arrayBuffer:async()=>{if(readError)throw Error('read failed');return new ArrayBuffer(1)}}],disabled:false,value:'sample.xlsx'};
  const state={raw:original};
  const document={getElementById:id=>id==='excelUpload'?input:null,addEventListener:(name,fn,useCapture)=>{assert.equal(name,'change');assert.equal(useCapture,true);capture=fn}};
  const context={document,state,window:{FUEL_SAFE_UPLOAD_CORE:{validate:()=>{validateCount++}}},XLSX:{read:()=>({SheetNames:['Fuel_Usage_Clean'],Sheets:{Fuel_Usage_Clean:{}}}),utils:{sheet_to_json:()=>rows||[{Date:'2026-09-02',Unit_Code:'NEW',Fuel_Liter:12}]},SSF:{parse_date_code:()=>({y:2026,m:9,d:2})}},normalize:r=>r,initFilters:()=>{},applyFilters:()=>{renderCount++;if(renderError&&renderCount===1)throw Error('render failed')},alert:message=>alerts.push(message),Date,Number,String,Object,Set,Error};
  vm.runInNewContext(source,context,{filename:'local-excel-import.js'});
  assert.equal(typeof capture,'function');
  let stopped=false;
  const event={target:input,stopPropagation:()=>{stopped=true}};
  const pending=capture(event);
  if(!stopped)legacy++;
  await pending;
  assert.equal(legacy,0,'legacy target handler must never execute');
  assert.equal(input.disabled,false,'input must be restored');
  assert.equal(input.value,'','file selection must be cleared');
  return {state,original,alerts,renderCount,validateCount,capture,input};
}
(async()=>{
  const good=await scenario();assert.equal(good.state.raw[0].Unit_Code,'NEW');assert.equal(good.validateCount,1);
  const invalid=await scenario({rows:[{Date:'2026-09-02',Unit_Code:'NEW',Fuel_Liter:12},{Date:'2026-09-03',Unit_Code:'',Fuel_Liter:10}]});assert.equal(invalid.state.raw,invalid.original);assert.match(invalid.alerts[0],/Kode unit kosong/);
  const duplicate=await scenario({rows:[{Date:'2026-09-02',Unit_Code:'A',Fuel_Liter:10,Transaction_ID:'DUP'},{Date:'2026-09-02',Unit_Code:'B',Fuel_Liter:10,Transaction_ID:'DUP'}]});assert.equal(duplicate.state.raw,duplicate.original);assert.match(duplicate.alerts[0],/duplikat/);
  const unreadable=await scenario({readError:true});assert.equal(unreadable.state.raw,unreadable.original);
  const failedRender=await scenario({renderError:true});assert.equal(failedRender.state.raw,failedRender.original);assert.equal(failedRender.renderCount,2,'previous dataset must be rerendered');
  console.log('PASS: local preview intercepts legacy handler, validates all rows, restores input and rolls back on failure (offline).');
})().catch(error=>{console.error(error);process.exitCode=1});
