/* Offline behavioral regression for local Excel preview. No network or production data. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('local-excel-import.js','utf8');
async function scenario({rows,readError,renderError,parseDate,fileSize=100,fileName='sample.xlsx',sheetNames=['Fuel_Usage_Clean']}={}){
  let capture=null,legacy=0,alerts=[],renderCount=0,validateCount=0,readCount=0,parseCount=0;
  const original=[{Date:'2026-09-01',Unit_Code:'OLD',Fuel_Liter:10}];
  const input={files:[{name:fileName,size:fileSize,arrayBuffer:async()=>{readCount++;if(readError)throw Error('read failed');return new ArrayBuffer(1)}}],disabled:false,value:'sample.xlsx'};
  const state={raw:original};
  const notice={id:'fuel-local-preview-notice',setAttribute:()=>{},style:{},textContent:''};
  const document={getElementById:id=>id==='excelUpload'?input:id==='fuel-local-preview-notice'?notice:null,addEventListener:(name,fn,useCapture)=>{assert.equal(name,'change');assert.equal(useCapture,true);capture=fn}};
  const sheets=Object.fromEntries(sheetNames.map(name=>[name,{}]));
  const context={document,state,window:{FUEL_SAFE_UPLOAD_CORE:{validate:()=>{validateCount++}}},XLSX:{read:()=>({SheetNames:sheetNames,Sheets:sheets}),utils:{sheet_to_json:()=>{parseCount++;return rows||[{Date:'2026-09-02',Unit_Code:'NEW',Fuel_Liter:12}]}},SSF:{parse_date_code:parseDate||(()=>({y:2026,m:9,d:2}))}},normalize:r=>r,initFilters:()=>{},applyFilters:()=>{renderCount++;if(renderError&&renderCount===1)throw Error('render failed')},alert:message=>alerts.push(message),Date,Number,String,Object,Set,Error};
  vm.runInNewContext(source,context,{filename:'local-excel-import.js'});
  assert.equal(typeof capture,'function');
  let stopped=false;
  await capture({target:input,stopPropagation:()=>{stopped=true}});
  if(!stopped)legacy++;
  assert.equal(legacy,0,'legacy target handler must never execute');
  assert.equal(input.disabled,false,'input must be restored');
  assert.equal(input.value,'','file selection must be cleared');
  return {state,original,alerts,renderCount,validateCount,notice,readCount,parseCount};
}
async function overlappingImports(){
  let capture,release;
  const gate=new Promise(resolve=>{release=resolve});
  const input={files:[{name:'sample.xlsx',size:100,arrayBuffer:()=>gate.then(()=>new ArrayBuffer(1))}],disabled:false,value:'sample.xlsx'};
  const state={raw:[{Unit_Code:'OLD'}]};
  let readCount=0,applyCount=0,alerts=[];
  const notice={textContent:''};
  const context={document:{getElementById:id=>id==='excelUpload'?input:notice,addEventListener:(name,fn,capturePhase)=>{assert.equal(capturePhase,true);capture=fn}},state,window:{FUEL_SAFE_UPLOAD_CORE:{validate:()=>{}}},XLSX:{read:()=>{readCount++;return{SheetNames:['Fuel_Usage_Clean'],Sheets:{Fuel_Usage_Clean:{}}}},utils:{sheet_to_json:()=>[{Date:'2026-09-02',Unit_Code:'NEW',Fuel_Liter:12}]}},normalize:r=>r,initFilters:()=>{},applyFilters:()=>{applyCount++},alert:m=>alerts.push(m),Date,Number,String,Object,Set,Error};
  vm.runInNewContext(source,context);
  let stops=0;
  const event={target:input,stopPropagation:()=>{stops++}};
  const first=capture(event);
  assert.equal(input.disabled,true,'input must be locked while reading');
  await capture(event);
  assert.equal(readCount,0,'second import must not start while first reads');
  assert.match(alerts[0],/masih diproses/);
  release();await first;
  assert.equal(stops,2,'both events must block the legacy handler');
  assert.equal(readCount,1);
  assert.equal(applyCount,1);
  assert.equal(state.raw[0].Unit_Code,'NEW');
  assert.equal(input.disabled,false);
  assert.match(notice.textContent,/PRATINJAU LOKAL/);
}
(async()=>{
  const good=await scenario();assert.equal(good.state.raw[0].Unit_Code,'NEW');assert.equal(good.validateCount,1);assert.match(good.notice.textContent,/PRATINJAU LOKAL/);
  const multiSheet=await scenario({sheetNames:['Readme','Fuel_Usage_Clean']});assert.equal(multiSheet.state.raw[0].Unit_Code,'NEW');assert.equal(multiSheet.parseCount,1,'named sheet must be read even when not first');
  for(const names of [[],['Readme'],['Fuel Usage Clean'],['fuel_usage_clean']]){
    const missing=await scenario({sheetNames:names});assert.equal(missing.state.raw,missing.original,'missing named worksheet must preserve previous data');assert.equal(missing.parseCount,0,'wrong worksheet must not be parsed');assert.equal(missing.validateCount,0);assert.equal(missing.notice.textContent,'');assert.match(missing.alerts[0],/Fuel_Usage_Clean/);
  }
  const invalid=await scenario({rows:[{Date:'2026-09-02',Unit_Code:'NEW',Fuel_Liter:12},{Date:'2026-09-03',Unit_Code:'',Fuel_Liter:10}]});assert.equal(invalid.state.raw,invalid.original);assert.match(invalid.alerts[0],/Kode unit kosong/);assert.equal(invalid.notice.textContent,'');
  const duplicate=await scenario({rows:[{Date:'2026-09-02',Unit_Code:'A',Fuel_Liter:10,Transaction_ID:'DUP'},{Date:'2026-09-02',Unit_Code:'B',Fuel_Liter:10,Transaction_ID:'DUP'}]});assert.equal(duplicate.state.raw,duplicate.original);assert.match(duplicate.alerts[0],/duplikat/);
  const unreadable=await scenario({readError:true});assert.equal(unreadable.state.raw,unreadable.original);
  const failedRender=await scenario({renderError:true});assert.equal(failedRender.state.raw,failedRender.original);assert.equal(failedRender.renderCount,2,'previous dataset must be rerendered');assert.equal(failedRender.notice.textContent,'');
  for(const date of ['2026-02-30','2026-13-01','20/09/2026','2026-09-20T12:00:00','']){
    const result=await scenario({rows:[{Date:date,Unit_Code:'A',Fuel_Liter:10}]});assert.equal(result.state.raw,result.original,'invalid date must not replace dataset: '+date);assert.match(result.alerts[0],/Tanggal/);
  }
  for(const date of [-1,0,2958466,Infinity,NaN]){
    const result=await scenario({rows:[{Date:date,Unit_Code:'A',Fuel_Liter:10}]});assert.equal(result.state.raw,result.original,'invalid serial must not replace dataset: '+date);
  }
  const impossible=await scenario({rows:[{Date:46000,Unit_Code:'A',Fuel_Liter:10}],parseDate:()=>({y:2026,m:2,d:30})});assert.equal(impossible.state.raw,impossible.original,'invalid decoded calendar date must be rejected');
  const fractional=await scenario({rows:[{Date:46000.5,Unit_Code:'A',Fuel_Liter:10}]});assert.equal(fractional.state.raw[0].Unit_Code,'A','valid Excel serial with time fraction should be accepted');
  for(const text of ['<img src=x onerror=alert(1)>','A > B','<script>']){
    const unsafe=await scenario({rows:[{Date:'2026-09-02',Unit_Code:'A',Fuel_Liter:10,Operator:text}]});assert.equal(unsafe.state.raw,unsafe.original,'markup must not replace dataset');assert.match(unsafe.alerts[0],/HTML/);assert.equal(unsafe.validateCount,0);assert.equal(unsafe.notice.textContent,'');
  }
  const oversized=await scenario({rows:Array.from({length:50001},()=>({Date:'2026-09-02',Unit_Code:'A',Fuel_Liter:10}))});assert.equal(oversized.state.raw,oversized.original,'row limit must not replace dataset');assert.match(oversized.alerts[0],/50\.000/);assert.equal(oversized.validateCount,0);
  for(const size of [0,-1,NaN,Infinity,25*1024*1024+1]){
    const bad=await scenario({fileSize:size});assert.equal(bad.state.raw,bad.original,'invalid file size must preserve previous data');assert.equal(bad.readCount,0,'invalid file size must be rejected before arrayBuffer');assert.equal(bad.validateCount,0);assert.equal(bad.notice.textContent,'');assert.match(bad.alerts[0],/Impor Excel dibatalkan/);
  }
  const maxSize=await scenario({fileSize:25*1024*1024});assert.equal(maxSize.readCount,1,'file exactly at 25 MB limit should be read');
  const wrongType=await scenario({fileName:'sample.csv'});assert.equal(wrongType.readCount,0,'unsupported extension must be rejected before reading');
  await overlappingImports();
  console.log('PASS: local Excel preview enforces named worksheet, validates dates, markup, file sizes and row limits; shows notice only after success, blocks concurrent imports and rolls back (offline).');
})().catch(error=>{console.error(error);process.exitCode=1});
