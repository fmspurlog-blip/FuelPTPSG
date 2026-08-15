(()=>{
'use strict';

const num=x=>(x===''||x==null)?null:Number(x);
function normalizeRows(rows){
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
    return {
      Transaction_ID:r.Transaction_ID||`UPLOAD-${i+1}`,
      Date:date||'',Day:r.Day||'',Time:r.Time||'',Shift:r.Shift||'',
      Unit_Code:r.Unit_Code||'',Category:r.Category||'',Unit_Type:r.Unit_Type||'',
      Fuel_Liter:num(r.Fuel_Liter)||0,
      Meter_Before:num(r.Meter_Before),Meter_Current:num(r.Meter_Current),Delta_HM_KM:num(r.Delta_HM_KM),
      Actual_LHM:actual,Fuel_Truck:r.Fuel_Truck||'',Mtech_Code:r.Mtech_Code||'',
      Unit_Group_Code:r.Unit_Group_Code||'',Manpower:r.Manpower||'',Unit_Position:r.Unit_Position||'',
      Standard_LHM:std,Variance_LHM:num(r.Variance_LHM),Variance_Pct:vp,
      Consumption_Status:st,Standard_Match:r.Standard_Match||''
    };
  }).filter(r=>r.Date&&r.Unit_Code&&r.Fuel_Liter>0);
}

async function handleExcelFile(file){
  if(!file)return;
  try{
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    const sheetName=wb.SheetNames.includes('Fuel_Usage_Clean')?'Fuel_Usage_Clean':wb.SheetNames[0];
    if(!sheetName) throw new Error('Workbook tidak memiliki sheet yang dapat dibaca.');
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{defval:''});
    const data=normalizeRows(rows);
    if(!data.length) throw new Error('Tidak ada transaksi valid. Pastikan Date, Unit_Code, dan Fuel_Liter terisi.');
    if(typeof state==='undefined') throw new Error('Dashboard state belum siap. Silakan refresh lalu coba lagi.');

    state.raw=data;
    state.filtered=[];
    state.page=1;
    if(typeof initFilters==='function') initFilters();
    if(typeof applyFilters==='function') applyFilters();
    else if(typeof renderAll==='function'){state.filtered=[...state.raw];renderAll();}

    const minDate=[...new Set(data.map(r=>r.Date))].sort()[0]||'-';
    const maxDate=[...new Set(data.map(r=>r.Date))].sort().at(-1)||'-';
    alert(`Upload Excel berhasil.\nSheet: ${sheetName}\nTransaksi valid: ${data.length.toLocaleString('id-ID')}\nPeriode: ${minDate} s/d ${maxDate}`);
  }catch(err){
    console.error('Excel upload failed',err);
    alert('Upload Excel gagal: '+(err?.message||err));
  }
}

// Window capture runs before the older document-capture authorization guard.
window.addEventListener('change',e=>{
  const input=e.target;
  if(!input||input.id!=='excelUpload')return;
  e.stopPropagation();
  const file=input.files?.[0];
  if(file) handleExcelFile(file);
},true);
})();
