(()=>{
'use strict';

const BRAND='REFUELING CONTROL';

function excavatorHTML(){return `<svg viewBox="0 0 160 86" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Excavator">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M64 24h25l19 17" stroke="#ffb12d" stroke-width="8"/>
    <path d="M108 41l27 12 12 21-30 4" stroke="#ffb12d" stroke-width="8"/>
    <path d="M134 54l17 3 5 17-19-1" fill="#ffb12d" stroke="#ffb12d" stroke-width="3"/>
    <path d="M44 28h24v30H35l9-30Z" fill="#ffb12d" stroke="#ffb12d" stroke-width="4"/>
    <rect x="47" y="34" width="15" height="12" rx="2" fill="#17334a" stroke="#d9efff" stroke-width="2"/>
    <rect x="28" y="57" width="68" height="16" rx="8" fill="#53687d" stroke="#8ea4b8" stroke-width="3"/>
    <circle cx="43" cy="65" r="6" fill="#071c2d"/><circle cx="61" cy="65" r="6" fill="#071c2d"/><circle cx="79" cy="65" r="6" fill="#071c2d"/>
  </g>
</svg>`}

function gearsHTML(){return `<svg viewBox="0 0 160 86" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="General Support">
  <defs><linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f8fb"/><stop offset="1" stop-color="#8fa9bc"/></linearGradient></defs>
  <g fill="url(#gSteel)" stroke="#6f8799" stroke-width="2">
    <g transform="translate(52 49)"><path d="M-7-25h14l3 8 8-3 8 10-5 7 5 7-8 10-8-3-3 8H-7l-3-8-8 3-8-10 5-7-5-7 8-10 8 3 3-8Z"/><circle r="9" fill="#17334a"/></g>
    <g transform="translate(95 34) scale(.82)"><path d="M-7-25h14l3 8 8-3 8 10-5 7 5 7-8 10-8-3-3 8H-7l-3-8-8 3-8-10 5-7-5-7 8-10 8 3 3-8Z"/><circle r="9" fill="#17334a"/></g>
    <g transform="translate(111 63) scale(.66)"><path d="M-7-25h14l3 8 8-3 8 10-5 7 5 7-8 10-8-3-3 8H-7l-3-8-8 3-8-10 5-7-5-7 8-10 8 3 3-8Z"/><circle r="9" fill="#17334a"/></g>
  </g>
</svg>`}

function setBrand(){
  const box=document.querySelector('.logo-box');
  if(!box)return;
  box.className='logo-box v78lock-box';
  const expected=`<div class="v78lock-brandtext">${BRAND}</div>`;
  if(box.innerHTML!==expected) box.innerHTML=expected;
}

function setUnitIcons(){
  const icons=document.querySelectorAll('.unit-type-panel .unit-icon');
  if(icons[0] && !icons[0].querySelector('svg[aria-label="Excavator"]')) icons[0].innerHTML=excavatorHTML();
  if(icons[1] && !icons[1].querySelector('svg[aria-label="General Support"]')) icons[1].innerHTML=gearsHTML();
}

function applyLock(){ setBrand(); setUnitIcons(); }

let s=document.getElementById('v78-ui-lock-style');
if(!s){s=document.createElement('style');s.id='v78-ui-lock-style';document.head.appendChild(s)}
s.textContent=`
.logo-box.v78lock-box{background:linear-gradient(135deg,#071b2c,#0d304a)!important;display:flex!important;align-items:center!important;justify-content:center!important;min-height:76px!important;height:76px!important;padding:8px!important;overflow:hidden!important;border:1px solid #214c69!important;border-radius:8px!important;box-sizing:border-box!important}
.v78lock-brandtext{display:block!important;color:#fff!important;font:900 17px/1.12 Segoe UI,Arial,sans-serif!important;letter-spacing:1.1px!important;text-align:center!important;white-space:normal!important;opacity:1!important;visibility:visible!important;width:100%!important;text-shadow:0 1px 8px rgba(0,0,0,.35)!important}
.unit-type-panel .unit-icon{height:62px!important;display:flex!important;align-items:center!important;justify-content:center!important}
.unit-type-panel .unit-icon svg{display:block!important;width:102px!important;height:60px!important;max-width:102px!important;max-height:60px!important;opacity:1!important;visibility:visible!important}
@media(max-width:768px){.logo-box.v78lock-box{min-height:64px!important;height:64px!important}.v78lock-brandtext{font-size:13px!important;letter-spacing:.7px!important}.unit-type-panel .unit-icon svg{width:90px!important;height:52px!important}}
`;

applyLock();

// Observe only the three small UI targets. This prevents legacy renderers from blanking them again.
const brandBox=document.querySelector('.logo-box');
if(brandBox){
  new MutationObserver(()=>setBrand()).observe(brandBox,{childList:true,subtree:true,characterData:true});
}
document.querySelectorAll('.unit-type-panel .unit-icon').forEach(el=>{
  new MutationObserver(()=>setUnitIcons()).observe(el,{childList:true,subtree:true,characterData:true});
});

function wrap(name){
  try{const old=window[name];if(typeof old!=='function'||old.__v78lock)return;const f=function(...args){const r=old.apply(this,args);queueMicrotask(applyLock);return r};f.__v78lock=true;window[name]=f}catch(_){ }
}
wrap('renderAll');wrap('applyFilters');
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>queueMicrotask(applyLock)));
window.addEventListener('pageshow',applyLock);
})();
