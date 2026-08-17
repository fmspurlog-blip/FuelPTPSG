(async()=>{
  if(location.search){const hash=location.hash||'#dashboard';history.replaceState(null,'',location.pathname+hash)}
  const q='77.11';
  const addCss=href=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l)};
  ['v6.css','v7.css','v71.css','v72.css','v724.css','v726.css','v730.css','v731.css','v733.css','v760-mobile.css'].forEach(x=>addCss(x+'?v='+q));
  const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)});
  function num(x){return (x===''||x==null)?null:Number(x)}
  function first(r,...keys){for(const k of keys){if(r[k]!==undefined&&r[k]!==null&&r[k]!=='')return r[k]}return ''}
  function sheetObjects(sheet,required=['Date']){const grid=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:true});let hi=-1;for(let i=0;i<Math.min(grid.length,15);i++){const row=(grid[i]||[]).map(v=>String(v??'').trim());if(required.every(k=>row.includes(k))){hi=i;break}}if(hi<0)return XLSX.utils.sheet_to_json(sheet,{defval:'',raw:true});const headers=(grid[hi]||[]).map(v=>String(v??'').trim());return grid.slice(hi+1).map(row=>{const o={};headers.forEach((h,j)=>{if(h)o[h]=row?.[j]??''});return o})}
  function dateIso(v){if(typeof v==='number'){const p=XLSX.SSF.parse_date_code(v);return p?`${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`:''}if(v){const d=new Date(v);if(!Number.isNaN(d.getTime()))return d.toISOString().slice(0,10)}return ''}
  function timeIso(v){if(v==null||v==='')return '';if(typeof v==='number'&&Number.isFinite(v)){const frac=((v%1)+1)%1,total=Math.round(frac*86400)%86400,h=Math.floor(total/3600),m=Math.floor((total%3600)/60);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`}const s=String(v).trim();const m=s.match(/(\d{1,2})[:.](\d{2})/);return m?`${String(Number(m[1])).padStart(2,'0')}:${m[2]}`:s}
  function normalize(rows){return rows.map((r,i)=>{const date=dateIso(first(r,'Date','TANGGAL')),actual=num(first(r,'Actual_L_per_HM_KM','Actual_LHM','Actual L/HM')),std=num(first(r,'Standard_LHM','Standard L/HM')),vp=num(first(r,'Variance_Pct','Variance %'));let st=first(r,'Consumption_Status','Status');if(!st)st=std==null?'NO STANDARD':vp==null?'NO DATA':vp<=-.10?'EFFICIENT':vp<=.10?'NORMAL':vp<=.20?'WARNING':'OVER CONSUMPTION';return {Transaction_ID:first(r,'Transaction_ID','Transaction ID')||`AUTO-${i+1}`,Date:date||'',Day:first(r,'Day','HARI'),Time:timeIso(first(r,'Time','JAM')),Shift:first(r,'Shift','SHIFT'),Unit_Code:first(r,'Unit_Code','Unit Code'),Category:first(r,'Category','CATEGORY'),Unit_Type:first(r,'Unit_Type','Unit Type'),Fuel_Liter:num(first(r,'Fuel_Liter','Fuel Out_Liter','Fuel_Out_Liter','Fuel Out Liter'))||0,Meter_Before:num(first(r,'Meter_Before','HM_KM _Before','HM_KM_Before','HM/KM Before')),Meter_Current:num(first(r,'Meter_Current','HM_KM _Current','HM_KM_Current','HM/KM Current')),Delta_HM_KM:num(first(r,'Delta_HM_KM','Total_HM_KM','Total HM/KM')),Actual_LHM:actual,Fuel_Truck:first(r,'Fuel_Truck','Fuel Truck'),Mtech_Code:first(r,'Mtech_Code','Mtech Code'),Unit_Group_Code:first(r,'Unit_Group_Code','Unit Group Code'),Manpower:first(r,'Manpower','MANPOWER'),Unit_Position:first(r,'Unit_Position','Stock','Position'),Standard_LHM:std,Variance_LHM:num(first(r,'Variance_LHM','Variance L/HM')),Variance_Pct:vp,Consumption_Status:String(st||'').trim().toUpperCase(),Standard_Match:first(r,'Standard_Match','Standard Match')}}).filter(r=>r.Date&&r.Unit_Code&&r.Fuel_Liter>0)}

  try{await load('v77-config.js?v='+q)}catch(e){console.warn('V77 config unavailable',e)}
  const cloudMode=!!String(window.FUEL_V77?.apiUrl||'').trim();
  if(cloudMode){
    try{const cached=JSON.parse(localStorage.getItem('fuelptpsg_usage_v756')||'[]');window.FUEL_DATA=Array.isArray(cached)?cached:[]}catch(_){window.FUEL_DATA=[]}
    window.__FUEL_DEFAULT_WB=null;
  }else{
    try{await load('v760-public-data.js?v='+q)}catch(e){console.warn('Public snapshot unavailable',e)}
    if(window.FUEL_STATIC_DATA?.usage?.length){window.FUEL_DATA=window.FUEL_STATIC_DATA.usage.map(r=>({...r}));window.__FUEL_DEFAULT_WB=null}
    else{try{const res=await fetch('Fuel_Database_Dashboard_Ready_Final.xlsx?v='+Date.now(),{cache:'no-store'});if(!res.ok)throw new Error('HTTP '+res.status);const buf=await res.arrayBuffer(),wb=XLSX.read(buf,{type:'array'});window.__FUEL_DEFAULT_WB=wb;const sheet=wb.SheetNames.includes('Fuel_Usage_Clean')?'Fuel_Usage_Clean':wb.SheetNames[0];window.FUEL_DATA=normalize(sheetObjects(wb.Sheets[sheet],['Transaction_ID','Date','Unit_Code']))}catch(err){console.error('Default fuel database load failed',err);window.FUEL_DATA=[];window.__FUEL_DEFAULT_WB=null}}
  }

  await load('app.js?v='+q);
  await load('v733.js?v='+q);
  await load('v741.js?v='+q);
  await load('v743-ui.js?v='+q);
  await load('v747-fix.js?v='+q);
  await load('v748-fix.js?v='+q);
  await load('v752-upload-fix.js?v='+q);
  if(cloudMode){
    await load('v770-remote-sync.js?v='+q);
    await load('v779-performance.js?v='+q);
  }else{
    await load('v760-public-sync.js?v='+q);
    await load('v754-persist.js?v='+q);
    await load('v757-time-fix.js?v='+q);
    await load('v758-stock-period-fix.js?v='+q);
    await load('v763-stock-authority.js?v='+q);
    await load('v764-data-integrity-fix.js?v='+q);
  }
})();
