(()=>{
'use strict';

// Fix upload flow: after v741 validates the password it calls excelUpload.click().
// Because the input lives inside label.upload, that synthetic click used to be caught
// again by the document-level protection handler. Stop it at window capture while
// keeping the input's default file-picker action intact.
window.addEventListener('click',e=>{
  if(e.target && e.target.id==='excelUpload'){
    e.stopPropagation();
  }
},true);

function forceLegendWhite(){
  try{
    if(typeof state==='undefined'||!state.charts)return;
    ['truck','status'].forEach(name=>{
      const c=state.charts[name];
      if(!c)return;
      const plugins=c.options.plugins||(c.options.plugins={});
      const legend=plugins.legend||(plugins.legend={});
      const labels=legend.labels||(legend.labels={});
      labels.color='#ffffff';
      labels.font={...(labels.font||{}),weight:'900',size:name==='truck'?10:9};
      labels.padding=name==='truck'?14:10;
      const old=labels.generateLabels;
      if(old && !old.__v747white){
        const wrapped=chart=>old(chart).map(item=>({...item,fontColor:'#ffffff',color:'#ffffff',text:item.text}));
        wrapped.__v747white=true;
        labels.generateLabels=wrapped;
      }
      c.update('none');
    });
  }catch(err){console.warn('v747 legend patch',err)}
}

function apply(){forceLegendWhite();}
apply();
[60,180,420,900,1600,2600].forEach(t=>setTimeout(apply,t));
['dateFrom','dateTo','shiftFilter','categoryFilter','truckFilter','unitSearch'].forEach(id=>{
  const el=document.getElementById(id);
  if(el)el.addEventListener(id==='unitSearch'?'input':'change',()=>{setTimeout(apply,80);setTimeout(apply,260);});
});
window.addEventListener('resize',()=>setTimeout(apply,150),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(apply,100));
})();