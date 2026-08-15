(()=>{
'use strict';
const PASSWORD='PrimaFuel\\@2026';

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

const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);

function cleanupOldHtmlLegend(canvas){
  if(!canvas)return;
  const wrap=canvas.parentElement;
  if(!wrap)return;
  wrap.classList.remove('v749-legend-layout');
  wrap.querySelectorAll('.v749-html-legend,.v748-html-legend').forEach(el=>el.remove());
  wrap.style.display='';wrap.style.gridTemplateColumns='';wrap.style.gap='';wrap.style.padding='';
  canvas.style.width='';canvas.style.height='';canvas.style.maxWidth='';canvas.style.maxHeight='';canvas.style.justifySelf='';
}

function forceNativeWhiteLegend(chartName,canvasId){
  try{
    if(typeof state==='undefined'||!state.charts)return;
    const c=state.charts[chartName],canvas=document.getElementById(canvasId);
    if(!c||!canvas)return;
    cleanupOldHtmlLegend(canvas);
    const plugins=c.options.plugins||(c.options.plugins={});
    const legend=plugins.legend||(plugins.legend={});
    legend.display=true;
    legend.position='right';
    legend.align='center';
    const labels=legend.labels||(legend.labels={});
    labels.color='#ffffff';
    labels.boxWidth=chartName==='truck'?10:9;
    labels.boxHeight=chartName==='truck'?10:9;
    labels.padding=chartName==='truck'?14:10;
    labels.font={...(labels.font||{}),size:chartName==='truck'?10:9,weight:'900',family:'Segoe UI, Arial, sans-serif'};
    labels.generateLabels=chart=>{
      const ds=chart.data.datasets?.[0]||{};
      const labs=chart.data.labels||[];
      const vals=ds.data||[];
      const colors=Array.isArray(ds.backgroundColor)?ds.backgroundColor:labs.map(()=>ds.backgroundColor||'#fff');
      return labs.map((lab,i)=>({
        text:`${lab}  ${fmt(vals[i])} L`,
        fillStyle:colors[i]||'#fff',
        strokeStyle:'transparent',
        lineWidth:0,
        fontColor:'#ffffff',
        color:'#ffffff',
        hidden:false,
        index:i
      }));
    };
    c.options.layout=c.options.layout||{};
    c.options.layout.padding={top:2,right:4,bottom:2,left:2};
    c.resize();
    c.update('none');
  }catch(err){console.warn('native white legend fix',chartName,err);}
}

function applyLegends(){
  if(window.Chart){
    Chart.defaults.color='#ffffff';
    if(Chart.defaults.plugins?.legend?.labels){
      Chart.defaults.plugins.legend.labels.color='#ffffff';
      Chart.defaults.plugins.legend.labels.font={...(Chart.defaults.plugins.legend.labels.font||{}),weight:'900'};
    }
  }
  forceNativeWhiteLegend('truck','truckChart');
  forceNativeWhiteLegend('status','statusChart');
}

applyLegends();
[60,160,320,650,1100,1800,2800,4200].forEach(t=>setTimeout(applyLegends,t));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>{
  const el=document.getElementById(id);
  if(el)el.addEventListener(id==='unitSearch'?'input':'change',()=>{
    setTimeout(applyLegends,60);setTimeout(applyLegends,180);setTimeout(applyLegends,420);
  });
});
window.addEventListener('resize',()=>{setTimeout(applyLegends,100);setTimeout(applyLegends,300);},{passive:true});
window.addEventListener('pageshow',()=>{setTimeout(applyLegends,80);setTimeout(applyLegends,260);});
})();