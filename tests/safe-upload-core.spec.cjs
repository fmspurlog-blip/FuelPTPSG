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
    let sent=0,applied=0;
    const upload=createUploader({getPassword:async()=> 'test-only',send:async()=>{sent++;throw new Error('offline')},apply:async()=>{applied++}});
    await assert.rejects(upload(sample),error=>error.remoteOutcomeUnknown===true&&/belum pasti/.test(error.message));
    await assert.rejects(upload(sample),/Status upload sebelumnya belum dapat dipastikan/);
    assert.equal(sent,1,'Do not resend after ambiguous transport failure');
    assert.equal(applied,0,'Do not apply data after ambiguous transport failure');
  }
  {
    const events=[];
    const upload=createUploader({getPassword:async()=> 'test-only',send:async()=>{events.push('send');return {ok:true,updatedAt:'2026-09-20T00:00:00Z'}},apply:async()=>{events.push('apply');return true}});
    await upload(sample);await upload(sample);
    assert.deepEqual(events,['send','apply','send','apply']);
  }
  {
    let sent=0;
    const upload=createUploader({getPassword:async()=> 'test-only',send:async()=>{sent++;return {ok:true,updatedAt:'2026-09-20T00:00:00Z'}},apply:async()=>{throw new Error('render failed')}});
    await assert.rejects(upload(sample),error=>error.remoteCommitted===true&&/jangan unggah ulang/.test(error.message));
    await assert.rejects(upload(sample),/Status upload sebelumnya belum dapat dipastikan/);
    assert.equal(sent,1,'Do not resend after a confirmed commit with local failure');
  }
  {
    let release;
    const pending=new Promise(resolve=>{release=resolve});
    let sent=0;
    const upload=createUploader({getPassword:async()=> 'test-only',send:async()=>{sent++;await pending;return {ok:true,updatedAt:'2026-09-20T00:00:00Z'}},apply:async()=>true});
    const first=upload(sample);
    await assert.rejects(upload(sample),/masih berjalan/);
    release();await first;
    assert.equal(sent,1,'Concurrent attempts must not duplicate the request');
  }
  console.log('PASS: mock-only upload tests (validation, cancel, rejection, ambiguous transport, retry lock, ordering, post-commit failure, concurrency)');
}
main().catch(error=>{console.error(error);process.exitCode=1});
