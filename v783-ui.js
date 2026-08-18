(()=>{
'use strict';
const fuelGun=`<svg class="v783-fuelgun" viewBox="0 0 62 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="8" y="6" width="34" height="58" rx="4" fill="#ff9800"/><rect x="14" y="13" width="22" height="14" rx="2" fill="#fff"/><rect x="18" y="17" width="14" height="7" rx="1" fill="#173249"/><path d="M25 34c-6 8-9 14-9 19a10 10 0 0 0 20 0c0-5-5-12-11-19Zm0 9c3 4 5 8 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10Z" fill="#09243a"/><path d="M42 16h6l6 7v20c0 6-4 10-9 10h-4v-6h4c2 0 3-2 3-4V26l-6-6Z" fill="#ff9800"/><rect x="5" y="64" width="41" height="5" rx="2" fill="#ff9800"/></svg>`;
const excavator=`<svg viewBox="0 0 170 90" xmlns="http://www.w3.org/2000/svg" aria-label="Excavator"><g stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="65" width="75" height="16" rx="8" fill="#7d93a5" stroke="#bdd0de" stroke-width="2.5"/><circle cx="34" cy="73" r="5" fill="#0a2134"/><circle cx="54" cy="73" r="5" fill="#0a2134"/><circle cx="74" cy="73" r="5" fill="#0a2134"/><path d="M39 63V35h29l15 16v12Z" fill="#ff9c12" stroke="#ffc04b" stroke-width="2.5"/><rect x="48" y="41" width="15" height="12" rx="1.5" fill="#edf8ff" stroke="#9fc7df" stroke-width="2"/><path d="M77 53 100 24l10 5-18 31" fill="none" stroke="#ff9c12" stroke-width="7"/><path d="m106 30 27 17-7 10-28-12" fill="none" stroke="#ff9c12" stroke-width="7"/><path d="M130 50h25l-7 22-26-2Z" fill="#ff9c12" stroke="#ffc04b" stroke-width="2.5"/></g></svg>`;
const gearPath=`M0-26 7-25 10-18 17-20 22-15 20-8 26-4 26 4 20 8 22 15 17 20 10 18 7 25 0 26-4 20-12 22-17 17-15 10-22 7-26 0-25-7-18-10-20-17-15-22-8-20-4-26Z`;
const gears=`<svg class="v783-gears" viewBox="0 0 170 90" xmlns="http://www.w3.org/2000/svg" aria-label="Three gears"><defs><linearGradient id="steelFinal783" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#dce8ef"/><stop offset="1" stop-color="#7892a5"/></linearGradient></defs><g fill="url(#steelFinal783)" stroke="#5d7589" stroke-width="2.2"><g transform="translate(54 52) scale(1.05)"><path d="${gearPath}"/><circle r="10" fill="#17364d" stroke="#9bb0bf"/></g><g transform="translate(103 31) scale(.82)"><path d="${gearPath}"/><circle r="10" fill="#17364d" stroke="#9bb0bf"/></g><g transform="translate(121 66) scale(.64)"><path d="${gearPath}"/><circle r="10" fill="#17364d" stroke="#9bb0bf"/></g></g></svg>`;
const stockHome={parent:null,next:null};

function paintBrand(){
  const box=document.querySelector('.logo-box');
  if(!box)return;
  box.classList.add('v783-brand-box');
  box.innerHTML=`<div class="v783-brand">${fuelGun}<div class="v783-brand-copy"><strong>REFUELING</strong><strong>CONTROL</strong></div></div>`;
}

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

function polishCharts(){
  try{
    const charts=(typeof state!=='undefined'&&state.charts)?state.charts:{};
    ['truck','status'].forEach(name=>{
      const c=charts[name];
      if(!c)return;
      const legend=c.options.plugins.legend;
      legend.display=true;
      legend.position='right';
      legend.labels.color='#ffffff';
      legend.labels.boxWidth=9;
      legend.labels.font={size:9,weight:'700',family:'Segoe UI'};
      c.update('none');
    });
    const shift=charts.shift;
    if(shift){
      shift.options.radius='96%';
      shift.options.cutout='64%';
      if(shift.options.plugins.centerText)shift.options.plugins.centerText.text='';
      const total=(typeof sumFuel==='function'&&state?.filtered)?sumFuel(state.filtered):0;
      shift.options.plugins.v783Center={text:(typeof fmt==='function'?fmt(total):String(total||0)),sub:'Liter'};
      shift.resize();
      shift.update('none');
    }
  }catch(_){ }
}

function applyV783(){
  paintBrand();
  const icons=document.querySelectorAll('.unit-type-panel .unit-icon');
  if(icons[0])icons[0].innerHTML=excavator;
  if(icons[1])icons[1].innerHTML=gears;
  const stockLabel=document.querySelector('.stock-panel .stock-total>small');
  if(stockLabel)stockLabel.textContent='TOTAL STOCK';
  placeStock();
  polishCharts();
}

if(typeof Chart!=='undefined'&&!Chart.registry.plugins.get('v783Center')){
  Chart.register({id:'v783Center',afterDraw(c,args,opts){
    if(!opts||!opts.text)return;
    const {ctx,chartArea:{left,right,top,bottom}}=c;
    ctx.save();
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
    ctx.font='800 25px Segoe UI';ctx.fillText(opts.text,(left+right)/2,(top+bottom)/2-6);
    ctx.fillStyle='#d9e5ef';ctx.font='600 12px Segoe UI';ctx.fillText(opts.sub||'',(left+right)/2,(top+bottom)/2+20);
    ctx.restore();
  }});
}

let st=document.getElementById('v783-ui-style');
if(!st){st=document.createElement('style');st.id='v783-ui-style';document.head.appendChild(st)}
st.textContent=`
.logo-box.v783-brand-box{height:96px!important;min-height:96px!important;padding:8px 10px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;background:linear-gradient(145deg,#061a2b,#092940)!important;border:1px solid #1788d8!important;border-radius:8px!important;box-sizing:border-box!important;overflow:hidden!important}
.logo-box.v783-brand-box::before,.logo-box.v783-brand-box::after{content:none!important;display:none!important}.logo-box.v783-brand-box>*{display:block!important}
.v783-brand{width:100%!important;height:100%!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:12px!important;min-width:0!important}
.v783-fuelgun{display:block!important;flex:0 0 44px!important;width:44px!important;height:62px!important;margin-left:2px!important}
.v783-brand-copy{display:flex!important;flex:1 1 auto!important;min-width:0!important;flex-direction:column!important;justify-content:center!important;align-items:flex-start!important;gap:2px!important;padding-left:1px!important}
.v783-brand-copy strong{display:block!important;color:#fff!important;font:900 15px/1.1 'Segoe UI',Arial,sans-serif!important;letter-spacing:0!important;white-space:nowrap!important;text-shadow:0 2px 2px rgba(0,0,0,.45)!important}
.unit-type-panel .unit-icon{height:70px!important;display:flex!important;align-items:center!important;justify-content:center!important;margin-top:4px!important;font-size:0!important}.unit-type-panel .unit-icon svg{display:block!important;width:116px!important;height:70px!important;filter:drop-shadow(0 3px 3px rgba(0,0,0,.28))!important}.unit-type-panel .unit-types>div:nth-child(2) .unit-icon svg{width:108px!important;height:68px!important;filter:drop-shadow(0 3px 4px rgba(0,0,0,.38)) brightness(1.15)!important}
.stock-panel{position:relative!important}.stock-panel .stock-total{position:absolute!important;top:112px!important;left:76%!important;transform:translateX(-50%)!important;width:118px!important;text-align:center!important;margin:0!important;z-index:8!important}.stock-panel .stock-total>small{display:block!important;color:#fff!important;font-size:12px!important;font-weight:900!important;margin:0 0 5px!important}.stock-panel .stock-orb{width:82px!important;height:82px!important;margin:0 auto!important}
.shift-panel{overflow:hidden!important}.shift-panel .title h3{font-size:22px!important;line-height:1.05!important}.shift-panel .shift-content{display:grid!important;grid-template-columns:minmax(0,1.45fr) minmax(125px,.55fr)!important;gap:2px!important;align-items:center!important;min-height:255px!important}.shift-panel .donut{height:315px!important;min-height:315px!important;width:100%!important}.shift-panel .shift-legend{gap:8px!important;min-width:0!important;transform:translateX(-6px)!important}.shift-panel .shift-item{grid-template-columns:12px minmax(0,1fr)!important;gap:7px!important}.shift-panel .shift-item small{font-size:13px!important;color:#fff!important;line-height:1.1!important}.shift-panel .shift-item strong{font-size:22px!important;line-height:1.05!important;margin:4px 0!important;color:#fff!important}.shift-panel .shift-item strong span{font-size:11px!important;color:#fff!important}.shift-panel .shift-item>div>span{font-size:10px!important;color:#87c7ff!important}
.row-middle .panel:nth-child(3) canvas,.row-middle .panel:nth-child(4) canvas{filter:none!important}.row-middle .panel:nth-child(3),.row-middle .panel:nth-child(4){color:#fff!important}.row-middle .panel:nth-child(3) .title span,.row-middle .panel:nth-child(4) .title span{color:#ffb12d!important}
@media(max-width:768px){
.logo-box.v783-brand-box{width:190px!important;height:82px!important;min-height:82px!important;margin:0 auto 8px!important;padding:7px 9px!important}.v783-brand{gap:10px!important}.v783-fuelgun{flex-basis:40px!important;width:40px!important;height:58px!important}.v783-brand-copy strong{font-size:14px!important}
.stock-panel .stock-cols>div+div{border-left:0!important;padding-left:0!important;border-top:1px solid #38526b!important;padding-top:10px!important}.stock-panel .stock-total.v783-stock-mobile{position:static!important;transform:none!important;width:100%!important;margin:8px 0 0!important;display:flex!important;flex-direction:column!important;align-items:center!important}.stock-panel .stock-total.v783-stock-mobile .stock-orb{width:86px!important;height:86px!important}
.shift-panel{min-height:365px!important}.shift-panel .shift-content{grid-template-columns:minmax(0,1fr) 118px!important;min-height:275px!important}.shift-panel .donut{height:272px!important;min-height:272px!important}.shift-panel .shift-legend{transform:translateX(-2px)!important}.shift-panel .shift-item small{font-size:11px!important}.shift-panel .shift-item strong{font-size:18px!important}.shift-panel .shift-item strong span{font-size:9px!important}.shift-panel .shift-item>div>span{font-size:9px!important}}
@media(max-width:420px){.shift-panel .shift-content{grid-template-columns:minmax(0,1fr) 106px!important}.shift-panel .donut{height:255px!important;min-height:255px!important}.shift-panel .shift-item strong{font-size:17px!important}}
`;

function refreshOnce(){applyV783();}
refreshOnce();
window.addEventListener('pageshow',refreshOnce,{passive:true});
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(refreshOnce,80),{passive:true}));
document.getElementById('unitSearch')?.addEventListener('input',()=>{clearTimeout(window.__v783SearchTimer);window.__v783SearchTimer=setTimeout(refreshOnce,140)},{passive:true});
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>setTimeout(refreshOnce,80),{passive:true}));
})();