/* Offline regression: failed normalization, validation or rendering must not replace existing dashboard data. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('local-excel-import.js','utf8');
async function scenario(failure){
  let change,validations=0,renders=0,filterCalls=0;
  const original=[{Date:'2026-09-01',Unit_Code:'OLD',Fuel_Liter:7}];
  const state={raw:original},alerts=[];
  const notice={textContent:'',setAttribute(){},style:{}};
  const input={files:[{name:'rollback.xlsx',size:100,arrayBuffer:async()=>new ArrayBuffer(1)}],value:'rollback.xlsx',disabled:false};
  const document={getElementById:id=>id==='excelUpload'?input:notice,addEventListener:(_,handler,capture)=>{assert.equal(capture,true);change=handler}};
  vm.runInNewContext(source,{document,state,window:{FUEL_SAFE_UPLOAD_CORE:{validate:()=>{validations++;if(failure==='validate')throw Error('validator rejected')}}},XLSX:{read:()=>({SheetNames:['Fuel_Usage_Clean'],Sheets:{Fuel_Usage_Clean:{}}}),utils:{sheet_to_json:()=>[{Date:'2026-09-02',Unit_Code:'NEW',Fuel_Liter:12}]}},normalize:rows=>{if(failure==='normalize')throw Error('normalization failed');return failure==='drop-row'?[]:rows},initFilters:()=>{filterCalls++;if(failure==='filters'&&filterCalls===1)throw Error('filters failed')},applyFilters:()=>{renders++;if(failure==='render'&&renders===1)throw Error('render failed')},alert:message=>alerts.push(message),Date,Number,String,Object,Set,Error});
  let stopped=false;
  await change({target:input,stopPropagation(){stopped=true}});
  assert.equal(stopped,true,'legacy handler must be intercepted');
  assert.equal(input.disabled,false,'upload control must be reenabled');
  assert.equal(input.value,'','file selection must be cleared');
  assert.equal(state.raw,original,'original dataset identity must survive failed import');
  assert.equal(validations,['normalize','drop-row'].includes(failure)?0:1,'validator must not run on invalid normalization');
  assert.equal(notice.textContent,'','failed import must not claim local preview success');
  assert.match(alerts[0],/Impor Excel dibatalkan/);
  return {renders,filterCalls,alerts};
}
(async()=>{
  for(const failure of ['normalize','drop-row']){
    const result=await scenario(failure);
    assert.equal(result.renders,0,'normalization failure must not render candidate data');
    assert.equal(result.filterCalls,0,'normalization failure must not update filters');
    assert.match(result.alerts[0],failure==='drop-row'?/Tidak ada data yang diganti/:/normalization failed/);
  }
  const rejected=await scenario('validate');
  assert.equal(rejected.renders,0,'failed validation must never render candidate data');
  assert.equal(rejected.filterCalls,0,'failed validation must not update filters');
  const render=await scenario('render');
  assert.equal(render.renders,2,'render failure must rerender restored dataset');
  assert.equal(render.filterCalls,2,'render failure must restore filters');
  const filters=await scenario('filters');
  assert.equal(filters.renders,1,'filter failure must render restored dataset only');
  assert.equal(filters.filterCalls,2,'filter failure must retry filters with restored dataset');
  console.log('PASS: normalization, dropped rows, validator, filter and render failures preserve old data, restore UI and clear input (offline).');
})().catch(error=>{console.error(error);process.exitCode=1});
