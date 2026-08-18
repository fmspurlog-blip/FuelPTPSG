(()=>{
'use strict';
let moving=false;
function moveStockTotal(){
  if(moving)return;
  const panel=document.querySelector('.stock-panel');
  const total=panel?.querySelector('.stock-total');
  const cols=panel?.querySelector('.stock-cols');
  const truckCol=cols?.children?.[1];
  if(!panel||!total||!cols||!truckCol)return;
  moving=true;
  try{
    if(window.matchMedia('(max-width:768px)').matches){
      if(total.parentElement!==truckCol)truckCol.appendChild(total);
      total.classList.add('v783-stock-mobile');
    }else{
      total.classList.remove('v783-stock-mobile');
      if(total.parentElement!==panel)panel.insertBefore(total,cols);
    }
    const label=total.querySelector('small');if(label)label.textContent='TOTAL STOCK';
  }finally{moving=false;}
}
function resizeShift(){
  try{
    const c=typeof state!=='undefined'?state.charts?.shift:null;
    if(c){c.resize();c.update('none');}
  }catch(_){ }
}
function finalLayout(){moveStockTotal();requestAnimationFrame(resizeShift)}
window.addEventListener('resize',()=>{clearTimeout(window.__v783FinalResize);window.__v783FinalResize=setTimeout(finalLayout,100)});
window.addEventListener('orientationchange',()=>setTimeout(finalLayout,180));
window.addEventListener('pageshow',finalLayout);
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>setTimeout(finalLayout,40)));
const stockPanel=document.querySelector('.stock-panel');
if(stockPanel){const mo=new MutationObserver(()=>{if(!moving)queueMicrotask(finalLayout)});mo.observe(stockPanel,{childList:true,subtree:true});}
setTimeout(finalLayout,50);setTimeout(finalLayout,350);setTimeout(finalLayout,1200);setTimeout(finalLayout,3200);
})();