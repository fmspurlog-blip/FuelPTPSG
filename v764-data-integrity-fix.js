(()=>{
'use strict';

const VER='76.4';
const UKEY='fuelptpsg_usage_v756';
const RKEY='fuelptpsg_receipts_v754';
const SKEY='fuelptpsg_stock_v754';
const METAKEY='fuelptpsg_upload_meta_v764';
const truckPalette=['#ff8b1f','#328af4','#21bc67','#ffc43b','#8b5cf6','#00b8d9','#ef4d3e','#94a3b8'];
const statusPalette={
  'OVER CONSUMPTION':'#ef4d3e',
  'WARNING':'#ff8b1f',
  'NORMAL':'#328af4',
  'EFFICIENT':'#20a94e',
  'NO STANDARD':'#8493a5',
  'NO DATA':'#53687d'
};

const safeSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){console.warn('persist',k,e);return false}};
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
const dateID=s=>{if(!s)return'-';const d=new Date(s+'T00:00:00');return Number.isNaN(d.getTime())?s:new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)};

function timeText(value){
  if(value==null||value==='')return '';
  if(value instanceof Date&&!Number.isNaN(value.getTime()))return `${String(value.getHours()).padStart(2,'0')}:${String(value.getMinutes()).padStart(2,'0')}`;
  if(typeof value==='number'&&Number.isFinite(value)){
    const frac=((value%1)+1)%1;
    const total=Math.round(frac*86400)%86400;
    return `${String(Math.floor(total/3600)).padStart(2,'0')}:${String(Math.floor((total%3600)/60)).padStart(2,'0')}`;
  }
  const s=String(value).trim();
  if(/^\d*\.\d+$/.test(s)){
    const n=Number(s);if(Number.isFinite(n)&&n>=0&&n<1)return timeText(n);
  }
  const ap=s.match(/^(\d{1,2})[:.]?(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if(ap){let h=Number(ap[1])%12;if(ap[3].toUpperCase()==='PM')h+=12;return `${String(h).padStart(2,'0')}:${ap[2]}`}
  const m=s.match(/(\d{1,2})[:.](\d{2})/);
  return m?`${String(Number(m[1])).padStart(2,'0')}:${m[2]}`:s;
}

function normalizeCurrentTimes(){
  try{
    if(typeof state==='undefined'||!Array.isArray(state.raw))return;
    let changed=false;
    state.raw=state.raw.map(r=>{const t=timeText(r?.Time);if(t!==r?.Time)changed=true;return {...r,Time:t}});
    if(Array.isArray(state.filtered))state.filtered=state.filtered.map(r=>({...r,Time:timeText(r?.Time)}));
    if(changed&&typeof renderTable==='function')renderTable();
  }catch(e){console.warn('time normalization',e)}
}

function snapshotSignature(){
  try{
    if(typeof state==='undefined'||!Array.isArray(state.raw)||!state.raw.length)return '';
    const rows=state.raw,dates=rows.map(r=>r.Date||'').filter(Boolean).sort();
    return `${rows.length}|${dates[0]||''}|${dates.at(-1)||''}|${rows.reduce((a,r)=>a+(Number(r.Fuel_Liter)||0),0)}`;
  }catch(_){return ''}
}

function replacePersistentDataset(file){
  try{
    if(typeof state==='undefined'||!Array.isArray(state.raw)||!state.raw.length)return false;
    normalizeCurrentTimes();
    const usage=state.raw.map(r=>({...r,Time:timeText(r.Time)}));
    const receipts=Array.isArray(window.__FUEL_RECEIPTS)?window.__FUEL_RECEIPTS.map(r=>({...r})):[];
    const stock=window.__FUEL_STOCK_DATA?.snapshots?JSON.parse(JSON.stringify(window.__FUEL_STOCK_DATA)):null;
    safeSet(UKEY,usage);
    safeSet(RKEY,receipts);
    if(stock)safeSet(SKEY,stock);else localStorage.removeItem(SKEY);
    const dates=usage.map(r=>r.Date).filter(Boolean).sort();
    safeSet(METAKEY,{
      source:'excel-upload',
      savedAt:new Date().toISOString(),
      fileName:file?.name||'',
      fileSize:file?.size||0,
      usageRows:usage.length,
      receiptRows:receipts.length,
      stockDates:stock?.availableDates?.length||0,
      minDate:dates[0]||'',
      maxDate:dates.at(-1)||'',
      signature:snapshotSignature(),
      version:VER
    });
    return true;
  }catch(e){console.warn('replace persistent dataset',e);return false}
}

function fixCharts(){
  try{
    if(typeof state==='undefined'||!state.charts)return;
    const truck=state.charts.truck;
    if(truck?.data?.datasets?.[0]){
      const ds=truck.data.datasets[0];
      ds.backgroundColor=(ds.data||[]).map((_,i)=>truckPalette[i%truckPalette.length]);
      ds.borderColor='#07192b';
      ds.borderWidth=4;
      const labels=truck.options?.plugins?.legend?.labels;
      if(labels){labels.color='#fff';labels.font={...(labels.font||{}),size:9,weight:'800'};}
      truck.update('none');
    }
    const status=state.charts.status;
    if(status?.data?.datasets?.[0]){
      const ds=status.data.datasets[0];
      ds.backgroundColor=(status.data.labels||[]).map((label,i)=>statusPalette[String(label||'').trim().toUpperCase()]||truckPalette[i%truckPalette.length]);
      ds.borderColor='#07192b';
      ds.borderWidth=4;
      const labels=status.options?.plugins?.legend?.labels;
      if(labels){labels.color='#fff';labels.font={...(labels.font||{}),size:8,weight:'800'};}
      status.update('none');
    }
  }catch(e){console.warn('chart color repair',e)}
}

function filteredReceipts(){
  const data=Array.isArray(window.__FUEL_RECEIPTS)?window.__FUEL_RECEIPTS:[];
  const from=document.getElementById('dateFrom')?.value||'';
  const to=document.getElementById('dateTo')?.value||'';
  const truck=document.getElementById('truckFilter')?.value||'';
  return data.filter(r=>(!from||r.Date>=from)&&(!to||r.Date<=to)&&(!truck||r.Fuel_Truck===truck));
}

function renderRecentReceipt(){
  const list=document.getElementById('receiptList');
  if(!list)return;
  const rows=filteredReceipts().slice().sort((a,b)=>String(b.Date||'').localeCompare(String(a.Date||''))).slice(0,10);
  list.innerHTML=rows.map(r=>{
    const sj=r.No_Surat_Jalan||r.No_DO||r.DO||'-';
    const supplier=r.Supplier||r.Transporter||'-';
    const ref=r.Ref_PO||r.Reference||r.PO||'-';
    return `<div class="page-list-row receipt-v764"><div class="receipt-v764-line"><span>${dateID(r.Date)}</span><span>${sj}</span><span>${supplier}</span><strong>${fmt(r.Qty)} L</strong><span>${ref}</span></div></div>`;
  }).join('')||'<div class="page-list-row"><div><b>No receipt data</b></div></div>';
}

function installReceiptStyle(){
  let s=document.getElementById('v764-receipt-style');
  if(!s){s=document.createElement('style');s.id='v764-receipt-style';document.head.appendChild(s)}
  s.textContent=`
  #receiptList .receipt-v764{display:block!important;padding:8px 10px!important}
  #receiptList .receipt-v764-line{display:grid;grid-template-columns:1.05fr 1.25fr 1.45fr .9fr 1.2fr;gap:10px;align-items:center;width:100%;font-size:11px;color:#dbe8f5}
  #receiptList .receipt-v764-line strong{color:#fff;text-align:right;white-space:nowrap}
  #receiptList .receipt-v764-line span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  @media(max-width:900px){#receiptList .receipt-v764-line{grid-template-columns:1fr 1fr;font-size:10px}#receiptList .receipt-v764-line strong{text-align:left}}
  `;
}

function refreshRepairs(){
  normalizeCurrentTimes();
  fixCharts();
  renderRecentReceipt();
  installReceiptStyle();
}

installReceiptStyle();
[80,250,700,1400].forEach(t=>setTimeout(refreshRepairs,t));

window.addEventListener('change',e=>{
  if(e.target?.id==='excelUpload'){
    const file=e.target.files?.[0];
    const before=snapshotSignature();
    [350,800,1500].forEach((t,i)=>setTimeout(()=>{
      const after=snapshotSignature();
      normalizeCurrentTimes();
      if(after&&(after!==before||i===2))replacePersistentDataset(file);
      refreshRepairs();
    },t));
  }
},false);

['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>{
  const e=document.getElementById(id);if(e)e.addEventListener(id==='unitSearch'?'input':'change',()=>{setTimeout(refreshRepairs,120);setTimeout(refreshRepairs,400)});
});
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>{setTimeout(refreshRepairs,160);setTimeout(refreshRepairs,780)}));
window.addEventListener('hashchange',()=>{setTimeout(refreshRepairs,150);setTimeout(refreshRepairs,800)});
window.addEventListener('pageshow',()=>{setTimeout(refreshRepairs,150);setTimeout(refreshRepairs,700)});
})();
