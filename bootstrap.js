(async()=>{
  const css6=document.createElement('link');
  css6.rel='stylesheet';css6.href='v6.css?v=6';document.head.appendChild(css6);
  const css7=document.createElement('link');
  css7.rel='stylesheet';css7.href='v7.css?v=7';document.head.appendChild(css7);
  const css71=document.createElement('link');
  css71.rel='stylesheet';css71.href='v71.css?v=71';document.head.appendChild(css71);
  const css72=document.createElement('link');
  css72.rel='stylesheet';css72.href='v72.css?v=72.1';document.head.appendChild(css72);
  function num(x){return (x===''||x==null)?null:Number(x)}
  function normalize(rows){
    return rows.map((r,i)=>{
      let date=r.Date;
      if(typeof date==='number'){
        const p=XLSX.SSF.parse_date_code(date);
        date=`${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`;
      }else if(date){
        const dt=new Date(date);
        if(!Number.isNaN(dt.getTime())) date=dt.toISOString().slice(0,10);
      }
      const actual=num(r.Actual_L_per_HM_KM??r.Actual_LHM);
      const std=num(r.Standard_LHM);
      const vp=num(r.Variance_Pct);
      let st=r.Consumption_Status||r.Status||'';
      if(!st) st=std==null?'NO STANDARD':vp==null?'NO DATA':vp<=-.10?'EFFICIENT':vp<=.10?'NORMAL':vp<=.20?'WARNING':'OVER CONSUMPTION';
      return {Transaction_ID:r.Transaction_ID||`AUTO-${i+1}`,Date:date||'',Day:r.Day||'',Time:r.Time||'',Shift:r.Shift||'',Unit_Code:r.Unit_Code||'',Category:r.Category||'',Unit_Type:r.Unit_Type||'',Fuel_Liter:num(r.Fuel_Liter)||0,Meter_Before:num(r.Meter_Before),Meter_Current:num(r.Meter_Current),Delta_HM_KM:num(r.Delta_HM_KM),Actual_LHM:actual,Fuel_Truck:r.Fuel_Truck||'',Mtech_Code:r.Mtech_Code||'',Unit_Group_Code:r.Unit_Group_Code||'',Manpower:r.Manpower||'',Unit_Position:r.Unit_Position||'',Standard_LHM:std,Variance_LHM:num(r.Variance_LHM),Variance_Pct:vp,Consumption_Status:st,Standard_Match:r.Standard_Match||''};
    }).filter(r=>r.Date&&r.Unit_Code&&r.Fuel_Liter>0);
  }
  try{
    const res=await fetch('Fuel_Database_Dashboard_Ready_Final.xlsx',{cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const buf=await res.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    const sheet=wb.SheetNames.includes('Fuel_Usage_Clean')?'Fuel_Usage_Clean':wb.SheetNames[0];
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheet],{defval:''});
    window.FUEL_DATA=normalize(rows);
    if(!window.FUEL_DATA.length) throw new Error('No valid Fuel_Usage_Clean rows');
  }catch(err){console.error('Default fuel database load failed',err);window.FUEL_DATA=[];}
  const s=document.createElement('script');
  s.src='app.js?v=72';
  s.onload=()=>{
    const p6=document.createElement('script');
    p6.src='v6.js?v=6';
    p6.onload=()=>{
      const p7=document.createElement('script');
      p7.src='v7.js?v=7fix';
      p7.onload=()=>{
        const p71=document.createElement('script');
        p71.src='v71.js?v=71';
        p71.onload=()=>{
          const p72=document.createElement('script');
          p72.src='v72.js?v=72.1';
          document.body.appendChild(p72);
        };
        document.body.appendChild(p71);
      };
      document.body.appendChild(p7);
    };
    document.body.appendChild(p6);
  };
  document.body.appendChild(s);
})();