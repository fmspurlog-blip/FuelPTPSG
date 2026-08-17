(()=>{
'use strict';

function brandHTML(){return `<div class="v78lock-brand" aria-label="Refueling Control">
  <svg class="v78lock-fuel" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="17" y="10" width="48" height="66" rx="7" fill="#1687f8"/>
    <rect x="26" y="20" width="30" height="20" rx="3" fill="#dff1ff"/>
    <rect x="12" y="72" width="58" height="11" rx="3" fill="#0b5ca8"/>
    <circle cx="41" cy="58" r="6" fill="#fff"/>
    <path d="M65 24h9l12 13v29c0 10-5 16-14 16-8 0-13-6-13-16V54h8v12c0 5 2 8 5 8 4 0 6-3 6-8V41L65 28Z" fill="#ff9b25"/>
    <path d="M72 24l8-7 6 7-8 8Z" fill="#ff9b25"/>
  </svg>
  <div>REFUELING CONTROL</div>
</div>`}

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
  <g fill="#d8e4ee" stroke="#8ba1b5" stroke-width="2">
    <g transform="translate(52 49)"><path d="M-7-25h14l3 8 8-3 8 10-5 7 5 7-8 10-8-3-3 8H-7l-3-8-8 3-8-10 5-7-5-7 8-10 8 3 3-8Z"/><circle r="9" fill="#17334a"/></g>
    <g transform="translate(95 34) scale(.82)"><path d="M-7-25h14l3 8 8-3 8 10-5 7 5 7-8 10-8-3-3 8H-7l-3-8-8 3-8-10 5-7-5-7 8-10 8 3 3-8Z"/><circle r="9" fill="#17334a"/></g>
    <g transform="translate(111 63) scale(.66)"><path d="M-7-25h14l3 8 8-3 8 10-5 7 5 7-8 10-8-3-3 8H-7l-3-8-8 3-8-10 5-7-5-7 8-10 8 3 3-8Z"/><circle r="9" fill="#17334a"/></g>
  </g>
</svg>`}

function applyLock(){
  const box=document.querySelector('.logo-box');
  if(box){box.classList.add('v78lock-box');box.innerHTML=brandHTML()}
  const icons=document.querySelectorAll('.unit-type-panel .unit-icon');
  if(icons[0])icons[0].innerHTML=excavatorHTML();
  if(icons[1])icons[1].innerHTML=gearsHTML();
}

let s=document.getElementById('v78-ui-lock-style');
if(!s){s=document.createElement('style');s.id='v78-ui-lock-style';document.head.appendChild(s)}
s.textContent=`
.logo-box.v78lock-box{background:linear-gradient(135deg,#071b2c,#0d304a)!important;display:flex!important;align-items:center!important;justify-content:center!important;min-height:76px!important;height:76px!important;padding:3px!important;overflow:hidden!important;border-radius:8px!important}
.v78lock-brand{width:100%;height:100%;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:0!important;color:#fff!important;font:900 11px/1 Segoe UI,Arial,sans-serif!important;letter-spacing:.65px!important;text-align:center!important}
.v78lock-fuel{width:48px!important;height:48px!important;display:block!important;flex:0 0 48px!important;margin-bottom:1px!important}
.unit-type-panel .unit-icon{height:62px!important;display:flex!important;align-items:center!important;justify-content:center!important}
.unit-type-panel .unit-icon svg{display:block!important;width:98px!important;height:58px!important;max-width:98px!important;max-height:58px!important;opacity:1!important;visibility:visible!important}
@media(max-width:768px){.logo-box.v78lock-box{min-height:64px!important;height:64px!important}.v78lock-fuel{width:39px!important;height:39px!important;flex-basis:39px!important}.v78lock-brand{font-size:9px!important}.unit-type-panel .unit-icon svg{width:88px!important;height:52px!important}}
`;

function wrap(name){
  try{
    const old=window[name];
    if(typeof old!=='function'||old.__v78lock)return;
    const f=function(...args){const r=old.apply(this,args);queueMicrotask(applyLock);return r};
    f.__v78lock=true;window[name]=f;
  }catch(_){ }
}
wrap('renderAll');wrap('applyFilters');

document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>queueMicrotask(applyLock)));
window.addEventListener('pageshow',applyLock);
applyLock();
})();
