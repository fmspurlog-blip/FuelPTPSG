/* Offline behavioral regression for local Excel preview. No network or production data. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('local-excel-import.js','utf8');
async function scenario({rows,readError,renderError,parseDate}={}){
  let capture=null,legacy=0,alerts=[],renderCount=0,validateCount=0;
  const original=[{Date:'2026-09-01',Unit_Code:'OLD',Fuel_Liter:10}];
  const input={files:[{name:'sample.xlsx',size:100,arrayBuffer:async()=>{if(readError)throw Error('read failed');return new ArrayBuffer(1)}}],disabled:false,value:'sample.xlsx'};
  const state={raw:original};
  const document={getElementById:id=>id==='excelUpload'?input:null,addEventListener:(name,fn,useCapture)=>{assert.equal(name,'change');assert.equal(useCapture,true);capture=fn}};
  const context={document,state,window:{FUEL_SAFE_UPLOAD_CORE:{validate:()=>{validateCount++}}},XLSX:{read:()=>({SheetNames:['Fuel_Usage_Clean'],Sheets:{Fuel_Usage_Clean:{}}}),utils:{sheet_to_json:()=>rows||[{Date:'2026-09-02',Unit_Code:'NEW',Fuel_Liter:12}]},SSF:{parse_date_code:parseDate||(()=>({y:2026,m:9,d:2}))}},normalize:r=>r,initFilters:()=>{},applyFilters:()=>{renderCount++;if(renderError&&renderCount===1)throw Error('render failed')},alert:message=>alerts.push(message),Date,Number,String,Object,Set,Error};
  vm.runInNewContext(source,context,{filename:'local-excel-import.js'});
  assert.equal(typeof capture,'function');
  let stopped=false;
  const event={target:input,stopPropagation:()=>{stopped=true}};
  await capture(event);
  if(!stopped)legacy++;
  assert.equal(legacy,0,'legacy target handler must never execute');
  assert.equal(input.disabled,false,'input must be restored');
  assert.equal(input.value,'','file selection must be cleared');
  return {state,original,alerts,renderCount,validateCount,capture,input};
}
async function overlappingImports(){
  let capture,release;
  const gate=new Promise(resolve=>{release=resolve});
  const input={files:[{name:'sample.xlsx',size:100,arrayBuffer:()=>gate.then(()=>new ArrayBuffer(1))}],disabled:false,value:'sample.xlsx'};
  const state={raw:[{Unit_Code:'OLD'}]};
  let readCount=0,applyCount=0,alerts=[];
  const context={document:{getElementById:()=>input,addEventListener:(name,fn,capturePhase)=>{assert.equal(capturePhase,true);capture=fn}},state,window:{FUEL_SAFE_UPLOAD_CORE:{validate:()=>{}}},XLSX:{read:()=>{readCount++;return{SheetNames:['Fuel_Usage_Clean'],Sheets:{Fuel_Usage_Clean:{}}}},utils:{sheet_to_json:()=>[{Date:'2026-09-02',Unit_Code:'NEW',Fuel_Liter:12}]}},normalize:r=>r,initFilters:()=>{},applyFilters:()=>{applyCount++},alert:m=>alerts.push(m),Date,Number,String,Object,Set,Error};
  vm.runInNewContext(source,context);
  let stops=0;
  const event={target:input,stopPropagation:()=>{stops++}};
  const first=capture(event);
  assert.equal(input.disabled,true,'input must be locked while reading');
  const second=capture(event);
  await second;
  assert.equal(readCount,0,'second import must not start while first reads');
  assert.match(alerts[0],/masih diproses/);
  release();await first;
  assert.equal(stops,2,'both events must block the legacy handler');
  assert.equal(readCount,1);
  assert.equal(applyCount,1);
  assert.equal(state.raw[0].Unit_Code,'NEW');
  assert.equal(input.disabled,false);
}
(async()=>{
  const good=await scenario();assert.equal(good.state.raw[0].Unit_Code,'NEW');assert.equal(good.validateCount,1);
  const invalid=await scenario({rows:[{Date:'2026-09-02',Unit_Code:'NEW',Fuel_Liter:12},{Date:'2026-09-03',Unit_Code:'',Fuel_Liter:10}]});assert.equal(invalid.state.raw,invalid.original);assert.match(invalid.alerts[0],/Kode unit kosong/);
  const duplicate=await scenario({rows:[{Date:'2026-09-02',Unit_Code:'A',Fuel_Liter:10,Transaction_ID:'DUP'},{Date:'2026-09-02',Unit_Code:'B',Fuel_Liter:10,Transaction_ID:'DUP'}]});assert.equal(duplicate.state.raw,duplicate.original);assert.match(duplicate.alerts[0],/duplikat/);
  const unreadable=await scenario({readError:true});assert.equal(unreadable.state.raw,unreadable.original);
  const failedRender=await scenario({renderError:true});assert.equal(failedRender.state.raw,failedRender.original);assert.equal(failedRender.renderCount,2,'previous dataset must be rerendered');
  for(const date of ['2026-02-30','2026-13-01','20/09/2026','2026-09-20T12:00:00','']){
    const result=await scenario({rows:[{Date:date,Unit_Code:'A',Fuel_Liter:10}]});
    assert.equal(result.state.raw,result.original,'invalid date must not replace dataset: '+date);
    assert.match(result.alerts[0],/Tanggal/);
  }
  for(const date of [-1,0,2958466,Infinity,NaN]){
    const result=await scenario({rows:[{Date:date,Unit_Code:'A',Fuel_Liter:10}]});
    assert.equal(result.state.raw,result.original,'invalid serial must not replace dataset: '+date);
  }
  const impossible=await scenario({rows:[{Date:46000,Unit_Code:'A',Fuel_Liter:10}],parseDate:()=>({y:2026,m:2,d:30})});
  assert.equal(impossible.state.raw,impossible.original,'invalid decoded calendar date must be rejected');
  const fractional=await scenario({rows:[{Date:46000.5,Unit_Code:'A',Fuel_Liter:10}]});
  assert.equal(fractional.state.raw[0].Unit_Code,'A','valid Excel serial with time fraction should be accepted');
  await overlappingImports();
  console.log('PASS: local Excel preview rejects malformed calendar dates/serials, accepts fractional serial, blocks legacy and concurrent imports, and rolls back (offline).');
})().catch(error=>{console.error(error);process.exitCode=1});
