(()=>{
'use strict';

function installBrand(){
  const box=document.querySelector('.logo-box');
  if(!box)return;
  box.innerHTML='';
  box.classList.add('v78-final-brand');
}

function restoreUnitIcons(){
  const icons=document.querySelectorAll('.unit-type-panel .unit-icon');
  if(icons[0])icons[0].innerHTML='<img src="excavator-icon.svg?v=78-final" alt="Excavator" loading="eager">';
  if(icons[1])icons[1].innerHTML='<img src="gears-icon.svg?v=78-final" alt="General Support" loading="eager">';
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
/* Permanent app identity: no external logo file */
.logo-box.v78-final-brand{position:relative!important;background:linear-gradient(135deg,#071b2c,#0d304a)!important;display:block!important;min-height:76px!important;height:76px!important;overflow:hidden!important;border-radius:8px!important}
.logo-box.v78-final-brand::before{content:'⛽';position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:32px;line-height:1;display:block!important;opacity:1!important;visibility:visible!important}
.logo-box.v78-final-brand::after{content:'REFUELING CONTROL\\A FUEL MANAGEMENT SYSTEM\\A PT PRIMA SARANA GEMILANG';white-space:pre;position:absolute;left:53px;right:6px;top:15px;color:#fff;font:900 11px/1.18 Segoe UI,Arial,sans-serif;letter-spacing:.25px;display:block!important;opacity:1!important;visibility:visible!important;text-align:left!important}

/* Fuel stock final layout */
.stock-panel{position:relative!important;padding-bottom:12px!important}
.stock-panel .stock-total{position:absolute!important;top:124px!important;bottom:auto!important;left:76%!important;right:auto!important;transform:translateX(-50%)!important;width:118px!important;margin:0!important;text-align:center!important;z-index:8!important}
.stock-panel .stock-total>small{display:block!important;color:#fff!important;font-size:12px!important;font-weight:900!important;letter-spacing:.2px!important;margin:0 0 5px!important}
.stock-panel .stock-orb{width:82px!important;height:82px!important;margin:0 auto!important}
.stock-panel .stock-orb strong{font-size:17px!important}
.stock-panel .stock-orb span{font-size:9px!important}

/* Shift Mix: larger but constrained inside panel */
.shift-panel .shift-content{display:flex!important;align-items:center!important;justify-content:center!important;gap:16px!important;min-height:168px!important;overflow:hidden!important}
.shift-panel .chart.donut{width:158px!important;height:158px!important;min-width:158px!important;min-height:158px!important;max-width:158px!important;max-height:158px!important;flex:0 0 158px!important}
.shift-panel #shiftChart{width:158px!important;height:158px!important;max-width:158px!important;max-height:158px!important}
.shift-panel .shift-legend{min-width:0!important;max-width:145px!important}
.shift-panel .shift-item small{font-size:10px!important;font-weight:900!important;color:#fff!important}
.shift-panel .shift-item strong{font-size:15px!important;line-height:1.1!important;color:#fff!important}
.shift-panel .shift-item strong span{font-size:9px!important}
.shift-panel .shift-item>div>span{font-size:9px!important;color:#7fc0ff!important}

/* Restore professional production/support icons */
.unit-type-panel .unit-icon{height:58px!important;display:flex!important;align-items:center!important;justify-content:center!important}
.unit-type-panel .unit-icon img{display:block!important;max-width:92px!important;max-height:58px!important;width:auto!important;height:auto!important;object-fit:contain!important;opacity:1!important;visibility:visible!important}

@media(max-width:768px){
 .logo-box.v78-final-brand{min-height:64px!important;height:64px!important}
 .logo-box.v78-final-brand::before{left:9px;font-size:27px}
 .logo-box.v78-final-brand::after{left:45px;top:12px;font-size:9px}
 .stock-panel .stock-total{top:122px!important;left:75%!important}
 .shift-panel .chart.donut,.shift-panel #shiftChart{width:142px!important;height:142px!important;min-width:142px!important;min-height:142px!important;max-width:142px!important;max-height:142px!important;flex-basis:142px!important}
}
`;

apply();
[250,1200,3200].forEach(t=>setTimeout(apply,t));
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>requestAnimationFrame(apply)));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>requestAnimationFrame(apply)));
window.addEventListener('pageshow',apply);
})();
