/* Retired legacy V77 cloud synchronization.
 * This public file must not contain a password verifier, retain credentials,
 * read a private database, or mutate the dashboard before a server commit.
 * The isolated safe-upload-core.js is not wired to a production endpoint.
 * Do not restore cloud sync without isolated backend integration, authorization,
 * recovery tests and explicit release approval.
 */
(()=>{
  'use strict';
  const reason='Sinkronisasi cloud dinonaktifkan sementara pada branch pengujian sampai backend aman dan teruji.';
  const unavailable=()=>Promise.reject(new Error(reason));
  window.FUEL_V77_SYNC=Object.freeze({pull:unavailable,push:unavailable,enabled:false});
  const show=()=>{
    const host=document.querySelector('.hero-status');
    if(!host||document.getElementById('v77CloudStatus'))return;
    const badge=document.createElement('span');
    badge.id='v77CloudStatus';
    badge.textContent='☁ CLOUD DISABLED — TEST BRANCH';
    badge.style.cssText='font-size:10px;font-weight:800;padding:5px 8px;border-radius:6px;margin-left:6px;border:1px solid #805d22;color:#ffca72;background:rgba(255,139,31,.12)';
    host.appendChild(badge);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show,{once:true});else show();
})();
