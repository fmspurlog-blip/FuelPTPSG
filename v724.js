(()=>{
  const ACCESS_HASH='2a6aa525045b5f22bc9fe8d31ea813bce7b734992f1c99bbbd891e395aaaf94a';
  let exportUnlocked=false;
  let uploadUnlocked=false;
  let bypassExportOnce=false;
  let bypassUploadClick=false;

  const fmtID=v=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Number(v)||0);
  const dayID=s=>{
    if(!s)return '-';
    const d=new Date(String(s).slice(0,10)+'T00:00:00');
    return Number.isNaN(d.getTime())?'-':new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(d);
  };
  const dateLongID=s=>{
    if(!s)return '-';
    const d=new Date(String(s).slice(0,10)+'T00:00:00');
    return Number.isNaN(d.getTime())?String(s):new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(d);
  };

  async function sha256(text){
    const data=new TextEncoder().encode(text);
    const hash=await crypto.subtle.digest('SHA-256',data);
    return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  async function requestAccess(label){
    const pwd=prompt(`Masukkan password untuk mengakses ${label}:`);
    if(pwd===null)return false;
    const ok=(await sha256(pwd))===ACCESS_HASH;
    if(!ok){alert('Password salah. Akses ditolak.');return false;}
    return true;
  }

  function setBranding(){
    const sub=document.querySelector('.hero p');
    if(sub)sub.textContent='PT PRIMA SARANA GEMILANG SITE ABM';
    const version=document.querySelector('.v7-version');
    if(version)version.textContent='Dashboard V7.2.5 Professional';
  }

  function forceStockTime(){
    const t=document.getElementById('stockTime');
    if(t)t.textContent='06:00 WITA';
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
    if(!body||body.$v725)return;
    body.$v725=true;
    new MutationObserver(paintUsageStatuses).observe(body,{childList:true,subtree:true,characterData:true});
    paintUsageStatuses();
  }

  function install3DPlugin(){
    if(typeof Chart==='undefined'||Chart.$v725Depth)return;
    const depthPlugin={
      id:'v725Depth',
      beforeDatasetDraw(chart){
        const ctx=chart.ctx;
        ctx.save();
        ctx.shadowColor='rgba(0,0,0,.38)';
        ctx.shadowBlur=9;
        ctx.shadowOffsetX=3;
        ctx.shadowOffsetY=6;
      },
      afterDatasetDraw(chart){chart.ctx.restore();}
    };
    Chart.register(depthPlugin);
    Chart.$v725Depth=true;
  }

  function polish3DCharts(){
    try{
      install3DPlugin();
      const charts=(typeof state!=='undefined'&&state?.charts)?state.charts:{};
      Object.values(charts).forEach(c=>{
        if(!c||!c.data?.datasets)return;
        c.data.datasets.forEach(ds=>{
          if(c.config.type==='bar'){
            ds.borderWidth=Math.max(Number(ds.borderWidth)||0,1);
            ds.borderSkipped=false;
            ds.borderRadius=Math.max(Number(ds.borderRadius)||0,3);
          }
          if(c.config.type==='doughnut'||c.config.type==='pie'){
            ds.borderWidth=Math.max(Number(ds.borderWidth)||0,3);
            ds.hoverOffset=7;
            ds.spacing=1;
          }
          if(c.config.type==='line'){
            ds.borderWidth=Math.max(Number(ds.borderWidth)||0,2);
            ds.pointRadius=Math.max(Number(ds.pointRadius)||0,2);
          }
        });
        c.update('none');
      });
    }catch(err){console.warn('V7.2.5 3D chart polish skipped',err);}
  }

  function isExportControl(target){
    return !!target?.closest?.('#exportBtn,#downloadReconCsv,[data-report]');
  }

  document.addEventListener('click',async e=>{
    if(!isExportControl(e.target))return;
    if(bypassExportOnce){bypassExportOnce=false;return;}
    if(exportUnlocked)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if(!(await requestAccess('export report')))return;
    exportUnlocked=true;
    alert('Password benar. Export dibuka untuk sesi ini sampai halaman direfresh.');
    const btn=e.target.closest('#exportBtn,#downloadReconCsv,[data-report]');
    if(btn){bypassExportOnce=true;btn.click();}
  },true);

  document.addEventListener('click',async e=>{
    const upload=e.target?.closest?.('.action.upload');
    if(!upload)return;
    if(bypassUploadClick){bypassUploadClick=false;return;}
    if(uploadUnlocked)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if(!(await requestAccess('upload Excel')))return;
    uploadUnlocked=true;
    alert('Password benar. Upload Excel dibuka untuk sesi ini sampai halaman direfresh.');
    const input=document.getElementById('excelUpload');
    if(input){bypassUploadClick=true;input.click();}
  },true);

  document.getElementById('excelUpload')?.addEventListener('change',e=>{
    if(uploadUnlocked)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.target.value='';
    alert('Upload Excel terkunci. Klik tombol UPLOAD EXCEL dan masukkan password terlebih dahulu.');
  },true);

  function ensureDistributionDetail(){
    const page=document.getElementById('fuel-truck');
    if(!page)return null;
    let panel=page.querySelector('.v725-distribution-detail');
    if(!panel){
      panel=document.createElement('article');
      panel.className='panel v725-distribution-detail';
      panel.innerHTML=`<div class="v725-distribution-head"><h3>DAILY FUEL DISTRIBUTION BY FUEL TRUCK</h3><small>Total & persentase berdasarkan total distribusi pada periode filter aktif</small></div><div class="v725-dist-table-wrap"><table class="v725-dist-table"><thead><tr><th>DATE</th><th>HARI</th><th>FUEL TRUCK</th><th>TOTAL DISTRIBUSI</th><th>% PERIODE</th></tr></thead><tbody></tbody></table></div>`;
      page.appendChild(panel);
    }
    return panel;
  }

  function renderDistributionDetail(){
    const panel=ensureDistributionDetail();
    if(!panel)return;
    const rows=(typeof state!=='undefined'&&Array.isArray(state.filtered))?state.filtered:[];
    const total=rows.reduce((a,r)=>a+(Number(r.Fuel_Liter)||0),0);
    const map=new Map();
    rows.forEach(r=>{
      const date=r.Date||'';
      const truck=(r.Fuel_Truck||'').trim();
      if(!date||!truck)return;
      const key=`${date}||${truck}`;
      map.set(key,(map.get(key)||0)+(Number(r.Fuel_Liter)||0));
    });
    const data=[...map.entries()].map(([key,liter])=>{
      const [date,truck]=key.split('||');
      return {date,truck,liter};
    }).sort((a,b)=>a.date.localeCompare(b.date)||a.truck.localeCompare(b.truck));
    const body=panel.querySelector('tbody');
    body.innerHTML=data.length?data.map(r=>`<tr><td>${dateLongID(r.date)}</td><td>${dayID(r.date)}</td><td>${r.truck}</td><td>${fmtID(r.liter)} Liter</td><td class="v725-dist-pct">${total?((r.liter/total)*100).toFixed(2):'0.00'}%</td></tr>`).join(''):'<tr><td colspan="5">Belum ada data distribusi pada periode yang dipilih.</td></tr>';
  }

  function apply(){
    setBranding();
    forceStockTime();
    observeUsageTable();
    paintUsageStatuses();
    renderDistributionDetail();
    polish3DCharts();
  }

  apply();
  setTimeout(apply,250);
  setTimeout(apply,700);
  setTimeout(apply,1500);

  ['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',()=>setTimeout(apply,100));
  });
  document.getElementById('unitSearch')?.addEventListener('input',()=>setTimeout(apply,120));
  document.querySelectorAll('.nav-link').forEach(a=>a.addEventListener('click',()=>setTimeout(apply,120)));
})();
