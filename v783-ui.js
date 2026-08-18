(()=>{
'use strict';

const fuelGun=`<svg viewBox="0 0 110 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><linearGradient id="fgBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#30a4ff"/><stop offset="1" stop-color="#0d67c7"/></linearGradient></defs>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 15h36c5 0 9 4 9 9v38H15V24c0-5 4-9 9-9Z" fill="url(#fgBlue)" stroke="#7bc7ff" stroke-width="2"/>
    <rect x="26" y="25" width="30" height="18" rx="3" fill="#e9f7ff" stroke="#8ccfff" stroke-width="2"/>
    <path d="M69 27h10l14 15v20c0 9-5 15-13 15s-13-6-13-15V52h8v10c0 5 2 7 5 7s5-2 5-7V46L70 31Z" fill="#ff9a22" stroke="#ffc069" stroke-width="2"/>
    <path d="M88 34l9-9 7 7-9 9" fill="#ff9a22" stroke="#ffc069" stroke-width="2"/>
    <rect x="9" y="62" width="67" height="11" rx="4" fill="#0b4e8b" stroke="#4fa6e7" stroke-width="2"/>
  </g>
</svg>`;

const excavator=`<svg viewBox="0 0 170 90" xmlns="http://www.w3.org/2000/svg" aria-label="Excavator">
  <g stroke-linecap="round" stroke-linejoin="round">
    <rect x="20" y="64" width="76" height="17" rx="8.5" fill="#5f7285" stroke="#a8bdcf" stroke-width="3"/>
    <circle cx="38" cy="72.5" r="5.5" fill="#071927"/><circle cx="58" cy="72.5" r="5.5" fill="#071927"/><circle cx="78" cy="72.5" r="5.5" fill="#071927"/>
    <path d="M42 62V32h28l15 16v14Z" fill="#f6a21c" stroke="#ffc35c" stroke-width="3"/>
    <rect x="50" y="39" width="15" height="13" rx="2" fill="#17364d" stroke="#d8f1ff" stroke-width="2"/>
    <path d="M79 36h21l26 20" fill="none" stroke="#f6a21c" stroke-width="8"/>
    <path d="M126 56l26 8-7 15-29-3" fill="#f6a21c" stroke="#ffc35c" stroke-width="3"/>
    <path d="M117 76l28 3 11-3-3 9-35 1Z" fill="#f6a21c"/>
  </g>
</svg>`;

const gears=`<svg viewBox="0 0 170 90" xmlns="http://www.w3.org/2000/svg" aria-label="General Support">
  <defs><linearGradient id="steel78" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7fbff"/><stop offset=".48" stop-color="#c3d5e2"/><stop offset="1" stop-color="#7892a7"/></linearGradient></defs>
  <g fill="url(#steel78)" stroke="#698398" stroke-width="2.5">
    <g transform="translate(56 55)"><path d="M-8-28h16l4 9 9-4 10 10-4 9 9 4v16l-9 4 4 9-10 10-9-4-4 9H-8l-4-9-9 4-10-10 4-9-9-4V0l9-4-4-9 10-10 9 4Z"/><circle r="10" fill="#17364d"/></g>
    <g transform="translate(105 35) scale(.78)"><path d="M-8-28h16l4 9 9-4 10 10-4 9 9 4v16l-9 4 4 9-10 10-9-4-4 9H-8l-4-9-9 4-10-10 4-9-9-4V0l9-4-4-9 10-10 9 4Z"/><circle r="10" fill="#17364d"/></g>
    <g transform="translate(121 67) scale(.62)"><path d="M-8-28h16l4 9 9-4 10 10-4 9 9 4v16l-9 4 4 9-10 10-9-4-4 9H-8l-4-9-9 4-10-10 4-9-9-4V0l9-4-4-9 10-10 9 4Z"/><circle r="10" fill="#17364d"/></g>
  </g>
</svg>`;

function applyV783(){
  const box=document.querySelector('.logo-box');
  if(box){
    box.className='logo-box v783-brand-box';
    box.innerHTML=`<div class="v783-brand">${fuelGun}<strong>REFUELING CONTROL</strong></div>`;
  }
  const icons=document.querySelectorAll('.unit-type-panel .unit-icon');
  if(icons[0])icons[0].innerHTML=excavator;
  if(icons[1])icons[1].innerHTML=gears;
}

let st=document.getElementById('v783-ui-style');
if(!st){st=document.createElement('style');st.id='v783-ui-style';document.head.appendChild(st)}
st.textContent=`
.v783-brand-box{height:86px!important;min-height:86px!important;padding:5px 7px!important;display:flex!important;align-items:center!important;justify-content:center!important;background:linear-gradient(145deg,#071929,#0b2c46)!important;border:1px solid #27506c!important;border-radius:9px!important;box-sizing:border-box!important;overflow:hidden!important}
.v783-brand{width:100%;height:100%;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2px!important;color:#fff!important;text-align:center!important}
.v783-brand svg{display:block!important;width:62px!important;height:50px!important;flex:0 0 50px!important}
.v783-brand strong{display:block!important;color:#fff!important;font:900 13px/1.05 Segoe UI,Arial,sans-serif!important;letter-spacing:.7px!important;white-space:nowrap!important}
.unit-type-panel .unit-icon{height:62px!important;display:flex!important;align-items:center!important;justify-content:center!important}
.unit-type-panel .unit-icon svg{display:block!important;width:112px!important;height:62px!important;max-width:112px!important;max-height:62px!important}
@media(max-width:768px){.v783-brand-box{height:72px!important;min-height:72px!important}.v783-brand svg{width:50px!important;height:40px!important;flex-basis:40px!important}.v783-brand strong{font-size:10px!important}.unit-type-panel .unit-icon svg{width:96px!important;height:54px!important}}
`;

applyV783();
try{if(typeof renderAll==='function'&&!renderAll.__v783){const old=renderAll;const f=function(...a){const r=old.apply(this,a);queueMicrotask(applyV783);return r};f.__v783=true;renderAll=f}}catch(_){ }
try{if(typeof applyFilters==='function'&&!applyFilters.__v783){const old=applyFilters;const f=function(...a){const r=old.apply(this,a);queueMicrotask(applyV783);return r};f.__v783=true;applyFilters=f}}catch(_){ }
window.addEventListener('pageshow',applyV783);
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>queueMicrotask(applyV783)));
})();
