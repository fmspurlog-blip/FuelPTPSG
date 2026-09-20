/* Legacy backend quarantine: no database access is exposed through HTTP.
 * NOT deployed. Do not deploy or merge before a separately tested authorized
 * read path and atomic backup/rollback for writes have been implemented.
 * Previous publicly exposed upload credentials must be rotated by the owner.
 */
const V77 = Object.freeze({VERSION:'77.1', DB_PROPERTY:'FUEL_V77_SPREADSHEET_ID', PASSWORD_PROPERTY:'FUEL_UPLOAD_PASSWORD_SHA256'});
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
function doGet(e){
  const action=String((e&&e.parameter&&e.parameter.action)||'').toLowerCase();
  if(action==='health')return json_({ok:true,version:V77.VERSION,status:'legacy-backend-quarantined'});
  return json_({ok:false,version:V77.VERSION,error:'Database reads disabled pending authenticated staging migration.'});
}
function doPost(e){
  // Deliberately reject every write, even if a caller supplies an old password.
  // Do not parse, log, or persist credentials or request bodies.
  return json_({ok:false,version:V77.VERSION,error:'Database writes disabled pending backup and rollback verification.'});
}
function setupDatabase(){
  // Do not create or alter spreadsheets from this quarantined source file.
  throw new Error('Database setup disabled in legacy backend. Use an isolated staging project.');
}
