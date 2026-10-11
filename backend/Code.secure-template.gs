/* Isolated backend migration template. NOT deployed or wired to production.
 * Configure FUEL_UPLOAD_PASSWORD_SHA256 and FUEL_V77_SPREADSHEET_ID in Script Properties
 * of a NEW Apps Script project; never commit secrets or real spreadsheet IDs.
 * This template intentionally does not implement database writes until an isolated
 * staging deployment, backups, and a complete replace/rollback design exist.
 */
const SECURE_CONFIG = Object.freeze({
  PASSWORD_PROPERTY: 'FUEL_UPLOAD_PASSWORD_SHA256',
  DATABASE_PROPERTY: 'FUEL_V77_SPREADSHEET_ID'
});

function secureJson_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function secureHash_(password) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  ).map(byte => ('0' + ((byte + 256) % 256).toString(16)).slice(-2)).join('');
}

function secureAuthorized_(password) {
  const expected = PropertiesService.getScriptProperties()
    .getProperty(SECURE_CONFIG.PASSWORD_PROPERTY);
  // Fail closed if unconfigured; a committed password hash is never a fallback.
  if (!expected || !/^[a-f0-9]{64}$/i.test(expected) || !password) return false;
  return secureHash_(String(password)) === expected.toLowerCase();
}

function doGet(e) {
  const action = String(e && e.parameter && e.parameter.action || '').toLowerCase();
  if (action === 'health') return secureJson_({ok:true, status:'staging-template'});
  return secureJson_({ok:false, error:'Data access is disabled until authorization and staging migration are implemented.'});
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e && e.postData && e.postData.contents || '{}'); }
  catch (_) { return secureJson_({ok:false, error:'Invalid request'}); }
  if (!secureAuthorized_(body.password)) return secureJson_({ok:false, error:'Unauthorized'});
  // Never acknowledge a write or mutate the production spreadsheet in a template.
  return secureJson_({ok:false, error:'Writes disabled: staging migration and rollback not yet verified.'});
}
