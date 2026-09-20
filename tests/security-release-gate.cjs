/* Non-destructive release gate: static source checks only. No production requests. */
'use strict';
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const backend=read('backend/Code.gs');
const remote=read('v770-remote-sync.js');
const bootstrap=read('bootstrap.js');
const app=read('app.js');
const problems=[];
const check=(condition,message)=>{if(!condition)problems.push(message)};
check(!/PASSWORD_SHA256\s*:\s*['"][a-f0-9]{64}['"]/i.test(backend),'Backend embeds a password hash; keep verifier in server-only Script Properties and rotate exposed credentials.');
check(!/const PASSWORD_HASH\s*=\s*['"][a-f0-9]{64}['"]/i.test(remote),'Legacy frontend still embeds a password verifier. Remove or replace legacy module before release.');
check(!/window\.__FUEL_UPLOAD_PASSWORD\s*=/.test(remote),'Legacy frontend stores a plaintext password on window. Remove legacy credential caching.');
check(!/applyDataset\(data\);\s*const p\s*=\s*await pushPayload\(data\)/.test(remote),'Legacy upload mutates dashboard data before server confirmation.');
// Do not infer authorization from the action parser: inspect whether the latest response actually exposes readDatabase_.
const getBody=backend.match(/function doGet\s*\([^)]*\)\s*\{([\s\S]*?)\n\}\s*\n\s*function doPost/);
check(!!getBody,'Could not isolate doGet for access-policy review; fail closed.');
if(getBody){
  const publicRead=/\bdata\s*:\s*readDatabase_\s*\(\s*\)/.test(getBody[1]);
  check(!publicRead,'GET latest returns database without an established authorization boundary; enforce intended read policy before release.');
}
check(!/safeLoad\(['"]v770-remote-sync\.js/.test(bootstrap),'Bootstrap re-enables insecure legacy synchronization.');
check(!/writeDatabase_\s*\(\s*body\.data\s*\)/.test(backend),'Backend still calls multi-sheet destructive write directly; implement and test backup/restore or atomic publication before release.');
check(/export/i.test(app),'Could not locate export flow for manual review.');
if(problems.length){console.error('SECURITY RELEASE GATE: BLOCKED ('+problems.length+' findings)');problems.forEach((p,i)=>console.error((i+1)+'. '+p));process.exitCode=1}else console.log('SECURITY RELEASE GATE: static checks passed; isolated integration, credential rotation and deployed backend verification remain mandatory.');
