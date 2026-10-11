/* Offline QA regression: ambiguous fuel quantities must never replace dashboard data. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('local-excel-import.js','utf8');
async function importLiter(liter){
  let onChange;
  const previous=[{Date:'2026-09-01',Unit_Code:'OLD',Fuel_Liter:7}];
  const state={raw:previous};
  const alerts=[];
  let validated=0,rendered=0;
  const notice={textContent:'',setAttribute(){},style:{}};
  const input={files:[{name:'test.xlsx',size:100,arrayBuffer:async()=>new ArrayBuffer(1)}],value:'test.xlsx',disabled:false};
  const document={getElementById:id=>id==='excelUpload'?input:notice,addEventListener:(type,fn,capture)=>{assert.equal(type,'change');assert.equal(capture,true);onChange=fn}};
  vm.runInNewContext(source,{document,state,window:{FUEL_SAFE_UPLOAD_CORE:{validate:()=>{validated++}}},XLSX:{read:()=>({SheetNames:['Fuel_Usage_Clean'],Sheets:{Fuel_Usage_Clean:{}}}),utils:{sheet_to_json:()=>[{Date:'2026-09-02',Unit_Code:'NEW',Fuel_Liter:liter}]}},normalize:rows=>rows,initFilters:()=>{},applyFilters:()=>{rendered++},alert:message=>alerts.push(message),Date,Number,String,Object,Set,Error});
  await onChange({target:input,stopPropagation(){}});
  assert.equal(input.disabled,false);
  assert.equal(input.value,'');
  return {state,previous,alerts,validated,rendered,notice};
}
(async()=>{
  for(const value of ['1,500','12 liter','1e3','0x10','1_000','1 000','',0,-1,Infinity,NaN,true,{},'1.2.3']){
    const result=await importLiter(value);
    assert.equal(result.state.raw,result.previous,'rejected quantity must preserve old data: '+String(value));
    assert.equal(result.validated,0);
    assert.equal(result.rendered,0);
    assert.match(result.alerts[0],/Liter tidak valid/);
    assert.equal(result.notice.textContent,'');
  }
  for(const value of [1,12.5,'12','12.5',' 12.5 ']){
    const result=await importLiter(value);
    assert.equal(result.state.raw[0].Unit_Code,'NEW','valid quantity should import: '+String(value));
    assert.equal(result.validated,1);
    assert.equal(result.rendered,1);
    assert.match(result.notice.textContent,/PRATINJAU LOKAL/);
  }
  console.log('PASS: strict liter formats reject ambiguous values, preserve prior data, and accept positive decimal values (offline).');
})().catch(error=>{console.error(error);process.exitCode=1});
