(()=>{
'use strict';
const VER='745';
const root=new URL('.',location.href);
const asset=name=>new URL(name,root).href+'?v='+VER;

function css(){
 let s=document.getElementById('v743-ui-style');
 if(!s){s=document.createElement('style');s.id='v743-ui-style';document.head.appendChild(s);}
 s.textContent=`
.logo-box{background:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:2px 5px!important;min-height:70px!important;height:70px!important;overflow:hidden!important;border-radius:8px!important}
.logo-box img.v741-logo{display:block!important;visibility:visible!important;opacity:1!important;width:202px!important;max-width:none!important;height:62px!important;object-fit:contain!important;object-position:center!important;background:transparent!important;filter:none!important;box-shadow:none!important;transform:scale(1.38)!important;transform-origin:center center!important}
.logo-box .v743-logo-fallback{display:none!important;color:#1169b6!important;font-size:34px!important;font-weight:950!important;font-style:italic!important;letter-spacing:1px!important}
.logo-box.v743-logo-error img{display:none!important}.logo-box.v743-logo-error .v743-logo-fallback{display:block!important}

.unit-type-panel{overflow:hidden!important}
.unit-type-panel .unit-types{height:128px!important;min-height:128px!important;display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;align-items:stretch!important;overflow:hidden!important}
.unit-type-panel .unit-types>div{display:grid!important;grid-template-rows:18px 55px 21px 14px 16px!important;align-items:center!important;justify-items:center!important;min-width:0!important;padding:1px 7px!important;box-sizing:border-box!important;overflow:hidden!important;position:relative!important}
.unit-type-panel .unit-types>div:first-child{border-right:1px solid rgba(101,135,163,.45)!important}
.unit-type-panel .unit-types>div>small{display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:5!important;margin:0!important;color:#d8e2ed!important;font-size:8px!important;line-height:18px!important;font-weight:900!important;white-space:nowrap!important;text-transform:uppercase!important;letter-spacing:.15px!important}
.unit-type-panel .unit-icon{height:55px!important;min-height:55px!important;max-height:55px!important;width:100%!important;margin:0!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;position:relative!important;z-index:1!important;background:transparent!important}
.unit-type-panel .unit-icon img{display:block!important;visibility:visible!important;opacity:1!important;width:auto!important;height:auto!important;object-fit:contain!important;margin:0 auto!important;background:transparent!important;filter:drop-shadow(0 4px 5px rgba(0,0,0,.38))!important}
.unit-type-panel .unit-types>div:first-child .unit-icon img{max-width:108px!important;max-height:53px!important}
.unit-type-panel .unit-types>div:nth-child(2) .unit-icon img{max-width:76px!important;max-height:52px!important}
.unit-type-panel .unit-types strong{display:block!important;position:relative!important;z-index:5!important;margin:0!important;line-height:21px!important;font-size:15px!important;font-weight:900!important;color:#fff!important;text-shadow:0 2px 3px #000!important;white-space:nowrap!important}
.unit-type-panel .unit-types strong+span{display:block!important;position:relative!important;z-index:5!important;line-height:14px!important;font-size:8px!important;font-weight:700!important;color:#fff!important;margin:0!important}
.unit-type-panel .unit-types b{display:block!important;position:relative!important;z-index:5!important;line-height:16px!important;font-size:8.5px!important;font-weight:900!important;color:#fff!important;margin:0!important;white-space:nowrap!important}

/* Shift Mix: larger donut with balanced legend */
.shift-panel .shift-content{display:grid!important;grid-template-columns:154px minmax(0,1fr)!important;align-items:center!important;gap:12px!important;min-height:158px!important}
.shift-panel .chart.donut{width:150px!important;height:150px!important;min-width:150px!important;min-height:150px!important;margin:0 auto!important}
.shift-panel .shift-legend{min-width:0!important;padding-right:6px!important}
.shift-panel .shift-item{padding:7px 0!important;gap:9px!important}
.shift-panel .shift-dot{width:12px!important;height:12px!important;min-width:12px!important}
.shift-panel .shift-item small{font-size:10px!important;line-height:13px!important;color:#fff!important;font-weight:900!important}
.shift-panel .shift-item strong{font-size:14px!important;line-height:17px!important;color:#fff!important;font-weight:900!important}
.shift-panel .shift-item strong span{font-size:9px!important;color:#fff!important}
.shift-panel .shift-item div>span{font-size:9px!important;color:#d7e3ef!important}

@media(max-width:1350px){
 .logo-box img.v741-logo{width:194px!important;height:60px!important;transform:scale(1.34)!important}
 .unit-type-panel .unit-types>div{padding:1px 4px!important}
 .unit-type-panel .unit-types>div:first-child .unit-icon img{max-width:98px!important}
 .unit-type-panel .unit-types>div:nth-child(2) .unit-icon img{max-width:70px!important}
 .unit-type-panel .unit-types strong{font-size:14px!important}
 .unit-type-panel .unit-types b{font-size:8px!important}
 .shift-panel .shift-content{grid-template-columns:138px minmax(0,1fr)!important;gap:8px!important}
 .shift-panel .chart.donut{width:134px!important;height:134px!important;min-width:134px!important;min-height:134px!important}
 .shift-panel .shift-item strong{font-size:13px!important}
}
`;
}

function logo(){
 const box=document.querySelector('.logo-box');if(!box)return;
 let img=box.querySelector('img.v741-logo');
 if(!img){img=document.createElement('img');img.className='v741-logo';img.alt='PRIMA - PT Prima Sarana Gemilang';img.loading='eager';img.decoding='sync';box.prepend(img);}
 const url=asset('prima-logo.png');
 if(img.dataset.v743src!==url){img.dataset.v743src=url;img.src=url;}
 let fb=box.querySelector('.v743-logo-fallback');if(!fb){fb=document.createElement('span');fb.className='v743-logo-fallback';fb.textContent='PRIMA';box.appendChild(fb);}
 img.onload=()=>box.classList.remove('v743-logo-error');
 img.onerror=()=>box.classList.add('v743-logo-error');
}

function icons(){
 const nodes=document.querySelectorAll('.unit-type-panel .unit-icon');if(nodes.length<2)return;
 const wanted=[['excavator-icon.svg','Excavator Produksi'],['gears-icon.svg','General Support Gears']];
 nodes.forEach((node,i)=>{
   const [file,alt]=wanted[i];let img=node.querySelector('img.v743-unit-icon');
   if(!img){node.replaceChildren();img=document.createElement('img');img.className='v743-unit-icon';img.alt=alt;img.loading='eager';img.decoding='async';node.appendChild(img);}
   const url=asset(file);if(img.dataset.src!==url){img.dataset.src=url;img.src=url;}
 });
}

function categoryChart(){
 try{
  if(typeof state==='undefined'||!state.charts)return;
  const c=state.charts.cat;if(!c)return;
  c.options.layout=c.options.layout||{};
  c.options.layout.padding={top:4,right:88,bottom:2,left:0};
  c.options.scales=c.options.scales||{};
  c.options.scales.x=c.options.scales.x||{};
  const vals=(c.data?.datasets?.[0]?.data||[]).map(Number).filter(Number.isFinite);
  const max=vals.length?Math.max(...vals):0;
  if(max>0)c.options.scales.x.suggestedMax=max*1.34;
  const dl=c.options.plugins?.datalabels;
  if(dl){dl.anchor='end';dl.align='right';dl.clamp=false;dl.clip=false;dl.offset=5;dl.color='#ffffff';dl.font={...(dl.font||{}),size:8,weight:'700'};}
  const ds=c.data?.datasets?.[0];if(ds){ds.maxBarThickness=15;ds.barPercentage=.76;ds.categoryPercentage=.82;}
  c.update('none');
 }catch(e){console.warn('category chart UI patch',e)}
}

function shiftChart(){
 try{
  if(typeof state==='undefined'||!state.charts)return;
  const c=state.charts.shift;if(!c)return;
  c.options.maintainAspectRatio=false;
  c.options.cutout='65%';
  c.options.layout={padding:2};
  if(c.options.plugins?.centerText){c.options.plugins.centerText.text=c.options.plugins.centerText.text||'';}
  c.resize();c.update('none');
 }catch(e){console.warn('shift chart UI patch',e)}
}

function charts(){categoryChart();shiftChart();}
function apply(){css();logo();icons();charts();}
apply();
[80,250,600,1200,2200].forEach(t=>setTimeout(apply,t));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>{setTimeout(apply,90);setTimeout(charts,220);}));
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>setTimeout(apply,120)));
window.addEventListener('pageshow',apply);
window.addEventListener('resize',()=>{setTimeout(apply,100);setTimeout(charts,230);},{passive:true});
})();