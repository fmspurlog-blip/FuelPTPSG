(async()=>{
  const q='73.1';
  const addCss=(href)=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.appendChild(l)};
  addCss('v6.css?v='+q);
  addCss('v7.css?v='+q);
  addCss('v71.css?v='+q);
  addCss('v72.css?v='+q);
  addCss('v724.css?v='+q);
  addCss('v726.css?v='+q);
  addCss('v730.css?v='+q);
  addCss('v731.css?v='+q);

  function num(x){return (x===''||x==null)?null:Number(x)}
  function normalize(rows){return rows.map((r,i)=>{let date=r.Date;if(typeof date==='number'){const p=XLSX.SSF.parse_date_code(date);date=`${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`;}else if(date){const dt=new Date(date);if(!Number.isNaN(dt.getTime()))date=dt.toISOString().slice(0,10);}const actual=num(r.Actual_L_per_HM_KM??r.Actual_LHM),std=num(r.Standard_LHM),vp=num(r.Variance_Pct);let st=r.Consumption_Status||r.Status||'';if(!st)st=std==null?'NO STANDARD':vp==null?'NO DATA':vp<=-.10?'EFFICIENT':vp<=.10?'NORMAL':vp<=.20?'WARNING':'OVER CONSUMPTION';return {Transaction_ID:r.Transaction_ID||`AUTO-${i+1}`,Date:date||'',Day:r.Day||'',Time:r.Time||'',Shift:r.Shift||'',Unit_Code:r.Unit_Code||'',Category:r.Category||'',Unit_Type:r.Unit_Type||'',Fuel_Liter:num(r.Fuel_Liter)||0,Meter_Before:num(r.Meter_Before),Meter_Current:num(r.Meter_Current),Delta_HM_KM:num(r.Delta_HM_KM),Actual_LHM:actual,Fuel_Truck:r.Fuel_Truck||'',Mtech_Code:r.Mtech_Code||'',Unit_Group_Code:r.Unit_Group_Code||'',Manpower:r.Manpower||'',Unit_Position:r.Unit_Position||'',Standard_LHM:std,Variance_LHM:num(r.Variance_LHM),Variance_Pct:vp,Consumption_Status:st,Standard_Match:r.Standard_Match||''};}).filter(r=>r.Date&&r.Unit_Code&&r.Fuel_Liter>0)}

  try{
    const res=await fetch('Fuel_Database_Dashboard_Ready_Final.xlsx?v='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const buf=await res.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    const sheet=wb.SheetNames.includes('Fuel_Usage_Clean')?'Fuel_Usage_Clean':wb.SheetNames[0];
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheet],{defval:''});
    window.FUEL_DATA=normalize(rows);
    if(!window.FUEL_DATA.length)throw new Error('No valid Fuel_Usage_Clean rows');
  }catch(err){console.error('Default fuel database load failed',err);window.FUEL_DATA=[];}

  const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)});
  await load('app.js?v='+q);
  await load('v6.js?v='+q);
  await load('v71.js?v='+q);
  const logoBox=document.querySelector('.logo-box');
  if(logoBox)logoBox.innerHTML='<img alt="PRIMA - PT Prima Sarana Gemilang">';
  await load('v7.js?v='+q);
  await load('v72.js?v='+q);
  await load('v724.js?v='+q);
  await load('v726.js?v='+q);
  await load('v730.js?v='+q);
  await load('v731.js?v='+q);
})();