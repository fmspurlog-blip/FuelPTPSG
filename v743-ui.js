(()=>{
'use strict';
const VER='744';
const root=new URL('.',location.href);
const asset=name=>new URL(name,root).href+'?v='+VER;

function css(){
 let s=document.getElementById('v743-ui-style');
 if(!s){s=document.createElement('style');s.id='v743-ui-style';document.head.appendChild(s);}
 s.textContent=`
.logo-box{background:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:4px 7px!important;min-height:66px!important;overflow:hidden!important;border-radius:8px!important}
.logo-box img.v741-logo{display:block!important;visibility:visible!important;opacity:1!important;width:194px!important;max-width:98%!important;height:58px!important;object-fit:contain!important;object-position:center!important;background:transparent!important;filter:none!important;box-shadow:none!important}
.logo-box .v743-logo-fallback{display:none!important;color:#1169b6!important;font-size:32px!important;font-weight:950!important;font-style:italic!important;letter-spacing:1px!important}
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
@media(max-width:1350px){.logo-box img.v741-logo{width:184px!important;height:55px!important}.unit-type-panel .unit-types>div{padding:1px 4px!important}.unit-type-panel .unit-types>div:first-child .unit-icon img{max-width:98px!important}.unit-type-panel .unit-types>div:nth-child(2) .unit-icon img{max-width:70px!important}.unit-type-panel .unit-types strong{font-size:14px!important}.unit-type-panel .unit-types b{font-size:8px!important}}
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

function apply(){css();logo();icons();}
apply();
[80,250,600,1200,2200].forEach(t=>setTimeout(apply,t));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>setTimeout(apply,100)));
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>setTimeout(apply,120)));
window.addEventListener('pageshow',apply);
window.addEventListener('resize',()=>setTimeout(apply,80),{passive:true});
})();