(()=>{
'use strict';

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
  <defs><linearGradient id="steel783b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#d7e4ec"/><stop offset="1" stop-color="#819bad"/></linearGradient></defs>
  <g fill="url(#steel783b)" stroke="#6f8799" stroke-width="2.5">
    <g transform="translate(54 54)"><path d="M-8-29h16l4 9 9-4 10 10-4 9 9 4v16l-9 4 4 9-10 10-9-4-4 9H-8l-4-9-9 4-10-10 4-9-9-4V-1l9-4-4-9 10-10 9 4Z"/><circle r="10" fill="#17364d"/></g>
    <g transform="translate(105 34) scale(.8)"><path d="M-8-29h16l4 9 9-4 10 10-4 9 9 4v16l-9 4 4 9-10 10-9-4-4 9H-8l-4-9-9 4-10-10 4-9-9-4V-1l9-4-4-9 10-10 9 4Z"/><circle r="10" fill="#17364d"/></g>
    <g transform="translate(121 67) scale(.62)"><path d="M-8-29h16l4 9 9-4 10 10-4 9 9 4v16l-9 4 4 9-10 10-9-4-4 9H-8l-4-9-9 4-10-10 4-9-9-4V-1l9-4-4-9 10-10 9 4Z"/><circle r="10" fill="#17364d"/></g>
  </g>
</svg>`;

const stockHome={parent:null,next:null};
function placeStock(){
  const total=document.querySelector('.stock-panel .stock-total');
  const cols=document.querySelector('.stock-panel .stock-cols');
  if(!total||!cols)return;
  if(!stockHome.parent){stockHome.parent=total.parentNode;stockHome.next=total.nextSibling;}
  const mobile=window.matchMedia('(max-width:768px)').matches;
  if(mobile){
    const truckCol=cols.children[1];
    if(truckCol&&total.parentNode!==truckCol)truckCol.appendChild(total);
    total.classList.add('v783-stock-mobile');
  }else{
    total.classList.remove('v783-stock-mobile');
    if(stockHome.parent&&total.parentNode!==stockHome.parent){
      const anchor=(stockHome.next&&stockHome.next.parentNode===stockHome.parent)?stockHome.next:cols;
      stockHome.parent.insertBefore(total,anchor);
    }
  }
}

function applyV783(){
  const box=document.querySelector('.logo-box');
  if(box){box.classList.add('v783-brand-box');box.setAttribute('aria-label','Refueling Control');}
  const icons=document.querySelectorAll('.unit-type-panel .unit-icon');
  if(icons[0])icons[0].innerHTML=excavator;
  if(icons[1])icons[1].innerHTML=gears;
  const stockLabel=document.querySelector('.stock-panel .stock-total>small');
  if(stockLabel)stockLabel.textContent='TOTAL STOCK';
  placeStock();
}

let st=document.getElementById('v783-ui-style');
if(!st){st=document.createElement('style');st.id='v783-ui-style';document.head.appendChild(st)}
st.textContent=`
/* Branding is CSS-generated so it survives any script clearing the logo-box contents. */
.logo-box,.logo-box.v783-brand-box{position:relative!important;height:96px!important;min-height:96px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;background:linear-gradient(145deg,#061a2b,#092940)!important;border:1px solid #1788d8!important;border-radius:8px!important;box-sizing:border-box!important;overflow:hidden!important}
.logo-box>*{display:none!important}
.logo-box::before{content:""!important;display:block!important;width:50px!important;height:70px!important;flex:0 0 50px!important;margin-right:8px!important;background:center/contain no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 62 82'%3E%3Crect x='8' y='6' width='34' height='58' rx='3' fill='%23ff9800'/%3E%3Crect x='14' y='13' width='22' height='14' rx='1' fill='white'/%3E%3Crect x='18' y='17' width='14' height='7' fill='%23173249'/%3E%3Cpath d='M25 34c-6 8-9 14-9 19a10 10 0 0 0 20 0c0-5-5-12-11-19Zm0 9c3 4 5 8 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10Z' fill='%2309243a'/%3E%3Cpath d='M42 16h6l6 7v20c0 6-4 10-9 10h-4v-6h4c2 0 3-2 3-4V26l-6-6Z' fill='%23ff9800'/%3E%3Crect x='5' y='64' width='41' height='5' rx='2' fill='%23ff9800'/%3E%3C/svg%3E")!important}
.logo-box::after{content:"REFUELING\\A CONTROL"!important;white-space:pre!important;display:block!important;color:#fff!important;font:900 20px/1.2 Segoe UI,Arial,sans-serif!important;letter-spacing:.2px!important;text-align:left!important;text-shadow:0 2px 2px rgba(0,0,0,.45)!important}

.unit-type-panel .unit-icon{height:68px!important;display:flex!important;align-items:center!important;justify-content:center!important;margin-top:4px!important}
.unit-type-panel .unit-icon svg{display:block!important;width:112px!important;height:68px!important;max-width:112px!important;max-height:68px!important;filter:drop-shadow(0 3px 3px rgba(0,0,0,.28))!important}

.stock-panel{position:relative!important}
.stock-panel .stock-total{position:absolute!important;top:112px!important;bottom:auto!important;left:76%!important;right:auto!important;transform:translateX(-50%)!important;width:118px!important;text-align:center!important;margin:0!important;z-index:8!important}
.stock-panel .stock-total>small{display:block!important;color:#fff!important;font-size:12px!important;font-weight:900!important;margin:0 0 5px!important}
.stock-panel .stock-orb{width:82px!important;height:82px!important;margin:0 auto!important}

.shift-panel{overflow:hidden!important}
.shift-panel .shift-content{grid-template-columns:minmax(0,1.2fr) minmax(120px,.8fr)!important;gap:2px!important;align-items:center!important}
.shift-panel .donut{height:250px!important;min-height:250px!important}
.shift-panel .shift-legend{gap:12px!important;padding-left:2px!important}
.shift-panel .shift-item small{font-size:11px!important;line-height:1.15!important}
.shift-panel .shift-item strong{font-size:18px!important;margin:3px 0!important;line-height:1.05!important}
.shift-panel .shift-item span{font-size:10px!important}

@media(max-width:768px){
  .logo-box,.logo-box.v783-brand-box{width:190px!important;height:82px!important;min-height:82px!important;margin:0 auto 8px!important}
  .logo-box::before{width:42px!important;height:60px!important;flex-basis:42px!important;margin-right:7px!important}
  .logo-box::after{font-size:16px!important}
  .unit-type-panel .unit-icon{height:64px!important}.unit-type-panel .unit-icon svg{width:105px!important;height:64px!important}
  .stock-panel{padding-bottom:12px!important}
  .stock-panel .stock-cols>div+div{border-left:0!important;padding-left:0!important;border-top:1px solid #38526b!important;padding-top:10px!important}
  .stock-panel .stock-total.v783-stock-mobile{position:static!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;transform:none!important;width:100%!important;margin:8px 0 0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:0!important}
  .stock-panel .stock-total.v783-stock-mobile>small{font-size:12px!important;margin-bottom:5px!important}
  .stock-panel .stock-total.v783-stock-mobile .stock-orb{width:86px!important;height:86px!important;min-width:86px!important}
  .shift-panel{min-height:310px!important;padding-bottom:10px!important}
  .shift-panel .shift-content{display:grid!important;grid-template-columns:minmax(0,1fr) 122px!important;gap:2px!important;align-items:center!important;min-height:225px!important}
  .shift-panel .donut{height:215px!important;min-height:215px!important;width:100%!important}
  .shift-panel .shift-legend{display:grid!important;grid-template-columns:1fr!important;gap:7px!important;min-width:0!important}
  .shift-panel .shift-item{grid-template-columns:10px minmax(0,1fr)!important;gap:5px!important}
  .shift-panel .shift-item small{font-size:10px!important;white-space:normal!important}
  .shift-panel .shift-item strong{font-size:16px!important;white-space:normal!important}
  .shift-panel .shift-item span{font-size:9px!important;white-space:normal!important}
}
@media(max-width:420px){
  .shift-panel .shift-content{grid-template-columns:minmax(0,1fr) 108px!important}
  .shift-panel .donut{height:205px!important;min-height:205px!important}
  .shift-panel .shift-item strong{font-size:15px!important}
}
`;

applyV783();
try{if(typeof renderAll==='function'&&!renderAll.__v783){const old=renderAll;const f=function(...a){const r=old.apply(this,a);queueMicrotask(applyV783);return r};f.__v783=true;renderAll=f}}catch(_){}
try{if(typeof applyFilters==='function'&&!applyFilters.__v783){const old=applyFilters;const f=function(...a){const r=old.apply(this,a);queueMicrotask(applyV783);return r};f.__v783=true;applyFilters=f}}catch(_){}
window.addEventListener('pageshow',applyV783);
window.addEventListener('resize',()=>requestAnimationFrame(applyV783));
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>queueMicrotask(applyV783)));
setTimeout(applyV783,250);setTimeout(applyV783,1200);setTimeout(applyV783,3200);
})();