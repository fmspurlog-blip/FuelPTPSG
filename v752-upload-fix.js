(()=>{
'use strict';

const VERSION='75.5';
const num=x=>(x===''||x==null)?null:Number(x);
const fmt=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
const isoDate=value=>{
  if(value==null||value==='')return '';
  if(typeof value==='number'){
    const p=XLSX.SSF.parse_date_code(value);
    return p?`${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`:'';
  }
  if(value instanceof Date&&!Number.isNaN(value.getTime()))return value.toISOString().slice(0,10);
  const dt=new Date(value);
  return Number.isNaN(dt.getTime())?String(value).slice(0,10):dt.toISOString().slice(0,10);
};
const timeText=value=>{
  if(value==null||value==='')return '';
  if(typeof value==='number'){
    const secs=Math.round((value%1)*86400),h=Math.floor(secs/3600)%24,m=Math.floor((secs%3600)/60);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
  const s=String(value);
  const m=s.match(/(\d{1,2}):(\d{2})/);
  return m?`${String(m[1]).padStart(2,'0')}:${m[2]}`:s;
};

function sheetObjects(sheet, required=['Date']){
  const grid=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:true});
  let headerIndex=-1;
  for(let i=0;i<Math.min(grid.length,12);i++){
    const row=(grid[i]||[]).map(v=>String(v??'').trim());
    if(required.every(key=>row.includes(key))){headerIndex=i;break;}
  }
  if(headerIndex<0)return XLSX.utils.sheet_to_json(sheet,{defval:'',raw:true});
  const headers=(grid[headerIndex]||[]).map(v=>String(v??'').trim());
  return grid.slice(headerIndex+1).map(row=>{
    const obj={};headers.forEach((h,j)=>{if(h)obj[h]=row?.[j]??'';});return obj;
  });
}

function first(r,...keys){for(const k of keys){if(r[k]!==undefined&&r[k]!==null&&r[k]!=='')return r[k];}return '';}

function normalizeRows(rows){
  return rows.map((r,i)=>{
    const date=isoDate(first(r,'Date','TANGGAL'));
    const actual=num(first(r,'Actual_L_per_HM_KM','Actual_LHM','Actual L/HM'));
    const std=num(first(r,'Standard_LHM','Standard L/HM'));
    const vp=num(first(r,'Variance_Pct','Variance %'));
    let st=first(r,'Consumption_Status','Status');
    if(!st) st=std==null?'NO STANDARD':vp==null?'NO DATA':vp<=-.10?'EFFICIENT':vp<=.10?'NORMAL':vp<=.20?'WARNING':'OVER CONSUMPTION';
    return {
      Transaction_ID:first(r,'Transaction_ID','Transaction ID')||`UPLOAD-${i+1}`,
      Date:date,Day:first(r,'Day','HARI'),Time:first(r,'Time','JAM'),Shift:first(r,'Shift','SHIFT'),
      Unit_Code:first(r,'Unit_Code','Unit Code'),Category:first(r,'Category','CATEGORY'),Unit_Type:first(r,'Unit_Type','Unit Type'),
      Fuel_Liter:num(first(r,'Fuel_Liter','Fuel Out_Liter','Fuel_Out_Liter','Fuel Out Liter'))||0,
      Meter_Before:num(first(r,'Meter_Before','HM_KM _Before','HM_KM_Before','HM/KM Before')),
      Meter_Current:num(first(r,'Meter_Current','HM_KM _Current','HM_KM_Current','HM/KM Current')),
      Delta_HM_KM:num(first(r,'Delta_HM_KM','Total_HM_KM','Total HM/KM')),
      Actual_LHM:actual,Fuel_Truck:first(r,'Fuel_Truck','Fuel Truck'),Mtech_Code:first(r,'Mtech_Code','Mtech Code'),
      Unit_Group_Code:first(r,'Unit_Group_Code','Unit Group Code'),Manpower:first(r,'Manpower','MANPOWER'),Unit_Position:first(r,'Unit_Position','Stock','Position'),
      Standard_LHM:std,Variance_LHM:num(first(r,'Variance_LHM','Variance L/HM')),Variance_Pct:vp,
      Consumption_Status:String(st||'').trim().toUpperCase(),Standard_Match:first(r,'Standard_Match','Standard Match')
    };
  }).filter(r=>r.Date&&r.Unit_Code&&r.Fuel_Liter>0);
}

function parseReceipts(wb){
  if(!wb.SheetNames.includes('Fuel_Receipt'))return [];
  const rows=sheetObjects(wb.Sheets['Fuel_Receipt'],['Date','Qty_Received_Liter']);
  return rows.map(r=>({
    Date:isoDate(first(r,'Date','TANGGAL')),Supplier:first(r,'Supplier','SUPPLIER'),No_Surat_Jalan:first(r,'No_Surat_Jalan','No Surat Jalan'),
    Qty:Number(first(r,'Qty_Received_Liter','Qty Received Liter','QTY'))||0,Transporter:first(r,'Transporter','TRANSPORTER'),
    Fuel_Truck:first(r,'Fuel_Truck','FS_Fuel Truck','Fuel Truck'),Reference:first(r,'Reference','REFERENCE'),Remarks:first(r,'Remarks','REMARKS')
  })).filter(r=>r.Date&&r.Qty>0);
}

function parseStock(wb){
  if(!wb.SheetNames.includes('Stock Calculasi'))return {snapshots:{},availableDates:[]};
  const rows=XLSX.utils.sheet_to_json(wb.Sheets['Stock Calculasi'],{header:1,defval:'',raw:true});
  const snapshots={};
  for(let i=0;i<rows.length;i++){
    const r=rows[i]||[];
    const date=isoDate(r[1]);
    if(!date)continue;
    const fs={FS01:Number(r[6])||0,FS02:Number(r[7])||0,FS03:Number(r[8])||0,FS04:Number(r[9])||0,FS05:Number(r[10])||0,FS06:Number(r[11])||0};
    const ft={FTRL44G004:Number(r[12])||0,FTRL44G005:Number(r[13])||0};
    const physical=[...Object.values(fs),...Object.values(ft)].reduce((a,b)=>a+b,0);
    const total=Number(r[15])||physical;
    if(total<=0&&physical<=0)continue;
    snapshots[date]={fuelStorage:fs,fuelTruck:ft,total:total||physical,time:timeText(r[3])||'06:00'};
  }
  return {snapshots,availableDates:Object.keys(snapshots).sort()};
}

function installStableLogo(){
  const base=location.pathname.endsWith('/')?location.pathname:location.pathname.replace(/[^/]*$/,'');
  const url=`${location.origin}${base}prima-logo.png?v=${VERSION}`;
  let s=document.getElementById('v753-logo-style');
  if(!s){s=document.createElement('style');s.id='v753-logo-style';document.head.appendChild(s);}
  s.textContent=`.logo-box{background-color:#fff!important;background-image:url("${url}")!important;background-repeat:no-repeat!important;background-position:center!important;background-size:91% auto!important;min-height:76px!important;height:76px!important;overflow:hidden!important}.logo-box img,.logo-box .prima-text-logo,.logo-box .v743-logo-fallback{opacity:0!important;visibility:hidden!important;pointer-events:none!important}`;
}

function filteredReceipts(){
  const data=window.__FUEL_RECEIPTS||[];
  const from=document.getElementById('dateFrom')?.value||'';
  const to=document.getElementById('dateTo')?.value||'';
  const truck=document.getElementById('truckFilter')?.value||'';
  return data.filter(r=>(!from||r.Date>=from)&&(!to||r.Date<=to)&&(!truck||r.Fuel_Truck===truck));
}

function renderReceipt(){
  const data=filteredReceipts().sort((a,b)=>a.Date.localeCompare(b.Date));
  const total=data.reduce((a,r)=>a+r.Qty,0);
  const days=new Set(data.map(r=>r.Date)).size;
  const last=data.at(-1);
  const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val;};
  set('receiptTotal',fmt(total));set('receiptDays',fmt(days));set('receiptAvg',fmt(days?total/days:0));
  set('receiptLast',last?new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(last.Date+'T00:00:00')):'-');
  set('receiptLastQty',last?`${fmt(last.Qty)} L`:'0 L');
  const list=document.getElementById('receiptList');
  if(list)list.innerHTML=[...data].reverse().slice(0,8).map(r=>`<div class="page-list-row"><div><b>${r.Date}</b><small>${r.Supplier||'-'} · ${r.No_Surat_Jalan||'-'} · ${r.Fuel_Truck||'-'}</small></div><strong>${fmt(r.Qty)} L</strong></div>`).join('')||'<div class="page-list-row"><div><b>No receipt data</b></div></div>';
  const canvas=document.getElementById('receiptChart');
  if(canvas&&window.Chart&&typeof state!=='undefined'){
    const daily={};data.forEach(r=>daily[r.Date]=(daily[r.Date]||0)+r.Qty);
    const labs=Object.keys(daily).sort();
    if(state.charts.receipt)state.charts.receipt.destroy();
    state.charts.receipt=new Chart(canvas,{type:'bar',data:{labels:labs.map(d=>d.slice(8,10)+'/'+d.slice(5,7)),datasets:[{label:'Receipt Liter',data:labs.map(d=>daily[d]),backgroundColor:'#25bd68',borderRadius:3,maxBarThickness:30}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{anchor:'end',align:'top',color:'#fff',font:{size:9,weight:'bold'},formatter:v=>fmt(v)}},scales:{x:{ticks:{color:'#a6bad0'},grid:{display:false}},y:{beginAtZero:true,ticks:{color:'#a6bad0',callback:v=>fmt(v)},grid:{color:'#29425a80'}}}}});
  }
}

function applyStockData(parsed){
  try{
    if(typeof stockData!=='undefined'){
      stockData.snapshots=parsed.snapshots;
      stockData.availableDates=parsed.availableDates;
    }
    window.__FUEL_STOCK_DATA=parsed;
    if(typeof renderStock==='function')renderStock();
  }catch(e){console.warn('Stock integration',e);}
}

function processAuxWorkbook(wb){
  window.__FUEL_RECEIPTS=parseReceipts(wb);
  applyStockData(parseStock(wb));
  renderReceipt();
  installStableLogo();
}

async function handleExcelFile(file){
  if(!file)return;
  try{
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    const sheetName=wb.SheetNames.includes('Fuel_Usage_Clean')?'Fuel_Usage_Clean':wb.SheetNames[0];
    if(!sheetName) throw new Error('Workbook tidak memiliki sheet yang dapat dibaca.');
    const rows=sheetObjects(wb.Sheets[sheetName],['Transaction_ID','Date','Unit_Code']);
    const data=normalizeRows(rows);
    if(!data.length) throw new Error('Tidak ada transaksi valid. Pastikan header Fuel_Usage_Clean, Date, Unit_Code, dan Fuel Out_Liter/Fuel_Liter terisi.');
    if(typeof state==='undefined') throw new Error('Dashboard state belum siap. Silakan refresh lalu coba lagi.');

    processAuxWorkbook(wb);
    state.raw=data;state.filtered=[];state.page=1;
    if(typeof initFilters==='function')initFilters();
    if(typeof applyFilters==='function')applyFilters();
    else if(typeof renderAll==='function'){state.filtered=[...state.raw];renderAll();}
    setTimeout(()=>{renderReceipt();if(typeof renderStock==='function')renderStock();installStableLogo();},120);

    const dates=[...new Set(data.map(r=>r.Date))].sort();
    const receipts=(window.__FUEL_RECEIPTS||[]).length;
    const stockDates=(window.__FUEL_STOCK_DATA?.availableDates||[]).length;
    alert(`Upload Excel berhasil.\nFuel Usage: ${data.length.toLocaleString('id-ID')} transaksi\nFuel Receipt: ${receipts.toLocaleString('id-ID')} data\nStock Snapshot: ${stockDates.toLocaleString('id-ID')} hari\nPeriode Usage: ${dates[0]||'-'} s/d ${dates.at(-1)||'-'}`);
  }catch(err){
    console.error('Excel upload failed',err);
    alert('Upload Excel gagal: '+(err?.message||err));
  }
}

if(window.__FUEL_DEFAULT_WB){try{processAuxWorkbook(window.__FUEL_DEFAULT_WB);}catch(e){console.warn(e)}}
installStableLogo();
window.addEventListener('change',e=>{
  const input=e.target;
  if(!input||input.id!=='excelUpload')return;
  e.stopPropagation();
  const file=input.files?.[0];
  if(file)handleExcelFile(file);
},true);
['dateFrom','dateTo','truckFilter'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>setTimeout(()=>{renderReceipt();if(typeof renderStock==='function')renderStock();installStableLogo();},100)));
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>setTimeout(()=>{renderReceipt();if(typeof renderStock==='function')renderStock();installStableLogo();},120)));
window.addEventListener('resize',()=>setTimeout(installStableLogo,60),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(installStableLogo,20));
new MutationObserver(()=>installStableLogo()).observe(document.querySelector('.sidebar')||document.body,{childList:true,subtree:true});
})();
