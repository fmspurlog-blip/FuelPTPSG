/**
 * FuelPTPSG Shared Data Backend V2
 * Token stays in Script Properties. Operational snapshot is stored in Google Drive.
 */
const PROP = PropertiesService.getScriptProperties();
const PUBLISH_KEY = 'FMS_PUBLISH_TOKEN';
const FILE_ID_KEY = 'FMS_DATA_FILE_ID';
const FILE_NAME = 'FuelPTPSG_Shared_Data.json';

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function dataFile_() {
  const id = PROP.getProperty(FILE_ID_KEY);
  if (id) {
    try { return DriveApp.getFileById(id); } catch (e) {}
  }
  const blob = Utilities.newBlob('{}', 'application/json', FILE_NAME);
  const file = DriveApp.createFile(blob);
  PROP.setProperty(FILE_ID_KEY, file.getId());
  return file;
}
function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'health');
  if (action === 'health') return json_({ok:true, service:'FuelPTPSG Sync', version:'2'});
  if (action === 'latest') {
    const id = PROP.getProperty(FILE_ID_KEY);
    if (!id) return json_({ok:true, hasData:false});
    try {
      const payload = JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString() || '{}');
      return json_({ok:true, hasData:true, payload:payload});
    } catch (err) {
      return json_({ok:false, error:String(err && err.message || err)});
    }
  }
  return json_({ok:false, error:'unsupported action'});
}
function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action !== 'publish') return json_({ok:false,error:'unsupported action'});
    const expected = PROP.getProperty(PUBLISH_KEY);
    if (!expected) return json_({ok:false,error:'server publish token is not configured'});
    const supplied = String(body.token || '');
    if (!supplied || supplied !== expected) return json_({ok:false,error:'unauthorized'});
    if (!body.payload || typeof body.payload !== 'object') return json_({ok:false,error:'payload required'});
    body.payload.serverUpdatedAt = new Date().toISOString();
    const file = dataFile_();
    file.setContent(JSON.stringify(body.payload));
    return json_({ok:true, updatedAt:body.payload.serverUpdatedAt});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}
