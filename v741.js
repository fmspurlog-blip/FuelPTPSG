(()=>{
'use strict';
const VERSION='7.4.2';
const PASSWORD_HASH='258d4020d9264a872bb3c59faa548ea4a9efa8a06ab2281f4f3da354e1fc9c4f';
const BRAND='PT PRIMA SARANA GEMILANG SITE ABM - LUWUK';
const LOGO_SRC='prima-logo.png?v=742';
const EXCAVATOR_SRC='https://www.nicepng.com/png/detail/836-8363493_excavator-png-free-download-excavator.png';
const GEARS_SRC='https://www.clipartmax.com/png/middle/244-2446543_gear-clipart-no-background-gear-with-no-background.png';
const byId=id=>document.getElementById(id);
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);

function injectStyles(){
  let s=document.getElementById('v741-style');
  if(!s){s=document.createElement('style');s.id='v741-style';document.head.appendChild(s);}
  s.textContent=`
.logo-box{display:flex!important;align-items:center!important;justify-content:center!important;background:#fff!important;border-radius:8px!important;padding:5px 8px!important;min-height:58px!important;overflow:hidden!important;position:relative!important}
.logo-box>*:not(.v741-logo){display:none!important}.logo-box .v741-logo{display:block!important;visibility:visible!important;opacity:1!important;width:auto!important;max-width:172px!important;height:50px!important;object-fit:contain!important;object-position:center!important;filter:none!important;box-shadow:none!important;background:#fff!important}
.hero p{font-weight:800!important;letter-spacing:.35px!important}.stock-panel>h3 em{display:none!important}
.unit-types .unit-icon{height:78px!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:2px auto 3px!important;overflow:hidden!important}.unit-types .unit-icon img{display:block!important;visibility:visible!important;opacity:1!important;max-width:122px!important;max-height:76px!important;width:auto!important;height:auto!important;object-fit:contain!important;filter:drop-shadow(0 5px 8px rgba(0,0,0,.45))!important}.unit-types>div:nth-child(2) .unit-icon img{max-width:96px!important;max-height:72px!important}
#truckDailyDistribution{margin-top:16px;border-top:1px solid #23425f;padding-top:14px}.daily-dist-title{display:flex;justify-content:space-between;align-items:end;gap:10px;margin-bottom:10px}.daily-dist-title span{color:#ff9a26;font-weight:900;font-size:12px;letter-spacing:.5px}.daily-dist-title small{color:#8299b3;font-size:10px}.daily-dist-table{width:100%;border-collapse:collapse;font-size:11px}.daily-dist-table th{color:#9db2c8;text-align:left;padding:8px;border-bottom:1px solid #29445e;font-size:9px}.daily-dist-table td{color:#fff;padding:9px 8px;border-bottom:1px dashed #20384f}.daily-dist-table td strong{color:#fff}.daily-dist-table .pct{font-weight:900;color:#ff9a26}.daily-dist-table tbody tr:hover{background:rgba(50,138,244,.07)}
#usageTableBody td.status-efficient{color:#2bd878!important;font-weight:900!important}#usageTableBody td.status-over{color:#ff5a4d!important;font-weight:900!important}#usageTableBody td.status-normal{color:#fff!important;font-weight:900!important}#usageTableBody td.status-warning{color:#ffad32!important;font-weight:900!important}#usageTableBody td.status-other{color:#a9bad0!important;font-weight:800!important}
.v741-lock-note{display:inline-flex;align-items:center;gap:5px;font-size:9px;color:#91a9c2;margin-left:7px}.v741-lock-note:before{content:'🔒';font-size:10px}
.v741-modal{position:fixed;inset:0;background:rgba(0,7,15,.78);backdrop-filter:blur(5px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px}.v741-modal-card{width:min(390px,96vw);background:linear-gradient(180deg,#0d2438,#081827);border:1px solid #275070;border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.5);padding:22px}.v741-modal-card h3{margin:0;color:#fff;font-size:18px}.v741-modal-card p{color:#9cb1c6;font-size:12px;line-height:1.5}.v741-modal-card input{width:100%;box-sizing:border-box;background:#061522;border:1px solid #2a4a65;color:#fff;border-radius:8px;padding:12px;font-weight:700;outline:none}.v741-modal-card input:focus{border-color:#2f91ff;box-shadow:0 0 0 3px rgba(47,145,255,.13)}.v741-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.v741-modal-actions button{border:0;border-radius:8px;padding:10px 15px;font-weight:900;cursor:pointer}.v741-cancel{background:#263c50;color:#d9e6f2}.v741-unlock{background:#1687f8;color:#fff}.v741-error{min-height:18px;color:#ff6257!important;font-weight:800!important;margin:8px 0 0!important}
`;
}

function applyBrand(){
  const p=document.querySelector('.hero p');if(p)p.textContent=BRAND;
  const copy=document.querySelector('.copyright');if(copy)copy.textContent='© 2026 PT Prima Sarana Gemilang Site ABM - Luwuk';
  const stockH=document.querySelector('#fuel-stock>h3');if(stockH)stockH.textContent='FUEL STOCK';
  const ver=document.querySelector('.v7-version');if(ver)ver.textContent='Dashboard V7.4.2 Professional';
}

function installLogo(){
  const box=document.querySelector('.logo-box');if(!box)return;
  let img=box.querySelector('img.v741-logo');
  if(!img){box.replaceChildren();img=document.createElement('img');img.className='v741-logo';img.alt='PRIMA - PT Prima Sarana Gemilang';img.decoding='async';img.loading='eager';box.appendChild(img);}
  if(!img.src.includes('prima-logo.png'))img.src=LOGO_SRC;
  img.onerror=()=>{box.style.background=`#fff url('${LOGO_SRC}') center/158px auto no-repeat`;img.style.display='none';};
}

function installUnitIcons(){
  const icons=document.querySelectorAll('.unit-types .unit-icon');if(icons.length<2)return;
  icons[0].innerHTML=`<img class="real-excavator" src="${EXCAVATOR_SRC}" alt="Excavator produksi" referrerpolicy="no-referrer">`;
  icons[1].innerHTML=`<img class="real-gears" src="${GEARS_SRC}" alt="3 Gear General Support" referrerpolicy="no-referrer">`;
}

function forceWhiteChartLegends(){
  try{
    if(window.Chart){
      Chart.defaults.color='#ffffff';
      if(Chart.defaults.plugins?.legend?.labels){Chart.defaults.plugins.legend.labels.color='#ffffff';Chart.defaults.plugins.legend.labels.font={...(Chart.defaults.plugins.legend.labels.font||{}),weight:'700'};}
    }
    const charts=(typeof state!=='undefined'&&state.charts)||{};
    ['truck','status'].forEach(name=>{
      const c=charts[name];if(!c)return;
      const p=c.options.plugins||(c.options.plugins={});
      const lg=p.legend||(p.legend={});
      const labels=lg.labels||(lg.labels={});
      labels.color='#ffffff';
      labels.font={...(labels.font||{}),weight:'800',size:name==='truck'?10:9};
      labels.padding=name==='truck'?14:10;
      const oldGen=labels.generateLabels;
      if(oldGen&&!oldGen.__v742wrapped){
        const wrapped=chart=>oldGen(chart).map(item=>({...item,fontColor:'#ffffff',color:'#ffffff'}));
        wrapped.__v742wrapped=true;labels.generateLabels=wrapped;
      }
      c.update('none');
    });
  }catch(e){console.warn('v742 legend patch',e)}
}

function colorUsageStatuses(){
  const body=byId('usageTableBody');if(!body)return;
  body.querySelectorAll('tr').forEach(tr=>{const td=tr.lastElementChild;if(!td)return;const s=(td.textContent||'').trim().toUpperCase();td.classList.remove('status-efficient','status-over','status-normal','status-warning','status-other');if(s==='EFFICIENT')td.classList.add('status-efficient');else if(s.includes('OVER'))td.classList.add('status-over');else if(s==='NORMAL')td.classList.add('status-normal');else if(s==='WARNING')td.classList.add('status-warning');else td.classList.add('status-other');});
}

function renderDailyTruckDistribution(){
  const host=byId('truckSummaryList');if(!host)return;
  let box=byId('truckDailyDistribution');if(!box){box=document.createElement('div');box.id='truckDailyDistribution';host.parentElement.appendChild(box);}
  let rows=[];try{rows=(typeof state!=='undefined'&&Array.isArray(state.filtered))?state.filtered:[]}catch(_){rows=[]}
  const map=new Map();let periodTotal=0;
  rows.forEach(r=>{const ft=(r.Fuel_Truck||'').trim();if(!ft||ft==='Unknown')return;const date=r.Date||'';const l=Number(r.Fuel_Liter)||0;periodTotal+=l;const key=date+'|'+ft;if(!map.has(key))map.set(key,{date,ft,liter:0,transactions:0});const a=map.get(key);a.liter+=l;a.transactions++;});
  const data=[...map.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.ft.localeCompare(b.ft));
  const day=d=>{try{return new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(new Date(d+'T00:00:00'))}catch(_){return'-'}};
  const dateLongLocal=d=>{try{return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(d+'T00:00:00'))}catch(_){return d}};
  box.innerHTML=`<div class="daily-dist-title"><span>DAILY DISTRIBUTION DETAIL PER FUEL TRUCK</span><small>Persentase terhadap total distribusi periode/filter aktif</small></div>${data.length?`<div class="table-wrap"><table class="daily-dist-table"><thead><tr><th>DATE</th><th>DAY</th><th>FUEL TRUCK</th><th>TRANSACTIONS</th><th>TOTAL DISTRIBUTION</th><th>% PERIOD</th></tr></thead><tbody>${data.map(x=>`<tr><td>${dateLongLocal(x.date)}</td><td>${day(x.date)}</td><td><strong>${x.ft}</strong></td><td>${fmt(x.transactions)}</td><td><strong>${fmt(x.liter)} Liter</strong></td><td class="pct">${periodTotal?((x.liter/periodTotal)*100).toFixed(2):'0.00'}%</td></tr>`).join('')}</tbody></table></div>`:'<div class="page-list-row"><div><b>No distribution data</b><small>Sesuaikan filter periode/fuel truck.</small></div></div>'}`;
}

function markProtectedButtons(){document.querySelectorAll('button,label').forEach(el=>{if(isProtected(el)&&!el.querySelector('.v741-lock-note')){const n=document.createElement('span');n.className='v741-lock-note';n.textContent='LOCK';el.appendChild(n);}})}
function isProtected(el){if(!el)return false;const id=el.id||'';if(['exportBtn','downloadReconCsv','exportDashboardExcel'].includes(id))return true;if(el.matches?.('[data-report]'))return true;if(el.matches?.('label.upload')||el.querySelector?.('#excelUpload'))return true;const t=(el.textContent||'').toUpperCase();return /\b(EXPORT|DOWNLOAD|UPLOAD)\b/.test(t);}
async function validPassword(value){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')===PASSWORD_HASH;}
let modalPromise=null;
function requestPassword(){if(modalPromise)return modalPromise;modalPromise=new Promise(resolve=>{const ov=document.createElement('div');ov.className='v741-modal';ov.innerHTML=`<div class="v741-modal-card"><h3>🔒 Protected Fuel Data Action</h3><p>Masukkan password untuk melanjutkan upload, download, atau export data Fuel Management System.</p><input type="password" autocomplete="current-password" placeholder="Password"><p class="v741-error"></p><div class="v741-modal-actions"><button class="v741-cancel" type="button">BATAL</button><button class="v741-unlock" type="button">UNLOCK</button></div></div>`;document.body.appendChild(ov);const input=ov.querySelector('input'),err=ov.querySelector('.v741-error');const done=ok=>{ov.remove();modalPromise=null;resolve(ok)};const check=async()=>{if(await validPassword(input.value))done(true);else{err.textContent='Password salah. Akses tidak diberikan.';input.select();}};ov.querySelector('.v741-cancel').onclick=()=>done(false);ov.querySelector('.v741-unlock').onclick=check;input.addEventListener('keydown',e=>{if(e.key==='Enter')check();if(e.key==='Escape')done(false)});setTimeout(()=>input.focus(),30);});return modalPromise;}
const bypass=new WeakSet();let uploadGrantUntil=0;
document.addEventListener('click',async e=>{const action=e.target.closest?.('button,label,a');if(!action||!isProtected(action))return;if(bypass.has(action)){bypass.delete(action);return;}e.preventDefault();e.stopImmediatePropagation();const ok=await requestPassword();if(!ok)return;if(action.matches('label.upload')||action.querySelector?.('#excelUpload')){uploadGrantUntil=Date.now()+60000;byId('excelUpload')?.click();return;}bypass.add(action);action.click();},true);
document.addEventListener('change',e=>{if(e.target?.id==='excelUpload'&&Date.now()>uploadGrantUntil){e.preventDefault();e.stopImmediatePropagation();e.target.value='';alert('Upload dibatalkan: otorisasi password diperlukan.');}},true);

function refreshEnhancements(){applyBrand();installLogo();installUnitIcons();forceWhiteChartLegends();colorUsageStatuses();if(byId('fuel-truck')?.classList.contains('active-section'))renderDailyTruckDistribution();markProtectedButtons();}

injectStyles();refreshEnhancements();
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>byId(id)?.addEventListener(id==='unitSearch'?'input':'change',()=>{setTimeout(refreshEnhancements,40);setTimeout(forceWhiteChartLegends,180);}));
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>setTimeout(refreshEnhancements,50)));
const usageBody=byId('usageTableBody');if(usageBody)new MutationObserver(colorUsageStatuses).observe(usageBody,{childList:true,subtree:true,characterData:true});
const logoBox=document.querySelector('.logo-box');if(logoBox)new MutationObserver(()=>setTimeout(installLogo,0)).observe(logoBox,{childList:true,subtree:true});
window.addEventListener('resize',()=>setTimeout(forceWhiteChartLegends,120),{passive:true});
setTimeout(refreshEnhancements,150);setTimeout(refreshEnhancements,600);setTimeout(refreshEnhancements,1500);
})();
