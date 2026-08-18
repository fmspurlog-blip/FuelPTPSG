(()=>{
'use strict';

function installBrand(){
  const box=document.querySelector('.logo-box');
  if(!box)return;
  // Absolute simplest/most compatible branding: plain text directly on the visible box.
  box.className='logo-box v78-final-brand';
  box.replaceChildren(document.createTextNode('REFUELING CONTROL'));
  const css={
    display:'flex',alignItems:'center',justifyContent:'center',
    background:'linear-gradient(135deg,#071b2c,#0d304a)',
    minHeight:'76px',height:'76px',overflow:'hidden',borderRadius:'8px',
    padding:'0 10px',boxSizing:'border-box',color:'#ffffff',
    fontFamily:'Segoe UI,Arial,sans-serif',fontSize:'18px',fontWeight:'900',
    letterSpacing:'1px',lineHeight:'1',textAlign:'center',whiteSpace:'nowrap',
    opacity:'1',visibility:'visible',textIndent:'0'
  };
  Object.entries(css).forEach(([k,v])=>box.style.setProperty(k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()),v,'important'));
}

function productionSvg(){return `<svg viewBox="0 0 150 82" role="img" aria-label="Mining Excavator">
  <defs><linearGradient id="exBody" x1="0" x2="1"><stop stop-color="#ffc247"/><stop offset="1" stop-color="#f58a1f"/></linearGradient><linearGradient id="exTrack"><stop stop-color="#a9bed0"/><stop offset="1" stop-color="#607d95"/></linearGradient></defs>
  <g stroke-linecap="round" stroke-linejoin="round">
    <rect x="15" y="59" width="60" height="13" rx="6.5" fill="url(#exTrack)" stroke="#d7e4ee" stroke-width="2"/>
    <circle cx="29" cy="65.5" r="4.7" fill="#0a1b2a"/><circle cx="47" cy="65.5" r="4.7" fill="#0a1b2a"/><circle cx="64" cy="65.5" r="4.7" fill="#0a1b2a"/>
    <path d="M33 56V31h31l16 16v9H33Z" fill="url(#exBody)" stroke="#ffd783" stroke-width="2.5"/>
    <path d="M41 37h16v12H41z" fill="#dceefa" stroke="#8fb3ca" stroke-width="1.5"/>
    <path d="M63 33 82 39l24 18" fill="none" stroke="#f6a52c" stroke-width="7"/>
    <path d="M105 56 128 61l-9 12-21-2" fill="#f19022" stroke="#ffc45b" stroke-width="2"/>
    <path d="M75 55h27" stroke="#ffe2a3" stroke-width="3"/>
  </g></svg>`}

function supportSvg(){return `<svg viewBox="0 0 150 82" role="img" aria-label="General Support Gears">
  <defs><linearGradient id="gearFill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eef6fb"/><stop offset="1" stop-color="#9db7ca"/></linearGradient></defs>
  <g fill="url(#gearFill)" stroke="#d9e8f2" stroke-width="1.5">
    <g transform="translate(47 43)"><path d="M-7-27h14l3 9 9-4 10 10-4 9 9 3v14l-9 3 4 9-10 10-9-4-3 9H-7l-3-9-9 4-10-10 4-9-9-3V0l9-3-4-9 10-10 9 4z"/><circle r="10" fill="#17344a" stroke="#7fa1b8" stroke-width="2"/></g>
    <g transform="translate(91 28) scale(.72)"><path d="M-7-27h14l3 9 9-4 10 10-4 9 9 3v14l-9 3 4 9-10 10-9-4-3 9H-7l-3-9-9 4-10-10 4-9-9-3V0l9-3-4-9 10-10 9 4z"/><circle r="10" fill="#17344a" stroke="#7fa1b8" stroke-width="2"/></g>
    <g transform="translate(104 61) scale(.58)"><path d="M-7-27h14l3 9 9-4 10 10-4 9 9 3v14l-9 3 4 9-10 10-9-4-3 9H-7l-3-9-9 4-10-10 4-9-9-3V0l9-3-4-9 10-10 9 4z"/><circle r="10" fill="#17344a" stroke="#7fa1b8" stroke-width="2"/></g>
  </g></svg>`}

function restoreUnitIcons(){
  const icons=document.querySelectorAll('.unit-type-panel .unit-icon');
  if(icons[0])icons[0].innerHTML=productionSvg();
  if(icons[1])icons[1].innerHTML=supportSvg();
}

function refineStock(){const label=document.querySelector('.stock-panel .stock-total>small');if(label)label.textContent='TOTAL STOCK';}
function refineShiftMix(){try{if(typeof state!=='undefined'&&state.charts?.shift){const c=state.charts.shift;c.options.radius='92%';c.options.cutout='64%';c.resize();c.update('none')}}catch(e){console.warn('V78 shift refine',e)}}
function apply(){installBrand();restoreUnitIcons();refineStock();refineShiftMix();}

let s=document.getElementById('v78-final-ui-style');if(!s){s=document.createElement('style');s.id='v78-final-ui-style';document.head.appendChild(s)}
s.textContent=`
.logo-box.v78-final-brand{display:flex!important;align-items:center!important;justify-content:center!important;background:linear-gradient(135deg,#071b2c,#0d304a)!important;color:#fff!important;min-height:76px!important;height:76px!important;overflow:hidden!important;border-radius:8px!important;padding:0 10px!important;box-sizing:border-box!important;font:900 18px/1 Segoe UI,Arial,sans-serif!important;letter-spacing:1px!important;text-align:center!important;white-space:nowrap!important;text-indent:0!important;opacity:1!important;visibility:visible!important}
.unit-type-panel .unit-icon{height:62px!important;display:flex!important;align-items:center!important;justify-content:center!important}.unit-type-panel .unit-icon svg{display:block!important;width:110px!important;height:62px!important;max-width:110px!important;max-height:62px!important;opacity:1!important;visibility:visible!important;overflow:visible!important}
.stock-panel{position:relative!important;padding-bottom:12px!important}.stock-panel .stock-total{position:absolute!important;top:124px!important;bottom:auto!important;left:76%!important;right:auto!important;transform:translateX(-50%)!important;width:118px!important;margin:0!important;text-align:center!important;z-index:8!important}.stock-panel .stock-total>small{display:block!important;color:#fff!important;font-size:12px!important;font-weight:900!important;margin:0 0 5px!important}.stock-panel .stock-orb{width:82px!important;height:82px!important;margin:0 auto!important}
.shift-panel .shift-content{display:flex!important;align-items:center!important;justify-content:center!important;gap:3px!important;min-height:168px!important;overflow:hidden!important}.shift-panel .chart.donut,.shift-panel #shiftChart{width:158px!important;height:158px!important;min-width:158px!important;min-height:158px!important;max-width:158px!important;max-height:158px!important;flex:0 0 158px!important}.shift-panel .shift-legend{min-width:0!important;max-width:132px!important;margin-left:-6px!important;transform:translateX(-4px)!important}.shift-panel .shift-item small{font-size:10px!important;font-weight:900!important;color:#fff!important}.shift-panel .shift-item strong{font-size:15px!important;line-height:1.1!important;color:#fff!important}.shift-panel .shift-item>div>span{font-size:9px!important;color:#7fc0ff!important}
@media(max-width:768px){.logo-box.v78-final-brand{min-height:64px!important;height:64px!important;font-size:14px!important}.stock-panel .stock-total{top:122px!important;left:75%!important}.shift-panel .chart.donut,.shift-panel #shiftChart{width:142px!important;height:142px!important;min-width:142px!important;min-height:142px!important;max-width:142px!important;max-height:142px!important;flex-basis:142px!important}}
`;

apply();setTimeout(apply,200);setTimeout(apply,900);document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>requestAnimationFrame(apply)));['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>requestAnimationFrame(apply)));window.addEventListener('pageshow',apply);
})();
