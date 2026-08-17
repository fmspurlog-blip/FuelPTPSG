(()=>{
'use strict';

function installBrand(){
  const box=document.querySelector('.logo-box');
  if(!box)return;
  box.classList.add('v78-final-brand');
  box.innerHTML=`<div class="v78-refuel-brand" aria-label="Refueling Control">
    <svg class="v78-fuelgun" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M23 8h28a6 6 0 0 1 6 6v42H17V14a6 6 0 0 1 6-6Z" fill="#1687f8"/>
      <rect x="25" y="17" width="24" height="16" rx="2" fill="#dff1ff"/>
      <path d="M57 20h7l9 10v22c0 8-4 13-11 13-7 0-11-5-11-13v-8h7v8c0 4 1 6 4 6s4-2 4-6V33l-9-10Z" fill="#ff9b25"/>
      <rect x="12" y="56" width="50" height="10" rx="2" fill="#0b5ca8"/>
      <circle cx="37" cy="45" r="5" fill="#fff"/>
    </svg>
    <div class="v78-refuel-title">REFUELING CONTROL</div>
  </div>`;
}

function restoreUnitIcons(){
  const icons=document.querySelectorAll('.unit-type-panel .unit-icon');
  if(icons[0])icons[0].innerHTML='<img src="excavator-icon.svg?v=78-final2" alt="Excavator" loading="eager">';
  if(icons[1])icons[1].innerHTML='<img src="gears-icon.svg?v=78-final2" alt="General Support" loading="eager">';
}

function refineStock(){
  const label=document.querySelector('.stock-panel .stock-total>small');
  if(label)label.textContent='TOTAL STOCK';
}

function refineShiftMix(){
  try{
    if(typeof centerText!=='undefined'&&centerText){
      centerText.afterDraw=function(c,args,opts){
        if(!opts||!opts.text)return;
        const {ctx,chartArea:{left,right,top,bottom}}=c;
        ctx.save();
        ctx.textAlign='center';
        ctx.fillStyle='#fff';
        ctx.font='800 21px Segoe UI';
        ctx.fillText(opts.text,(left+right)/2,(top+bottom)/2-3);
        ctx.fillStyle='#d5e2ef';
        ctx.font='700 11px Segoe UI';
        ctx.fillText(opts.sub||'',(left+right)/2,(top+bottom)/2+17);
        ctx.restore();
      };
    }
    if(typeof state!=='undefined'&&state.charts?.shift){
      const c=state.charts.shift;
      c.options.radius='92%';
      c.options.cutout='64%';
      c.resize();
      c.update('none');
    }
  }catch(e){console.warn('V78 shift refine',e)}
}

function apply(){
  installBrand();
  restoreUnitIcons();
  refineStock();
  refineShiftMix();
}

let s=document.getElementById('v78-final-ui-style');
if(!s){s=document.createElement('style');s.id='v78-final-ui-style';document.head.appendChild(s)}
s.textContent=`
/* Permanent Refueling Control identity - actual DOM, no pseudo-elements */
.logo-box.v78-final-brand{background:linear-gradient(135deg,#071b2c,#0d304a)!important;display:flex!important;align-items:center!important;justify-content:center!important;min-height:76px!important;height:76px!important;overflow:hidden!important;border-radius:8px!important;padding:4px!important;box-sizing:border-box!important}
.v78-refuel-brand{width:100%;height:100%;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:1px!important;visibility:visible!important;opacity:1!important}
.v78-fuelgun{display:block!important;width:44px!important;height:44px!important;flex:0 0 44px!important;visibility:visible!important;opacity:1!important}
.v78-refuel-title{display:block!important;color:#fff!important;font:900 11px/1.05 Segoe UI,Arial,sans-serif!important;letter-spacing:.5px!important;text-align:center!important;white-space:nowrap!important;visibility:visible!important;opacity:1!important}

/* Fuel stock final layout */
.stock-panel{position:relative!important;padding-bottom:12px!important}
.stock-panel .stock-total{position:absolute!important;top:124px!important;bottom:auto!important;left:76%!important;right:auto!important;transform:translateX(-50%)!important;width:118px!important;margin:0!important;text-align:center!important;z-index:8!important}
.stock-panel .stock-total>small{display:block!important;color:#fff!important;font-size:12px!important;font-weight:900!important;letter-spacing:.2px!important;margin:0 0 5px!important}
.stock-panel .stock-orb{width:82px!important;height:82px!important;margin:0 auto!important}
.stock-panel .stock-orb strong{font-size:17px!important}
.stock-panel .stock-orb span{font-size:9px!important}

/* Shift Mix: larger, legend closer to donut */
.shift-panel .shift-content{display:flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;min-height:168px!important;overflow:hidden!important}
.shift-panel .chart.donut{width:158px!important;height:158px!important;min-width:158px!important;min-height:158px!important;max-width:158px!important;max-height:158px!important;flex:0 0 158px!important}
.shift-panel #shiftChart{width:158px!important;height:158px!important;max-width:158px!important;max-height:158px!important}
.shift-panel .shift-legend{min-width:0!important;max-width:132px!important;margin-left:-2px!important;transform:translateX(-5px)!important}
.shift-panel .shift-item{gap:6px!important}
.shift-panel .shift-item small{font-size:10px!important;font-weight:900!important;color:#fff!important}
.shift-panel .shift-item strong{font-size:15px!important;line-height:1.1!important;color:#fff!important}
.shift-panel .shift-item strong span{font-size:9px!important}
.shift-panel .shift-item>div>span{font-size:9px!important;color:#7fc0ff!important}

/* Restore professional production/support icons */
.unit-type-panel .unit-icon{height:58px!important;display:flex!important;align-items:center!important;justify-content:center!important}
.unit-type-panel .unit-icon img{display:block!important;max-width:92px!important;max-height:58px!important;width:auto!important;height:auto!important;object-fit:contain!important;opacity:1!important;visibility:visible!important}

@media(max-width:768px){
 .logo-box.v78-final-brand{min-height:64px!important;height:64px!important}
 .v78-fuelgun{width:36px!important;height:36px!important;flex-basis:36px!important}
 .v78-refuel-title{font-size:9px!important}
 .stock-panel .stock-total{top:122px!important;left:75%!important}
 .shift-panel .chart.donut,.shift-panel #shiftChart{width:142px!important;height:142px!important;min-width:142px!important;min-height:142px!important;max-width:142px!important;max-height:142px!important;flex-basis:142px!important}
 .shift-panel .shift-content{gap:2px!important}
 .shift-panel .shift-legend{transform:translateX(-4px)!important}
}
`;

apply();
[250,1200].forEach(t=>setTimeout(apply,t));
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>requestAnimationFrame(apply)));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>requestAnimationFrame(apply)));
window.addEventListener('pageshow',apply);
})();
