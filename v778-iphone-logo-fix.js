(()=>{
'use strict';
const style=document.createElement('style');
style.id='v778-iphone-logo-style';
style.textContent=`
.logo-box{position:relative!important;background:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}
.logo-box::before{content:'PRIMA'!important;display:flex!important;align-items:center!important;justify-content:center!important;position:absolute!important;inset:0!important;z-index:999!important;color:#0a5da8!important;font-family:Arial,Helvetica,sans-serif!important;font-size:32px!important;font-weight:900!important;font-style:italic!important;letter-spacing:-1px!important;line-height:1!important;text-shadow:none!important;opacity:1!important;visibility:visible!important;-webkit-text-fill-color:#0a5da8!important}
.logo-box::after{content:''!important;position:absolute!important;left:15%!important;right:15%!important;bottom:15%!important;height:3px!important;background:linear-gradient(90deg,#0a5da8 0 70%,#e74332 70% 82%,#f5a623 82% 100%)!important;z-index:1000!important;border-radius:2px!important}
.logo-box>*{position:relative!important;z-index:1001!important}
@media(max-width:768px){.logo-box{width:140px!important;height:56px!important;min-height:56px!important}.logo-box::before{font-size:28px!important}.logo-box::after{bottom:12%!important}}
`;
document.head.appendChild(style);

function guaranteeLogo(){
  const box=document.querySelector('.logo-box');
  if(!box)return;
  box.setAttribute('aria-label','PRIMA - PT Prima Sarana Gemilang');
  box.style.setProperty('background','#fff','important');
  box.style.setProperty('visibility','visible','important');
  box.style.setProperty('opacity','1','important');
}

guaranteeLogo();
new MutationObserver(guaranteeLogo).observe(document.documentElement,{subtree:true,childList:true,attributes:true});
window.addEventListener('pageshow',guaranteeLogo);
window.addEventListener('orientationchange',()=>setTimeout(guaranteeLogo,50));
})();
