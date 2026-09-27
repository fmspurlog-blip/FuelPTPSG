/**
 * FuelPTPSG shared-data backend foundation.
 * Deploy as Google Apps Script Web App only after reviewing access settings.
 * Secrets/passwords belong in Script Properties, never in GitHub/frontend.
 */
const PROP = PropertiesService.getScriptProperties();
const DATA_KEY = 'FMS_SHARED_DATA_V1';
const PUBLISH_KEY = 'FMS_PUBLISH_TOKEN';

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'health');
  if (action === 'health') return json_({ok:true, service:'FuelPTPSG Sync', version:'1'});
  if (action === 'latest') {
    const raw = PROP.getProperty(DATA_KEY);
    if (!raw) return json_({ok:true, hasData:false});
    return json_({ok:true, hasData:true, payload:JSON.parse(raw)});
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
    const payload = body.payload;
    payload.serverUpdatedAt = new Date().toISOString();
    PROP.setProperty(DATA_KEY, JSON.stringify(payload));
    return json_({ok:true, updatedAt:payload.serverUpdatedAt});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}
