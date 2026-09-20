/* Branding and operational detail display ONLY; never mutates dashboard Chart.js instances. */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const fmt=v=>Number(v||0).toLocaleString('id-ID',{maximumFractionDigits:0});
const date=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')))return s||'-';return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(s+'T00:00:00'))};
const fuel=`<svg viewBox="0 0 62 82" width="43" height="60" aria-hidden="true"><rect x="8" y="6" width="34" height="58" rx="4" fill="#ff9800"/><rect x="14" y="13" width="22" height="14" rx="2" fill="#fff"/><rect x="18" y="17" width="14" height="7" fill="#173249"/><path d="M25 34c-6 8-9 14-9 19a10 10 0 0 0 20 0c0-5-5-12-11-19Zm0 9c3 4 5 8 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10Z" fill="#09243a"/><path d="M42 16h6l6 7v20c0 6-4 10-9 10h-4v-6h4c2 0 3-2 3-4V26l-6-6Z" fill="#ff9800"/><rect x="5" y="64" width="41" height="5" rx="2" fill="#ff9800"/></svg>`;
const excavator=`<svg viewBox="0 0 170 90" role="img" aria-label="Excavator"><rect x="18" y="65" width="75" height="16" rx="8" fill="#91a4b3"/><circle cx="34" cy="73" r="5" fill="#0a2134"/><circle cx="54" cy="73" r="5" fill="#0a2134"/><circle cx="74" cy="73" r="5" fill="#0a2134"/><path d="M39 63V35h29l15 16v12Z" fill="#ff9c12" stroke="#ffc04b" stroke-width="2.5"/><rect x="48" y="41" width="15" height="12" rx="1.5" fill="#edf8ff"/><path d="M77 53 100 24l10 5-18 31m14-30 27 17-7 10-28-12" fill="none" stroke="#ff9c12" stroke-width="7"/><path d="M130 50h25l-7 22-26-2Z" fill="#ff9c12"/></svg>`;
const tooth='M0-26 7-25 10-18 17-20 22-15 20-8 26-4 26 4 20 8 22 15 17 20 10 18 7 25 0 26-4 20-12 22-17 17-15 10-22 7-26 0-25-7-18-10-20-17-15-22-8-20-4-26Z';
const gears=`<svg viewBox="0 0 170 90" role="img" aria-label="Three gears"><g fill="#dbe7ef" stroke="#7d9aac" stroke-width="2"><g transform="translate(55 51) scale(1.08)"><path d="${tooth}"/><circle r="10" fill="#17364d"/></g><g transform="translate(104 30) scale(.84)"><path d="${tooth}"/><circle r="10" fill="#17364d"/></g><g transform="translate(122 65) scale(.66)"><path d="${tooth}"/><circle r="10" fill="#17364d"/></g></g></svg>`;
const css=document.createElement('style');css.id='fms-brand-operations-style';css.textContent=`
.logo-box.fms-brand-box{width:100%;height:96px;min-height:96px;padding:8px;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#061a2b,#092940);border:1px solid #1788d8;border-radius:8px;overflow:hidden;box-sizing:border-box}
.fms-brand{display:grid;grid-template-columns:45px minmax(0,1fr);gap:9px;align-items:center;width:100%;min-width:0}.fms-brand strong{display:block;color:#fff;font:900 15px/1.1 Segoe UI,Arial,sans-serif;white-space:normal}
.unit-type-panel .unit-icon{height:70px;display:flex;align-items:center;justify-content:center;font-size:0}.unit-type-panel .unit-icon svg{width:min(100%,120px);height:68px}
.fms-receipt-wrap{overflow-x:auto;max-width:100%}.fms-receipt-wrap table{width:100%;min-width:570px;border-collapse:collapse}.fms-receipt-wrap th,.fms-receipt-wrap td{padding:8px;text-align:left;border-bottom:1px solid #29445c;font-size:10px}.fms-receipt-wrap th{color:#a9d5ff}
.fms-truck-detail{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr);gap:12px}.fms-truck-detail>section{border:1px solid #27445e;border-radius:8px;padding:12px;min-width:0}.fms-truck-detail h3{font-size:12px;color:#ffb12d}.fms-truck-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;padding:7px 0;border-bottom:1px dashed #20384d;font-size:11px}.fms-truck-row b{color:#45e38b}
@media(max-width:768px){.logo-box.fms-brand-box{width:190px!important;height:82px!important;min-height:82px!important;margin:0 auto 8px!important}.fms-brand strong{font-size:13px}.fms-truck-detail{grid-template-columns:1fr}}
`;document.head.appendChild(css);
function paint(){const logo=document.querySelector('.logo-box');if(logo&&!logo.classList.contains('fms-brand-box')){logo.classList.add('fms-brand-box');logo.innerHTML=`<div class="fms-brand">${fuel}<div><strong>REFUELING</strong><strong>CONTROL</strong></div></div>`}
 const heading=document.querySelector('.hero h1');if(heading)heading.textContent='FUEL MANAGEMENT SYSTEM V78.9';
 const sub=document.querySelector('.hero p');if(sub)sub.textContent='PT PRIMA SARANA GEMILANG SITE ABM - LUWUK';
 const icons=document.querySelectorAll('.unit-type-panel .unit-icon');if(icons[0]&&!icons[0].querySelector('svg'))icons[0].innerHTML=excavator;if(icons[1]&&!icons[1].querySelector('svg'))icons[1].innerHTML=gears;
 const label=document.querySelector('.stock-panel .stock-total>small');if(label)label.textContent='TOTAL STOCK';
}
function receipt(){const host=document.getElementById('receiptList');if(!host)return;const data=Array.isArray(window.__FUEL_RECEIPTS)?window.__FUEL_RECEIPTS:[];
 if(!data.length){host.textContent='Belum ada data Fuel Receipt pada database terbaru.';return}
 const rows=[...data].sort((a,b)=>String(b.Date||'').localeCompare(String(a.Date||'')));host.className='fms-receipt-wrap';
 host.innerHTML=`<table><thead><tr><th>Tanggal</th><th>No SJ/DO</th><th>Supplier</th><th>Qty</th><th>Ref PO</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(date(r.Date))}</td><td>${esc(r.No_Surat_Jalan||r.NoSJ||'-')}</td><td>${esc(r.Supplier||'-')}</td><td>${fmt(r.Qty)} L</td><td>${esc(r.Ref_PO||r.Reference||'-')}</td></tr>`).join('')}</tbody></table>`;
}
function trucks(){const host=document.getElementById('truckSummaryList');if(!host)return;let raw=[];try{raw=typeof state!=='undefined'&&Array.isArray(state.raw)?state.raw:window.FUEL_DATA||[]}catch(_){raw=window.FUEL_DATA||[]}
 const entries=raw.filter(r=>r&&r.Date&&r.Fuel_Truck&&Number(r.Fuel_Liter)>0);if(!entries.length)return;
 const byTruck=new Map(),byDay=new Map();let grand=0;for(const row of entries){const fuel=Number(row.Fuel_Liter),ft=String(row.Fuel_Truck),key=String(row.Date)+'|'+ft;grand+=fuel;byTruck.set(ft,(byTruck.get(ft)||0)+fuel);byDay.set(key,(byDay.get(key)||0)+fuel)}
 host.className='fms-truck-detail';host.innerHTML=`<section><h3>DISTRIBUTION</h3>${[...byTruck].sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="fms-truck-row"><span>${esc(k)}</span><b>${fmt(v)} L · ${grand?(100*v/grand).toFixed(2):'0.00'}%</b></div>`).join('')}</section><section><h3>Distribution &amp; Truck Performance</h3>${[...byDay].sort((a,b)=>a[0].localeCompare(b[0])).map(([key,v])=>{const [d,ft]=key.split('|');return `<div class="fms-truck-row"><span>${esc(date(d))} · ${esc(ft)}</span><b>${fmt(v)} L · ${grand?(100*v/grand).toFixed(2):'0.00'}%</b></div>`}).join('')}</section>`;
}
function refresh(){paint();receipt();trucks()}
refresh();window.addEventListener('pageshow',refresh,{passive:true});document.addEventListener('click',e=>{if(e.target.closest('.nav-link[data-section]'))setTimeout(refresh,120)},{passive:true});
})();