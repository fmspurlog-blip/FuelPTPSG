(()=>{
'use strict';

const BRAND_HTML='<div class="v78-brand-lock"><div class="v78-brand-main">REFUELING CONTROL</div><div class="v78-brand-sub">FUEL OPERATIONS DASHBOARD</div><div class="v78-brand-site">PT PRIMA SARANA GEMILANG · SITE ABM - LUWUK</div></div>';

function ensureBrand(){
  const box=document.querySelector('.logo-box');
  if(!box)return;
  box.className='logo-box v78-brand-panel';
  if(!box.querySelector('.v78-brand-lock')) box.innerHTML=BRAND_HTML;
}

function ensureUnitIcons(){
  const icons=document.querySelectorAll('.unit-type-panel .unit-icon');
  if(icons[0]&&!icons[0].querySelector('.v78-excavator')){
    icons[0].innerHTML=`<svg class="v78-excavator" viewBox="0 0 160 86" aria-label="Mining Excavator" role="img">
      <defs><linearGradient id="excBody" x1="0" x2="1"><stop offset="0" stop-color="#ff9a22"/><stop offset="1" stop-color="#ffc04d"/></linearGradient></defs>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="18" y="63" width="64" height="13" rx="6.5" fill="#91a8bb" stroke="#c7d5e0" stroke-width="2"/>
        <circle cx="33" cy="69.5" r="4" fill="#0a2134"/><circle cx="51" cy="69.5" r="4" fill="#0a2134"/><circle cx="69" cy="69.5" r="4" fill="#0a2134"/>
        <path d="M35 60V34h31l14 17v9H35Z" fill="url(#excBody)" stroke="#ffb13d" stroke-width="2.5"/>
        <path d="M44 40h14v12H44z" fill="#d9efff" stroke="#a6c8df" stroke-width="2"/>
        <path d="M78 49 103 29l8 5-18 25" stroke="#ffae31" stroke-width="7"/>
        <path d="M109 34 133 47l-7 7-26-7" stroke="#ffae31" stroke-width="7"/>
        <path d="M128 51h21l-5 14h-20z" fill="#ff9b23" stroke="#ffb13d" stroke-width="2.5"/>
      </g>
    </svg>`;
  }
  if(icons[1]&&!icons[1].querySelector('.v78-gears')){
    icons[1].innerHTML=`<svg class="v78-gears" viewBox="0 0 150 86" aria-label="General Support" role="img">
      <defs><linearGradient id="gearFill" x1="0" x2="1"><stop offset="0" stop-color="#f4f8fb"/><stop offset="1" stop-color="#9fb6c8"/></linearGradient></defs>
      <g fill="url(#gearFill)" stroke="#7892a8" stroke-width="2">
        <g transform="translate(48 45)"><circle r="18"/><circle r="7" fill="#0b2236"/><path d="M-5-29h10l3 10-8 4-8-4zM-5 29h10l3-10-8-4-8 4zM-29-5v10l10 3 4-8-4-8zM29-5v10l-10 3-4-8 4-8z"/></g>
        <g transform="translate(88 31) scale(.78)"><circle r="18"/><circle r="7" fill="#0b2236"/><path d="M-5-29h10l3 10-8 4-8-4zM-5 29h10l3-10-8-4-8 4zM-29-5v10l10 3 4-8-4-8zM29-5v10l-10 3-4-8 4-8z"/></g>
        <g transform="translate(101 59) scale(.62)"><circle r="18"/><circle r="7" fill="#0b2236"/><path d="M-5-29h10l3 10-8 4-8-4zM-5 29h10l3-10-8-4-8 4zM-29-5v10l10 3 4-8-4-8zM29-5v10l-10 3-4-8 4-8z"/></g>
      </g>
    </svg>`;
  }
}

function refineStock(){
  const label=document.querySelector('.stock-panel .stock-total>small');
  if(label)label.textContent='TOTAL STOCK';
}

function refineShiftMix(){
  try{
    if(typeof state!=='undefined'&&state.charts?.shift){
      const c=state.charts.shift;
      c.options.radius='92%';
      c.options.cutout='64%';
      c.resize();
      c.update('none');
    }
  }catch(e){console.warn('V78 shift refine',e)}
}

function applyFinalUI(){
  ensureBrand();
  ensureUnitIcons();
  refineStock();
  refineShiftMix();
}

let style=document.getElementById('v78-final-ui-style');
if(!style){style=document.createElement('style');style.id='v78-final-ui-style';document.head.appendChild(style)}
style.textContent=`
.logo-box.v78-brand-panel{display:flex!important;align-items:center!important;justify-content:center!important;min-height:78px!important;height:78px!important;padding:8px 10px!important;box-sizing:border-box!important;overflow:hidden!important;border-radius:8px!important;background:linear-gradient(145deg,#071a2b 0%,#0a2b44 100%)!important;border:1px solid #1d4a6a!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important}
.v78-brand-lock{width:100%!important;text-align:center!important;display:block!important;opacity:1!important;visibility:visible!important;color:#fff!important}
.v78-brand-main{display:block!important;color:#fff!important;font:900 17px/1.05 'Segoe UI',Arial,sans-serif!important;letter-spacing:.8px!important;white-space:nowrap!important;text-shadow:0 1px 0 #000!important}
.v78-brand-sub{display:block!important;margin-top:5px!important;color:#ffad32!important;font:800 8px/1 'Segoe UI',Arial,sans-serif!important;letter-spacing:1.1px!important;white-space:nowrap!important}
.v78-brand-site{display:block!important;margin-top:5px!important;color:#a9bfd0!important;font:700 7px/1 'Segoe UI',Arial,sans-serif!important;letter-spacing:.15px!important;white-space:nowrap!important}
.unit-type-panel .unit-icon{height:62px!important;display:flex!important;align-items:center!important;justify-content:center!important}
.unit-type-panel .unit-icon svg{display:block!important;width:108px!important;height:62px!important;max-width:108px!important;max-height:62px!important;opacity:1!important;visibility:visible!important;filter:drop-shadow(0 3px 4px rgba(0,0,0,.28))!important}
.stock-panel{position:relative!important;padding-bottom:12px!important}.stock-panel .stock-total{position:absolute!important;top:124px!important;bottom:auto!important;left:76%!important;right:auto!important;transform:translateX(-50%)!important;width:118px!important;margin:0!important;text-align:center!important;z-index:8!important}.stock-panel .stock-total>small{display:block!important;color:#fff!important;font-size:12px!important;font-weight:900!important;margin:0 0 5px!important}.stock-panel .stock-orb{width:82px!important;height:82px!important;margin:0 auto!important}
.shift-panel .shift-content{display:flex!important;align-items:center!important;justify-content:center!important;gap:3px!important;min-height:168px!important;overflow:hidden!important}.shift-panel .chart.donut,.shift-panel #shiftChart{width:158px!important;height:158px!important;min-width:158px!important;min-height:158px!important;max-width:158px!important;max-height:158px!important;flex:0 0 158px!important}.shift-panel .shift-legend{min-width:0!important;max-width:132px!important;margin-left:-8px!important;transform:translateX(-6px)!important}.shift-panel .shift-item small{font-size:10px!important;font-weight:900!important;color:#fff!important}.shift-panel .shift-item strong{font-size:15px!important;line-height:1.1!important;color:#fff!important}.shift-panel .shift-item>div>span{font-size:9px!important;color:#7fc0ff!important}
@media(max-width:768px){.logo-box.v78-brand-panel{min-height:68px!important;height:68px!important;padding:7px!important}.v78-brand-main{font-size:13px!important}.v78-brand-sub{font-size:6.5px!important}.v78-brand-site{font-size:5.8px!important}.unit-type-panel .unit-icon svg{width:94px!important;height:56px!important}.stock-panel .stock-total{top:122px!important;left:75%!important}.shift-panel .chart.donut,.shift-panel #shiftChart{width:142px!important;height:142px!important;min-width:142px!important;min-height:142px!important;max-width:142px!important;max-height:142px!important;flex-basis:142px!important}}
`;

applyFinalUI();
setTimeout(applyFinalUI,250);
setTimeout(applyFinalUI,1200);
setTimeout(applyFinalUI,3000);

const brandBox=document.querySelector('.logo-box');
if(brandBox){
  const observer=new MutationObserver(()=>{
    if(!brandBox.querySelector('.v78-brand-lock')) ensureBrand();
  });
  observer.observe(brandBox,{childList:true,subtree:true});
}

document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>requestAnimationFrame(applyFinalUI)));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>requestAnimationFrame(applyFinalUI)));
window.addEventListener('pageshow',applyFinalUI);
})();
