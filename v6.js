(()=>{
  // Replace missing logo image with inline PRIMA-style SVG.
  const img=document.querySelector('.logo-box img');
  if(img){
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="230" height="82" viewBox="0 0 230 82"><rect width="230" height="82" fill="white"/><text x="26" y="54" font-family="Arial,Helvetica,sans-serif" font-size="42" font-style="italic" font-weight="900" fill="#0a58b0">PRIMA</text><circle cx="119" cy="27" r="6" fill="#ef2d2d"/><path d="M18 61 C52 74, 92 73, 134 61" fill="none" stroke="#a9a9a9" stroke-width="5" stroke-linecap="round"/></svg>`;
    img.src='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  }

  // Improve dense daily chart labels on wide date ranges while keeping liter values visible.
  try{
    const c=state?.charts?.daily;
    if(c){
      c.options.plugins.datalabels.font={size:8,weight:'bold'};
      c.options.plugins.datalabels.offset=2;
      c.options.plugins.datalabels.formatter=(v,ctx)=>{
        const count=ctx.chart.data.labels.length;
        return count>18 && ctx.dataIndex%2===1 ? '' : fmt(v);
      };
      c.options.scales.x.ticks.maxTicksLimit=14;
      c.update();
    }
  }catch(e){console.warn('v6 chart polish skipped',e)}
})();