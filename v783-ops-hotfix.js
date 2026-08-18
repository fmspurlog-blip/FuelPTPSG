(()=>{
'use strict';
const $=s=>document.querySelector(s);
const byId=id=>document.getElementById(id);
const num=v=>Number(v)||0;
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(num(v));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const dateID=s=>{if(!s)return'-';try{return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(s+'T00:00:00'))}catch(_){return s}};
const dayID=s=>{if(!s)return'-';try{return new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(new Date(s+'T00:00:00'))}catch(_){return'-'}};

function addStyle(){
 let st=byId('v783-ops-hotfix-style'); if(!st){st=document.createElement('style');st.id='v783-ops-hotfix-style';document.head.appendChild(st)}
 st.textContent=`
 .shift-panel{overflow:hidden!important}.shift-panel .shift-content{align-items:start!important;grid-template-columns:minmax(0,1.55fr) minmax(120px,.45fr)!important;min-height:250px!important}.shift-panel .chart.donut{height:290px!important;min-height:290px!important;margin-top:-24px!important}.shift-panel .shift-legend{margin-top:44px!important;align-self:start!important}.shift-panel .shift-item small{font-size:11px!important;color:#fff!important}.shift-panel .shift-item strong{font-size:18px!important;color:#fff!important}.shift-panel .shift-item strong span{font-size:9px!important;color:#fff!important}.shift-panel .shift-item>div>span{font-size:9px!important;color:#89c9ff!important}
 .v783-white-legend{position:absolute;right:10px;top:53px;width:145px;display:flex;flex-direction:column;gap:7px;z-index:4}.v783-white-legend .leg{display:grid;grid-template-columns:10px minmax(0,1fr);gap:6px;align-items:start;color:#fff;font-size:9px;font-weight:800;line-height:1.15}.v783-white-legend i{width:9px;height:9px;margin-top:1px;display:block;border-radius:1px}.row-middle .panel:nth-child(3),.row-middle .panel:nth-child(4){position:relative!important}.row-middle .panel:nth-child(3) .chart.medium,.row-middle .panel:nth-child(4) .chart.medium{padding-right:145px!important;box-sizing:border-box!important}
 .v783-receipt-table{width:100%;border-collapse:collapse;color:#fff;font-size:11px}.v783-receipt-table th{text-align:left;color:#8dc7ff;padding:9px 8px;border-bottom:1px solid #31516b;white-space:nowrap}.v783-receipt-table td{padding:9px 8px;border-bottom:1px dashed #29425a;vertical-align:top}.v783-receipt-table td:nth-child(4){font-weight:800}.v783-empty{padding:22px;color:#9bb0c4;text-align:center}
 .v783-dist-detail{margin-top:12px}.v783-dist-detail h3{margin:0 0 10px;color:#ffad20;font-size:14px}.v783-dist-table{width:100%;border-collapse:collapse;color:#fff;font-size:11px}.v783-dist-table th{text-align:left;color:#8dc7ff;padding:8px;border-bottom:1px solid #31516b;white-space:nowrap}.v783-dist-table td{padding:8px;border-bottom:1px dashed #29425a}.v783-dist-table td:nth-child(5),.v783-dist-table td:nth-child(6){font-weight:800}.v783-dist-table td:nth-child(6){color:#5fe291}
 @media(max-width:768px){.shift-panel .shift-content{grid-template-columns:minmax(0,1fr) 108px!important}.shift-panel .chart.donut{height:260px!important;min-height:260px!important;margin-top:-18px!important}.shift-panel .shift-legend{margin-top:38px!important}.v783-white-legend{position:static!important;width:auto!important;margin-top:8px!important}.row-middle .panel:nth-child(3) .chart.medium,.row-middle .panel:nth-child(4) .chart.medium{padding-right:0!important}.v783-receipt-table,.v783-dist-table{font-size:9px}.v783-receipt-table th,.v783-receipt-table td,.v783-dist-table th,.v783-dist-table td{padding:6px 4px}}
 `;
}

function normalizeReceipts(){
 const src=Array.isArray(window.__FUEL_RECEIPTS)?window.__FUEL_RECEIPTS:[];
 const rows=src.map(r=>({
  date:r.date||r.Date||'', qty:num(r.qty??r.Qty??r.Qty_Received_Liter), supplier:r.supplier||r.Supplier||'',
  noSJ:r.noSJ||r.No_Surat_Jalan||r['No SJ/DO']||'', refPO:r.refPO||r.Ref_PO||r.Reference||'', transporter:r.transporter||r.Transporter||''
 })).filter(r=>r.date&&r.qty>0);
 try{if(typeof reconData!=='undefined')reconData.receiptDetails=rows.map(r=>({date:r.date,qty:r.qty,supplier:r.supplier,transportir:r.transporter,no_surat_jalan:r.noSJ,ref_po:r.refPO}));}catch(_){}
 return rows;
}

function renderReceiptAuto(){
 const section=byId('fuel-receipt'); if(!section)return;
 const from=byId('dateFrom')?.value||'',to=byId('dateTo')?.value||'';
 const rows=normalizeReceipts().filter(r=>(!from||r.date>=from)&&(!to||r.date<=to)).sort((a,b)=>b.date.localeCompare(a.date));
 const total=rows.reduce((a,r)=>a+r.qty,0), days=new Set(rows.map(r=>r.date)).size, last=rows[0];
 if(byId('receiptTotal'))byId('receiptTotal').textContent=fmt(total);
 if(byId('receiptDays'))byId('receiptDays').textContent=fmt(days);
 if(byId('receiptAvg'))byId('receiptAvg').textContent=fmt(days?total/days:0);
 if(byId('receiptLast'))byId('receiptLast').textContent=last?dateID(last.date):'-';
 if(byId('receiptLastQty'))byId('receiptLastQty').textContent=last?fmt(last.qty)+' L':'0 L';
 const list=byId('receiptList');
 if(list){list.className='table-wrap';list.innerHTML=rows.length?`<table class="v783-receipt-table"><thead><tr><th>Tanggal</th><th>No SJ/DO</th><th>Supplier</th><th>Qty</th><th>Ref PO</th></tr></thead><tbody>${rows.slice(0,20).map(r=>`<tr><td>${dateID(r.date)}</td><td>${esc(r.noSJ||'-')}</td><td>${esc(r.supplier||'-')}</td><td>${fmt(r.qty)} L</td><td>${esc(r.refPO||'-')}</td></tr>`).join('')}</tbody></table>`:'<div class="v783-empty">Belum ada Fuel Receipt pada periode ini.</div>';}
 const canvas=byId('receiptChart'); if(canvas&&typeof Chart!=='undefined'){
  const daily={};rows.forEach(r=>daily[r.date]=(daily[r.date]||0)+r.qty);const labels=Object.keys(daily).sort();
  const old=Chart.getChart(canvas);if(old)old.destroy();
  new Chart(canvas,{type:'bar',data:{labels:labels.map(x=>x.slice(8,10)+'/'+x.slice(5,7)),datasets:[{label:'Fuel Receipt',data:labels.map(x=>daily[x]),backgroundColor:'#1687f8',borderRadius:4,maxBarThickness:70}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,labels:{color:'#fff',boxWidth:12}},datalabels:{anchor:'end',align:'top',color:'#fff',formatter:v=>fmt(v)}},scales:{x:{ticks:{color:'#b8cad8'},grid:{display:false}},y:{beginAtZero:true,ticks:{color:'#b8cad8',callback:v=>fmt(v)},grid:{color:'rgba(120,150,175,.15)'}}}}});
 }
}

function renderWhiteLegend(panelSelector,chart){
 const panel=$(panelSelector);if(!panel||!chart)return;
 let host=panel.querySelector('.v783-white-legend');if(!host){host=document.createElement('div');host.className='v783-white-legend';panel.appendChild(host)}
 const ds=chart.data.datasets?.[0]||{}, labels=chart.data.labels||[], colors=Array.isArray(ds.backgroundColor)?ds.backgroundColor:[];
 host.innerHTML=labels.map((l,i)=>`<div class="leg"><i style="background:${colors[i]||'#fff'}"></i><span>${esc(l)} ${fmt(ds.data?.[i])} L</span></div>`).join('');
 if(chart.options?.plugins?.legend){chart.options.plugins.legend.display=false;chart.update('none')}
}

function polishDashboardCharts(){
 try{
  const charts=(typeof state!=='undefined'&&state.charts)?state.charts:{};
  if(charts.truck)renderWhiteLegend('.row-middle .panel:nth-child(3)',charts.truck);
  if(charts.status)renderWhiteLegend('.row-middle .panel:nth-child(4)',charts.status);
  if(charts.shift){charts.shift.options.radius='96%';charts.shift.options.cutout='62%';charts.shift.resize();charts.shift.update('none')}
 }catch(_){}
}

function renderTruckPerformance(){
 const host=byId('truckSummaryList');if(!host)return;
 const rows=(typeof state!=='undefined'&&Array.isArray(state.filtered)?state.filtered:[]).filter(r=>r?.Date&&r?.Fuel_Truck&&num(r.Fuel_Liter)>0);
 if(!rows.length){host.innerHTML='<div class="v783-empty">Belum ada data distribusi pada periode ini.</div>';return}
 const total=rows.reduce((a,r)=>a+num(r.Fuel_Liter),0), grouped={};
 rows.forEach(r=>{const k=`${r.Date}|${r.Fuel_Truck}`;if(!grouped[k])grouped[k]={date:r.Date,ft:r.Fuel_Truck,txn:0,liter:0};grouped[k].txn++;grouped[k].liter+=num(r.Fuel_Liter)});
 const detail=Object.values(grouped).sort((a,b)=>a.date.localeCompare(b.date)||String(a.ft).localeCompare(String(b.ft)));
 host.className='v783-dist-detail';host.innerHTML=`<h3>Distribution & Truck Performance</h3><div class="table-wrap"><table class="v783-dist-table"><thead><tr><th>Date</th><th>Day</th><th>Kode Unit</th><th>Total transaksi</th><th>Total Distribusi</th><th>Persent</th></tr></thead><tbody>${detail.map(x=>`<tr><td>${dateID(x.date)}</td><td>${esc(dayID(x.date))}</td><td>${esc(x.ft)}</td><td>${fmt(x.txn)}</td><td>${fmt(x.liter)} L</td><td>${total?((x.liter/total)*100).toFixed(2):'0.00'}%</td></tr>`).join('')}</tbody></table></div>`;
}

function apply(){addStyle();polishDashboardCharts();renderReceiptAuto();renderTruckPerformance()}
setTimeout(apply,650);setTimeout(apply,2600);
window.addEventListener('pageshow',()=>setTimeout(apply,150),{passive:true});
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>setTimeout(apply,180),{passive:true}));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>byId(id)?.addEventListener('change',()=>setTimeout(apply,160),{passive:true}));
})();