(()=>{
'use strict';
const PASSWORD='PrimaFuel\\@2026';

function ensureStyle(){
  if(document.getElementById('v748-style'))return;
  const s=document.createElement('style');s.id='v748-style';s.textContent=`
.v748-html-legend{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:145px;display:flex;flex-direction:column;gap:8px;z-index:6;pointer-events:none}
.v748-html-legend .row{display:grid;grid-template-columns:10px 1fr;gap:7px;align-items:start;color:#fff!important;font-weight:900;font-size:9px;line-height:1.25;text-shadow:0 1px 2px rgba(0,0,0,.7)}
.v748-html-legend .sw{width:9px;height:9px;margin-top:1px;border-radius:1px}
.v748-html-legend .txt{color:#fff!important;white-space:normal;overflow-wrap:anywhere}
.v748-html-legend .val{color:#fff!important;font-weight:900}
#truckChart,#statusChart{position:relative;z-index:1}
#truckChart.parent-v748,#statusChart.parent-v748{position:relative}
@media(max-width:1350px){.v748-html-legend{width:130px;right:5px}.v748-html-legend .row{font-size:8px;gap:5px}}
`;
  document.head.appendChild(s);
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
    label.insertBefore(marker,file);
    document.body.appendChild(file);
    try{file.click();}finally{setTimeout(()=>{if(marker.parentNode){marker.parentNode.insertBefore(file,marker);marker.remove();}},0);}
  };
  ov.querySelector('.v741-cancel').onclick=close;
  ov.querySelector('.v741-unlock').onclick=openFile;
  pwd.addEventListener('keydown',e=>{if(e.key==='Enter')openFile();if(e.key==='Escape')close();});
  setTimeout(()=>pwd.focus(),20);
}

window.addEventListener('click',e=>{
  const label=e.target.closest?.('label.upload');
  if(!label)return;
  e.preventDefault();e.stopImmediatePropagation();
  showUploadPassword();
},true);

function fmt(v){return new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0)}
function buildLegend(chartName,canvasId){
  try{
    if(typeof state==='undefined'||!state.charts)return;
    const c=state.charts[chartName];const canvas=document.getElementById(canvasId);if(!c||!canvas)return;
    const wrap=canvas.parentElement;if(!wrap)return;wrap.style.position='relative';
    const plugins=c.options.plugins||(c.options.plugins={});
    const legend=plugins.legend||(plugins.legend={});legend.display=false;
    c.options.layout=c.options.layout||{};
    const current=c.options.layout.padding||{};
    c.options.layout.padding={top:current.top||0,bottom:current.bottom||0,left:current.left||0,right:chartName==='truck'?150:175};
    let box=wrap.querySelector(`.v748-html-legend[data-chart="${chartName}"]`);
    if(!box){box=document.createElement('div');box.className='v748-html-legend';box.dataset.chart=chartName;wrap.appendChild(box);}
    const labels=c.data?.labels||[];const ds=c.data?.datasets?.[0]||{};const values=ds.data||[];const colors=Array.isArray(ds.backgroundColor)?ds.backgroundColor:labels.map(()=>ds.backgroundColor||'#fff');
    box.innerHTML=labels.map((lab,i)=>`<div class="row"><span class="sw" style="background:${colors[i]||'#fff'}"></span><span class="txt">${String(lab)} <span class="val">${fmt(values[i])}${chartName==='truck'?' L':' L'}</span></span></div>`).join('');
    c.resize();c.update('none');
  }catch(err){console.warn('v748 legend',err)}
}
function apply(){ensureStyle();buildLegend('truck','truckChart');buildLegend('status','statusChart');}
apply();
[80,220,500,1000,1800,3000].forEach(t=>setTimeout(apply,t));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>document.getElementById(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>{setTimeout(apply,120);setTimeout(apply,350);}));
window.addEventListener('resize',()=>setTimeout(apply,180),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(apply,120));
})();