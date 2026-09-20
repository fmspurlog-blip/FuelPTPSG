/* Offline behavioral regression for the quarantined Apps Script backend.
 * No network, credentials, Google Apps Script deployment, or production data.
 * Run: node tests/backend-quarantine.spec.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('backend/Code.gs', 'utf8');
const calls = [];
const context = vm.createContext({
  ContentService: {
    MimeType: {JSON: 'application/json'},
    createTextOutput(value) {
      calls.push('createTextOutput');
      return {value, setMimeType(type) {assert.equal(type, 'application/json'); return this;}};
    }
  },
  SpreadsheetApp: new Proxy({}, {get() {throw new Error('Spreadsheet access is forbidden in quarantine');}}),
  PropertiesService: new Proxy({}, {get() {throw new Error('Properties access is forbidden in quarantine');}}),
  LockService: new Proxy({}, {get() {throw new Error('Lock access is forbidden in quarantine');}})
});
vm.runInContext(source, context, {filename:'backend/Code.gs',timeout:1000});
const get = parameter => JSON.parse(context.doGet({parameter}).value);
const post = postData => JSON.parse(context.doPost({postData}).value);
for (const parameter of [undefined, {}, {action:'latest'}, {action:'LATEST'}, {action:'unknown'}, {action:'health',token:'example'}]) {
  const result = get(parameter);
  if (parameter?.action === 'health') {
    assert.equal(result.ok, true);
    assert.equal(result.status, 'legacy-backend-quarantined');
    assert.equal(Object.hasOwn(result,'data'),false);
  } else {
    assert.equal(result.ok,false);
    assert.equal(Object.hasOwn(result,'data'),false);
  }
}
for (const postData of [undefined, {}, {contents:'invalid json'}, {contents:JSON.stringify({action:'replace',password:'example',data:{usage:[{Date:'2026-09-20'}]}})}]) {
  const result = post(postData);
  assert.equal(result.ok,false);
  assert.equal(Object.hasOwn(result,'data'),false);
}
assert.throws(() => context.setupDatabase(), /disabled/i);
assert.equal(calls.length,10);
console.log('PASS: quarantined backend denies reads, writes and setup without accessing spreadsheets, properties or locks (offline mock).');
