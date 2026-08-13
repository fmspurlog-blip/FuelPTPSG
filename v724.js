(()=>{
  const EXPORT_PASSWORD_HASH='2a6aa525045b5f22bc9fe8d31ea813bce7b734992f1c99bbbd891e395aaaf94a';
  let exportUnlocked=false;
  let bypassOnce=false;

  async function sha256(text){
    const data=new TextEncoder().encode(text);
    const hash=await crypto.subtle.digest('SHA-256',data);
    return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function setBranding(){
    const sub=document.querySelector('.hero p');
    if(sub)sub.textContent='PT Prima Sarana Gemilang Site ABM';
    const version=document.querySelector('.v7-version');
    if(version)version.textContent='Dashboard V7.2.4 Professional';
  }

  function paintUsageStatuses(){
    const body=document.getElementById('usageTableBody');
    if(!body)return;
    [...body.querySelectorAll('tr')].forEach(tr=>{
      const td=tr.lastElementChild;
      if(!td)return;
      const s=(td.textContent||'').trim().toUpperCase();
      td.dataset.status=s;
      td.classList.remove('status-over','status-standard','status-warning','status-no-standard');
      if(s==='OVER CONSUMPTION')td.classList.add('status-over');
      else if(s==='NORMAL'||s==='EFFICIENT'||s==='STANDARD')td.classList.add('status-standard');
      else if(s==='WARNING')td.classList.add('status-warning');
      else if(s==='NO STANDARD'||s==='NO DATA')td.classList.add('status-no-standard');
    });
  }

  function observeUsageTable(){
    const body=document.getElementById('usageTableBody');
    if(!body||body.$v724)return;
    body.$v724=true;
    new MutationObserver(paintUsageStatuses).observe(body,{childList:true,subtree:true,characterData:true});
    paintUsageStatuses();
  }

  function isExportControl(target){
    if(!target)return false;
    return !!target.closest('#exportBtn,#downloadReconCsv,[data-report]');
  }

  document.addEventListener('click',async e=>{
    if(!isExportControl(e.target))return;
    if(bypassOnce){bypassOnce=false;return;}
    if(exportUnlocked)return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const pwd=prompt('Masukkan password untuk mengakses export report:');
    if(pwd===null)return;
    const ok=(await sha256(pwd))===EXPORT_PASSWORD_HASH;
    if(!ok){alert('Password salah. Akses export ditolak.');return;}

    exportUnlocked=true;
    alert('Password benar. Export dibuka untuk sesi ini sampai halaman direfresh.');
    const btn=e.target.closest('#exportBtn,#downloadReconCsv,[data-report]');
    if(btn){bypassOnce=true;btn.click();}
  },true);

  function apply(){
    setBranding();
    observeUsageTable();
    paintUsageStatuses();
  }

  apply();
  setTimeout(apply,300);
  setTimeout(apply,900);
  setTimeout(apply,1800);
})();
