(()=>{
'use strict';
const VER='75.7';
const UKEY='fuelptpsg_usage_v756';
function timeText(value){
  if(value==null||value==='')return '';
  if(typeof value==='number'&&Number.isFinite(value)){
    const frac=((value%1)+1)%1;
    let total=Math.round(frac*86400)%86400;
    const h=Math.floor(total/3600),m=Math.floor((total%3600)/60);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
  const s=String(value).trim();
  if(/^\d*\.\d+$/.test(s)){
    const n=Number(s);
    if(Number.isFinite(n)&&n>=0&&n<1)return timeText(n);
  }
  const ampm=s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if(ampm){
    let h=Number(ampm[1])%12;if(ampm[3].toUpperCase()==='PM')h+=12;
    return `${String(h).padStart(2,'0')}:${ampm[2]}`;
  }
  const m=s.match(/(\d{1,2}):(\d{2})/);
  return m?`${String(Number(m[1])).padStart(2,'0')}:${m[2]}`:s;
}
function normalizeRows(rows){
  if(!Array.isArray(rows))return rows;
  return rows.map(r=>({...r,Time:timeText(r?.Time)}));
}
function normalizeStored(){
  try{
    const raw=localStorage.getItem(UKEY);if(!raw)return;
    const rows=JSON.parse(raw);if(!Array.isArray(rows)||!rows.length)return;
    const fixed=normalizeRows(rows);
    localStorage.setItem(UKEY,JSON.stringify(fixed));
  }catch(e){console.warn('Time persisted data normalization',e)}
}
function applyFix(){
  try{
    if(typeof state==='undefined'||!Array.isArray(state.raw)||!state.raw.length)return;
    let changed=false;
    state.raw=state.raw.map(r=>{const t=timeText(r.Time);if(t!==r.Time)changed=true;return {...r,Time:t}});
    if(changed){
      try{localStorage.setItem(UKEY,JSON.stringify(state.raw))}catch(_){ }
      if(typeof applyFilters==='function')applyFilters();
      else if(typeof renderAll==='function'){state.filtered=[...state.raw];renderAll();}
    }
  }catch(e){console.warn('Time display normalization',e)}
}
normalizeStored();
setTimeout(applyFix,80);setTimeout(applyFix,350);setTimeout(applyFix,900);
window.addEventListener('change',e=>{if(e.target?.id==='excelUpload'){setTimeout(applyFix,180);setTimeout(applyFix,500);setTimeout(applyFix,1000)}},false);
window.addEventListener('pageshow',()=>{normalizeStored();setTimeout(applyFix,100);setTimeout(applyFix,400)});
window.addEventListener('hashchange',()=>setTimeout(applyFix,100));
})();
