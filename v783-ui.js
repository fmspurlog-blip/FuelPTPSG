(()=>{
'use strict';

const fuelGun=`<svg viewBox="0 0 62 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="8" y="6" width="34" height="58" rx="3" fill="#ff9800"/>
  <rect x="14" y="13" width="22" height="14" rx="1" fill="#fff"/>
  <rect x="18" y="17" width="14" height="7" fill="#173249"/>
  <path d="M25 34c-6 8-9 14-9 19a10 10 0 0 0 20 0c0-5-5-12-11-19Zm0 9c3 4 5 8 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10Z" fill="#09243a"/>
  <path d="M42 16h6l6 7v20c0 6-4 10-9 10h-4v-6h4c2 0 3-2 3-4V26l-6-6Z" fill="#ff9800"/>
  <rect x="5" y="64" width="41" height="5" rx="2" fill="#ff9800"/>
</svg>`;

const excavator=`<svg viewBox="0 0 170 90" xmlns="http://www.w3.org/2000/svg" aria-label="Excavator">
  <g stroke-linecap="round" stroke-linejoin="round">
    <rect x="18" y="65" width="75" height="16" rx="8" fill="#7d93a5" stroke="#bdd0de" stroke-width="2.5"/>
    <circle cx="34" cy="73" r="5" fill="#0a2134"/><circle cx="54" cy="73" r="5" fill="#0a2134"/><circle cx="74" cy="73" r="5" fill="#0a2134"/>
    <path d="M39 63V35h29l15 16v12Z" fill="#ff9c12" stroke="#ffc04b" stroke-width="2.5"/>
    <rect x="48" y="41" width="15" height="12" rx="1.5" fill="#edf8ff" stroke="#9fc7df" stroke-width="2"/>
    <path d="M77 53 100 24l10 5-18 31" fill="none" stroke="#ff9c12" stroke-width="7"/>
    <path d="m106 30 27 17-7 10-28-12" fill="none" stroke="#ff9c12" stroke-width="7"/>
    <path d="M130 50h25l-7 22-26-2Z" fill="#ff9c12" stroke="#ffc04b" stroke-width="2.5"/>
  </g>
</svg>`;

const gears=`<svg viewBox="0 0 170 90" xmlns="http://www.w3.org/2000/svg" aria-label="General Support">
  <defs><linearGradient id="steel783" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#d7e4ec"/><stop offset="1" stop-color="#819bad"/></linearGradient></defs>
  <g fill="url(#steel783)" stroke="#6f8799" stroke-width="2.5">
    <g transform="translate(54 54)"><path d="M-8-29h16l4 9 9-4 10 10-4 9 9 4v16l-9 4 4 9-10 10-9-4-4 9H-8l-4-9-9 4-10-10 4-9-9-4V-1l9-4-4-9 10-10 9 4Z"/><circle r="10" fill="#17364d"/></g>
    <g transform="translate(105 34) scale(.8)"><path d="M-8-29h16l4 9 9-4 10 10-4 9 9 4v16l-9 4 4 9-10 10-9-4-4 9H-8l-4-9-9 4-10-10 4-9-9-4V-1l9-4-4-9 10-10 9 4Z"/><circle r="10" fill="#17364d"/></g>
    <g transform="translate(121 67) scale(.62)"><path d="M-8-29h16l4 9 9-4 10 10-4 9 9 4v16l-9 4 4 9-10 10-9-4-4 9H-8l-4-9-9 4-10-10 4-9-9-4V-1l9-4-4-9 10-10 9 4Z"/><circle r="10" fill="#17364d"/></g>
  </g>
</svg>`;

function applyV783(){
  const box=document.querySelector('.logo-box');
  if(box){
    box.className='logo-box v783-brand-box';
    box.innerHTML=`<div class="v783-brand">${fuelGun}<div class="v783-brand-text">REFUELING<br>CONTROL</div></div>`;
  }
  const icons=document.querySelectorAll('.unit-type-panel .unit-icon');
  if(icons[0]) icons[0].innerHTML=excavator;
  if(icons[1]) icons[1].innerHTML=gears;
  const stockLabel=document.querySelector('.stock-panel .stock-total>small');
  if(stockLabel) stockLabel.textContent='TOTAL STOCK';
}

let st=document.getElementById('v783-ui-style');
if(!st){st=document.createElement('style');st.id='v783-ui-style';document.head.appendChild(st)}
st.textContent=`
.v783-brand-box{height:96px!important;min-height:96px!important;padding:6px 8px!important;display:flex!important;align-items:center!important;justify-content:center!important;background:linear-gradient(145deg,#061a2b,#092940)!important;border:1px solid #1788d8!important;border-radius:8px!important;box-sizing:border-box!important;overflow:hidden!important}
.v783-brand{width:100%;height:100%;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:9px!important;color:#fff!important}
.v783-brand svg{display:block!important;width:48px!important;height:68px!important;flex:0 0 48px!important}
.v783-brand-text{display:block!important;color:#fff!important;font:900 21px/1.18 Segoe UI,Arial,sans-serif!important;letter-spacing:.1px!important;text-align:left!important;text-shadow:0 2px 2px rgba(0,0,0,.45)!important}
.unit-type-panel .unit-icon{height:66px!important;display:flex!important;align-items:center!important;justify-content:center!important}
.unit-type-panel .unit-icon svg{display:block!important;width:108px!important;height:66px!important;max-width:108px!important;max-height:66px!important;filter:drop-shadow(0 3px 3px rgba(0,0,0,.28))!important}
.stock-panel{position:relative!important}.stock-panel .stock-total{position:absolute!important;top:112px!important;bottom:auto!important;left:76%!important;right:auto!important;transform:translateX(-50%)!important;width:118px!important;text-align:center!important;margin:0!important;z-index:8!important}.stock-panel .stock-total>small{display:block!important;color:#fff!important;font-size:12px!important;font-weight:900!important;margin:0 0 5px!important}.stock-panel .stock-orb{width:82px!important;height:82px!important;margin:0 auto!important}
@media(max-width:768px){.v783-brand-box{height:82px!important;min-height:82px!important}.v783-brand svg{width:40px!important;height:58px!important;flex-basis:40px!important}.v783-brand-text{font-size:16px!important}.unit-type-panel .unit-icon svg{width:96px!important;height:56px!important}.stock-panel .stock-total{top:110px!important;left:75%!important}}
`;

applyV783();
try{if(typeof renderAll==='function'&&!renderAll.__v783){const old=renderAll;const f=function(...a){const r=old.apply(this,a);queueMicrotask(applyV783);return r};f.__v783=true;renderAll=f}}catch(_){ }
try{if(typeof applyFilters==='function'&&!applyFilters.__v783){const old=applyFilters;const f=function(...a){const r=old.apply(this,a);queueMicrotask(applyV783);return r};f.__v783=true;applyFilters=f}}catch(_){ }
window.addEventListener('pageshow',applyV783);
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>queueMicrotask(applyV783)));
setTimeout(applyV783,300);setTimeout(applyV783,1500);
})();