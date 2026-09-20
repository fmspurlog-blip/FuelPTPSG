'use strict';
const assert=require('node:assert/strict');
const {createUploader,validate}=require('../safe-upload-core.js');
const sample={usage:[{Date:'2026-09-20',Unit_Code:'TEST-001',Fuel_Liter:100}],receipts:[],stock:{snapshots:{},availableDates:[]},recon:{daily:[]}};
async function main(){
  assert.equal(validate(sample),sample);
  assert.throws(()=>validate({...sample,usage:[]}),/kosong/);
  assert.throws(()=>validate({...sample,usage:[{Date:'bad',Unit_Code:'X',Fuel_Liter:1}]}),/tidak valid/);
  for(const result of [null,{ok:false,error:'Unauthorized'},{ok:true}]){
    let applied=0;
    const upload=createUploader({getPassword:async()=> 'test-only',send:async()=>result,apply:async()=>{applied++}});
    await assert.rejects(upload(sample));
    assert.equal(applied,0,'No local mutation on unconfirmed response');
  }
  {
    let sent=0,applied=0;
    const upload=createUploader({getPassword:async()=>'',send:async()=>{sent++},apply:async()=>{applied++}});
    await assert.rejects(upload(sample),/DIBATALKAN/);
    assert.equal(sent,0);assert.equal(applied,0);
  }
  {
    let applied=0;
    const upload=createUploader({getPassword:async()=> 'test-only',send:async()=>{throw new Error('offline')},apply:async()=>{applied++}});
    await assert.rejects(upload(sample),/offline/);assert.equal(applied,0);
  }
  {
    const events=[];
    const upload=createUploader({getPassword:async()=> 'test-only',send:async()=>{events.push('send');return {ok:true,updatedAt:'2026-09-20T00:00:00Z'}},apply:async()=>{events.push('apply');return true}});
    await upload(sample);assert.deepEqual(events,['send','apply']);
  }
  {
    const upload=createUploader({getPassword:async()=> 'test-only',send:async()=>({ok:true,updatedAt:'2026-09-20T00:00:00Z'}),apply:async()=>{throw new Error('render failed')}});
    await assert.rejects(upload(sample),error=>error.remoteCommitted===true&&/jangan unggah ulang/.test(error.message));
  }
  console.log('PASS: mock-only upload transaction tests (validation, cancel, rejection, offline, ordering, post-commit failure)');
}
main().catch(error=>{console.error(error);process.exitCode=1});
