(()=>{
'use strict';
const PASSWORD='PrimaFuel\\@2026';

function ensureStyle(){
  let s=document.getElementById('v748-style');
  if(!s){s=document.createElement('style');s.id='v748-style';document.head.appendChild(s);}
  s.textContent=`
.v749-legend-layout{display:grid!important;grid-template-columns:minmax(120px,1fr) minmax(145px,1.05fr)!important;align-items:center!important;gap:10px!important;width:100%!important;height:100%!important;min-height:132px!important;overflow:visible!important;padding:0 6px!important;box-sizing:border-box!important}
.v749-legend-layout>canvas{grid-column:1!important;width:100%!important;height:132px!important;max-width:160px!important;max-height:160px!important;justify-self:center!important;align-self:center!important}
.v749-html-legend{grid-column:2!important;display:flex!important;flex-direction:column!important;justify-content:center!important;gap:8px!important;min-width:0!important;overflow:visible!important;position:relative!important;z-index:8!important}
.v749-html-legend .row{display:grid!important;grid-template-columns:10px minmax(0,1fr)!important;gap:7px!important;align-items:start!important;color:#fff!important;font-weight:900!important;font-size:10px!important;line-height:1.28!important;text-shadow:0 1px 2px rgba(0,0,0,.65)!important;opacity:1!important;visibility:visible!important}
.v749-html-legend .sw{width:9px!important;height:9px!important;margin-top:2px!important;border-radius:1px!important;display:block!important}
.v749-html-legend .txt,.v749-html-legend .val{color:#fff!important;font-weight:900!important;opacity:1!important;visibility:visible!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important}
@media(max-width:1350px){.v749-legend-layout{grid-template-columns:minmax(105px,.95fr) minmax(125px,1.05fr)!important;gap:7px!important}.v749-legend-layout>canvas{height:120px!important;max-width:140px!important}.v749-html-legend{gap:6px!important}.v749-html-legend .row{font-size:9px!important;gap:5px!important}}
`;
}

function showUploadPassword(){
  if(document.querySelector('.v748-upload-modal'))return;
  const ov=document.createElement('div');ov.className='v741-modal v748-upload-modal';
  ov.innerHTML=`<div class="v741-modal-card"><h3>🔒 Protected Fuel Data Action</h3><p>Masukkan password untuk melanjutkan Upload Excel.</p><input type="password" autocomplete="current-password" placeholder="Password"><p class="v741-error"></p><div class="v741-modal-actions"><button class="v741-cancel" type="button">BATAL</button><button class="v741-unlock" type="button">UNLOCK</button></div></div>`;
  document.body.appendChild(ov);
  const pwd=ov.querySelector('input'),err=ov.querySelector('.v741-error');
  const close=()=>ov.remove();
  const openFile=()=>{
    if(pwd.value!==PASSWORD){err.textContent='Password salah. Akses tidak diberikan.';pwd.select();return;}
    const file=document.getElementById('excelUpload');const label=document.querySelector('label.upload');
    if(!file||!label){err.textContent='Input Excel tidak ditemukan.';return;}
    close();
    const marker=document.createComment('excel-upload-position');
    label.insertBefore(marker,file);document.body.appendChild(file);
    try{file.click();}finally{setTimeout(()=>{if(marker.parentNode){marker.parentNode.insertBefore(file,marker);marker.remove();}},0);}
  };
  ov.querySelector('.v741-cancel').onclick=close;ov.querySelector('.v741-unlock').onclick=openFile;
  pwd.addEventListener('keydown',e=>{if(e.key==='Enter')openFile();if(e.key==='Escape')close();});setTimeout(()=>pwd.focus(),20);
}

window.addEventListener('click',e=>{const label=e.target.closest?.('label.upload');if(!label)return;e.preventDefault();e.stopImmediatePropagation();showUploadPassword();},true);

const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
function buildLegend(chartName,canvasId){
  try{
    if(typeof state==='undefined'||!state.charts)return;
    const c=state.charts[chartName],canvas=document.getElementById(canvasId);if(!c||!canvas)return;
    const wrap=canvas.parentElement;if(!wrap)return;
    wrap.classList.add('v749-legend-layout');
    const plugins=c.options.plugins||(c.options.plugins={});
    const legend=plugins.legend||(plugins.legend={});legend.display=false;
    c.options.layout=c.options.layout||{};c.options.layout.padding={top:2,right:2,bottom:2,left:2};
    let box=wrap.querySelector(`.v749-html-legend[data-chart="${chartName}"]`);
    if(!box){box=document.createElement('div');box.className='v749-html-legend';box.dataset.chart=chartName;wrap.appendChild(box);}
    const labels=c.data?.labels||[],ds=c.data?.datasets?.[0]||{},values=ds.data||[];
    const colors=Array.isArray(ds.backgroundColor)?ds.backgroundColor:labels.map(()=>ds.backgroundColor||'#fff');
    box.innerHTML=labels.map((lab,i)=>`<div class="row"><span class="sw" style="background:${colors[i]||'#fff'}"></span><span class="txt">${String(lab)} <span class="val">${fmt(values[i])} L</span></span></div>`).join('');
    c.resize();c.update('none');
  }catch(err){console.warn('v749 legend',err)}
}
function apply(){ensureStyle();buildLegend('truck','truckChart');buildLegend('status','statusChart');}
apply();[80,220,500,1000,1800,3000].forEach(t=>setTimeout(apply,t));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>{setTimeout(apply,120);setTimeout(apply,350);}));
window.addEventListener('resize',()=>setTimeout(apply,180),{passive:true});window.addEventListener('pageshow',()=>setTimeout(apply,120));
})();