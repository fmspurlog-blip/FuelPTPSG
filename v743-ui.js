(()=>{
'use strict';
const VER='743';
const root=new URL('.',location.href);
const asset=name=>new URL(name,root).href+'?v='+VER;

function css(){
 if(document.getElementById('v743-ui-style'))return;
 const s=document.createElement('style');s.id='v743-ui-style';s.textContent=`
.logo-box{background:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:6px 10px!important;min-height:58px!important;overflow:hidden!important}
.logo-box img.v741-logo{display:block!important;visibility:visible!important;opacity:1!important;width:176px!important;max-width:94%!important;height:50px!important;object-fit:contain!important;object-position:center!important;background:transparent!important;filter:none!important;box-shadow:none!important}
.logo-box .v743-logo-fallback{display:none!important;color:#1169b6!important;font-size:29px!important;font-weight:950!important;font-style:italic!important;letter-spacing:1px!important}
.logo-box.v743-logo-error img{display:none!important}.logo-box.v743-logo-error .v743-logo-fallback{display:block!important}
.unit-type-panel .unit-types{height:132px!important;display:grid!important;grid-template-columns:1fr 1fr!important;align-items:stretch!important;overflow:visible!important}
.unit-type-panel .unit-types>div{display:grid!important;grid-template-rows:18px 62px 23px 15px 18px!important;align-items:center!important;justify-items:center!important;min-width:0!important;padding:0 8px!important;box-sizing:border-box!important;overflow:visible!important}
.unit-type-panel .unit-types>div>small{display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:5!important;margin:0!important;color:#d4dfeb!important;font-size:9px!important;line-height:18px!important;font-weight:800!important;white-space:nowrap!important;text-transform:uppercase!important}
.unit-type-panel .unit-icon{height:62px!important;min-height:62px!important;max-height:62px!important;width:100%!important;margin:0!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:visible!important;position:relative!important;z-index:1!important;background:transparent!important}
.unit-type-panel .unit-icon img{display:block!important;visibility:visible!important;opacity:1!important;width:auto!important;height:auto!important;object-fit:contain!important;margin:0 auto!important;background:transparent!important;filter:drop-shadow(0 4px 5px rgba(0,0,0,.38))!important}
.unit-type-panel .unit-types>div:first-child .unit-icon img{max-width:116px!important;max-height:60px!important}
.unit-type-panel .unit-types>div:nth-child(2) .unit-icon img{max-width:88px!important;max-height:58px!important}
.unit-type-panel .unit-types strong{display:block!important;position:relative!important;z-index:5!important;margin:0!important;line-height:23px!important;font-size:18px!important;color:#fff!important;text-shadow:0 2px 3px #000!important;white-space:nowrap!important}
.unit-type-panel .unit-types strong+span{display:block!important;position:relative!important;z-index:5!important;line-height:15px!important;font-size:9px!important;color:#fff!important;margin:0!important}
.unit-type-panel .unit-types b{display:block!important;position:relative!important;z-index:5!important;line-height:18px!important;font-size:10px!important;color:#fff!important;margin:0!important}
@media(max-width:1200px){.unit-type-panel .unit-types>div{padding:0 3px!important}.unit-type-panel .unit-types>div:first-child .unit-icon img{max-width:98px!important}.unit-type-panel .unit-types>div:nth-child(2) .unit-icon img{max-width:76px!important}.unit-type-panel .unit-types strong{font-size:16px!important}}
`;
 document.head.appendChild(s);
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