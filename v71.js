(()=>{
  const applyV71=()=>{
    try{
      const logoBox=document.querySelector('.logo-box');
      if(logoBox && !logoBox.querySelector('.refueling-brand')){
        logoBox.innerHTML='<div class="refueling-brand"><div class="rf-top">REFUELING</div><div class="rf-mid">CONTROL</div><div class="rf-site">PSG Site ABM</div></div>';
      }

      const stockHeading=document.querySelector('.stock-panel>h3');
      if(stockHeading){
        stockHeading.innerHTML=stockHeading.innerHTML.replace(/<em>\s*2\.\s*<\/em>\s*/i,'').replace(/^\s*2\.\s*/,'');
      }

      const icons=document.querySelectorAll('.unit-types .unit-icon');
      if(icons[0]){
        icons[0].innerHTML=`<svg viewBox="0 0 120 90" aria-label="Excavator" role="img">
          <g fill="none" stroke="#f6a21a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 66h61l12 9H27z" fill="#f6a21a" stroke="#f6a21a"/>
            <path d="M37 61V37h23l13 24" fill="#f6a21a"/>
            <path d="M48 35l16-22 14 3-9 20"/>
            <path d="M77 17l20 11-5 9-21-7"/>
            <path d="M96 29l13 5-6 14-12-5z" fill="#f6a21a"/>
            <circle cx="38" cy="74" r="8" fill="#24394d" stroke="#dbe6ef" stroke-width="3"/>
            <circle cx="70" cy="74" r="8" fill="#24394d" stroke="#dbe6ef" stroke-width="3"/>
          </g>
        </svg>`;
      }
      if(icons[1]){
        icons[1].innerHTML=`<svg viewBox="0 0 120 90" aria-label="Three gears" role="img">
          <g fill="#c9d6e2" stroke="#eef5fb" stroke-width="2">
            <g transform="translate(37 48)"><circle r="19"/><circle r="7" fill="#0b2035"/>
              <path d="M-4-25h8l3 8-7 3-7-3zM-4 25h8l3-8-7-3-7 3zM-25-4v8l8 3 3-7-3-7zM25-4v8l-8 3-3-7 3-7z"/>
            </g>
            <g transform="translate(78 32)"><circle r="15"/><circle r="5" fill="#0b2035"/>
              <path d="M-3-20h6l3 6-6 3-6-3zM-3 20h6l3-6-6-3-6 3zM-20-3v6l6 3 3-6-3-6zM20-3v6l-6 3-3-6 3-6z"/>
            </g>
            <g transform="translate(78 68)"><circle r="15"/><circle r="5" fill="#0b2035"/>
              <path d="M-3-20h6l3 6-6 3-6-3zM-3 20h6l3-6-6-3-6 3zM-20-3v6l6 3 3-6-3-6zM20-3v6l-6 3-3-6 3-6z"/>
            </g>
          </g>
        </svg>`;
      }

      const charts=(typeof state!=='undefined' && state && state.charts)?state.charts:{};
      ['truck','status'].forEach(name=>{
        const c=charts[name];
        if(!c)return;
        if(c.options?.plugins?.legend?.labels){
          c.options.plugins.legend.labels.color='#ffffff';
          c.options.plugins.legend.labels.font={size:10,weight:'700'};
        }
        c.update('none');
      });

      const version=document.querySelector('.v7-version');
      if(version)version.textContent='Dashboard V7.1 Professional';
    }catch(err){console.warn('V7.1 patch skipped',err)}
  };

  applyV71();
  setTimeout(applyV71,350);
  setTimeout(applyV71,1000);
})();