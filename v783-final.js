(()=>{
'use strict';
function moveStockTotal(){
  const panel=document.querySelector('.stock-panel');
  const total=panel?.querySelector('.stock-total');
  const cols=panel?.querySelector('.stock-cols');
  const truckCol=cols?.children?.[1];
  if(!panel||!total||!cols||!truckCol)return;
  if(window.matchMedia('(max-width: 768px)').matches){
    if(total.parentElement!==truckCol) truckCol.appendChild(total);
  }else{
    if(total.parentElement!==panel) panel.insertBefore(total,cols);
  }
  const label=total.querySelector('small');if(label)label.textContent='TOTAL STOCK';
}
function resizeShift(){
  try{
    const c=typeof state!=='undefined'?state.charts?.shift:null;
    if(c){c.resize();c.update('none');}
  }catch(_){ }
}
function finalLayout(){moveStockTotal();requestAnimationFrame(resizeShift)}
window.addEventListener('resize',()=>{clearTimeout(window.__v783FinalResize);window.__v783FinalResize=setTimeout(finalLayout,120)});
window.addEventListener('orientationchange',()=>setTimeout(finalLayout,180));
window.addEventListener('pageshow',finalLayout);
document.querySelectorAll('.nav-link[data-section]').forEach(a=>a.addEventListener('click',()=>setTimeout(finalLayout,40)));
setTimeout(finalLayout,60);setTimeout(finalLayout,500);setTimeout(finalLayout,1800);
})();