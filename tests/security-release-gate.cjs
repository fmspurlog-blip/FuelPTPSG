/* Non-destructive release gate. Run: node tests/security-release-gate.cjs
 * Never sends requests or touches the production database. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const backend=read('backend/Code.gs');
const remote=read('v770-remote-sync.js');
const app=read('app.js');
const problems=[];
const check=(condition,message)=>{if(!condition)problems.push(message)};
check(!/PASSWORD_SHA256\s*:\s*['"][a-f0-9]{64}['"]/i.test(backend),'Backend embeds a password hash in public source; use server-only Script Properties and rotate the credential.');
check(!/const PASSWORD_HASH\s*=\s*['"][a-f0-9]{64}['"]/i.test(remote),'Frontend embeds a password verifier; remove it and validate credentials server-side.');
check(!/function doGet\([\s\S]*?action\s*===?\s*['"]latest['"][\s\S]*?readDatabase_\(\)/.test(backend),'Review access policy: GET latest exposes database without authorization; document and enforce the intended access boundary.');
check(!/applyDataset\(data\);\s*const p=await pushPayload\(data\)/.test(remote),'Upload changes active local data before server confirms success.');
check(!/window\.__FUEL_UPLOAD_PASSWORD\s*=\s*pwd/.test(remote),'Frontend persists the plaintext upload password in global window state.');
// Export routes must be reviewed individually; a browser-only password dialog is not server authorization.
check(/export/i.test(app),'Could not locate export flow for manual review.');
if(problems.length){console.error('SECURITY RELEASE GATE: BLOCKED ('+problems.length+' findings)');problems.forEach((p,i)=>console.error((i+1)+'. '+p));process.exitCode=1}else console.log('SECURITY RELEASE GATE: source-level checks passed; still requires isolated integration and backend deployment verification.');
