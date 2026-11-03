/*
 * Peridot's approved Option 2 Forest Study visual renderer.
 * One drawing authority for the worker and main-thread fallback.
 * The fixed facet geometry, pulse order, ring sequence, and 75% timing are
 * preserved from the verified post-rollback loading component.
 */
export const PALETTES = {
  forest: { bg: '#253a30', gold: '#E4BE69', green: '#A8D68C', red: '#D97465', peridot: '#C5E889' },
  parchment: { bg: '#eee7d8', gold: '#B58A37', green: '#507749', red: '#9E4336', peridot: '#91BE67' },
};

const PHASES = [1.02, .38, 1.05, .75, .50];
const TOTAL_DURATION = PHASES.reduce((sum, value) => sum + value, 0);
const PHASE_ENDS = PHASES.reduce((a, value) => [...a, (a[a.length - 1] || 0) + value], []);

export function createGemRenderer(ctx, theme) {
  const col = PALETTES[theme];
  const shadeStrength = .85;
  const shineEnabled = true;
  const gemOutline = theme === 'forest' ? '#2D5942' : col.green; // Approved pine-ink forest outline.
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const polar=(r,a)=>({x:r*Math.cos(a),y:r*Math.sin(a)}), mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const pt=(n,i,r,offset=-Math.PI/2)=>polar(r,offset+i*TAU/n);
// Gem stop radius: deliberately smaller than previous v09 (formerly 107).
const table=Array.from({length:8},(_,i)=>pt(8,i,33,-Math.PI/2-Math.PI/8));
const stars=Array.from({length:16},(_,i)=>pt(16,i,55,-Math.PI/2-Math.PI/16));
const rim=Array.from({length:16},(_,i)=>pt(16,i,78,-Math.PI/2-Math.PI/16));
const gemBackgroundRadius=83;
function stroke(a,b,p){if(p<=0)return;const e=mix(a,b,clamp(p));ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(e.x,e.y);ctx.stroke()}
function poly(pts,p){for(let i=0;i<pts.length;i++)stroke(pts[i],pts[(i+1)%pts.length],p)}
function circle(r,p,start=-Math.PI/2){if(p<=0)return;ctx.beginPath();ctx.arc(0,0,r,start,start+TAU*clamp(p));ctx.stroke()}
function prog(p,a,b){return ease((p-a)/(b-a))}
function fillPolygon(points,color,opacity){if(opacity<=0)return;ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();ctx.fill();ctx.restore()}
function hexToRgb(hex){const h=hex.replace('#','');const n=parseInt(h,16);return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}}
function mixColor(a,b,t){t=clamp(t);const ca=hexToRgb(a),cb=hexToRgb(b);const r=Math.round(ca.r+(cb.r-ca.r)*t),g=Math.round(ca.g+(cb.g-ca.g)*t),bl=Math.round(ca.b+(cb.b-ca.b)*t);return `rgb(${r}, ${g}, ${bl})`}
// Distinct facet values follow the geometry of the drawn cut, rather than
// imposing a generic gradient on the gemstone. Consistent lighting from upper left.
const cutColors={
 parchment:['#EDF4C1','#D8EAA0','#B9D775','#9FC55A','#77A447','#538539','#39652F','#244E31'],
 ivory:['#EDF4C1','#D8EAA0','#B9D775','#9FC55A','#77A447','#538539','#39652F','#244E31'],
 forest:['#E0F2AA','#C9E790','#A7D875','#83BF5B','#65A748','#468C40','#347641','#205C3A']
};
// Each polygon has a fixed base shade. A diagonal traveling light briefly
// changes that polygon's color according to its centroid and shade value.
// This avoids placing a translucent stripe across the entire gemstone.
function facetIllumination(points,wave,baseIndex){
 if(!shineEnabled || wave<0 || wave>1)return 0;
 const centroid=points.reduce((a,v)=>({x:a.x+v.x/points.length,y:a.y+v.y/points.length}),{x:0,y:0});
 const location=(centroid.x+centroid.y)*Math.SQRT1_2;
 const travel=-132+264*ease(wave);
 const distance=(location-travel)/24;
 const amount=Math.exp(-.5*distance*distance);
 // Darker facets catch less of the light than already-bright facets.
 const sensitivity=[.92,.88,.80,.73,.62,.49,.37,.28][baseIndex];
 return amount*sensitivity;
}
function shadedFacet(points,colors,index,opacity=1,wave=-1){
 const response=facetIllumination(points,wave,index);
 const brightColor=theme==='forest'?'#F1FFD0':'#F2F8C8';
 const color=mixColor(colors[index],brightColor,.78*response);
 fillPolygon(points,color,shadeStrength*opacity);
}
function gemstone(p,col,wave=-1){
 const rays=prog(p,0,.48),starRing=prog(p,.22,.67),outer=prog(p,.40,.87),finish=prog(p,.70,1);
 const colors=cutColors[theme];
 if(shadeStrength>0){
   // A pale central table; the surrounding crown facets remain individually shaded.
   shadedFacet(table,colors,1,.94,wave);
   for(let i=0;i<8;i++){
     const k=2*i, next=(i+1)%8;
     shadedFacet([table[i],stars[k],stars[(k+1)%16]],colors,[0,1,2,3,4,5,6,2][i],.96,wave);
     shadedFacet([table[i],table[next],stars[(k+1)%16]],colors,[1,2,3,4,6,7,5,0][i],.91,wave);
     shadedFacet([table[next],stars[(k+1)%16],stars[(k+2)%16]],colors,[0,1,3,5,7,6,4,1][i],.94,wave);
   }
   for(let i=0;i<16;i++){
     const j=(i+1)%16;
     if(i%2===0){
       shadedFacet([stars[i],rim[i],rim[j]],colors,[1,0,1,2,3,4,5,6,7,6,5,3,2,1,0,1][i],.96,wave);
       shadedFacet([stars[i],rim[j],stars[j]],colors,[0,1,2,3,5,6,7,6,5,4,3,2,1,0,1,0][i],.94,wave);
     }else{
       shadedFacet([stars[i],rim[i],rim[j],stars[j]],colors,[1,0,2,2,4,5,6,7,6,5,4,3,2,1,0,1][i],.93,wave);
     }
   }
 }
 ctx.strokeStyle=(theme === 'forest' ? gemOutline : col.green);ctx.lineWidth=1.85;
 for(let i=0;i<8;i++){
   stroke(table[i],stars[(2*i)%16],rays);
   stroke(table[i],stars[(2*i+1)%16],rays);
   stroke(table[i],stars[(2*i+15)%16],rays);
 }
 ctx.lineWidth=1.35;poly(stars,starRing);
 for(let i=0;i<16;i++){
   stroke(stars[i],rim[i],outer);
   if(i%2===0)stroke(stars[i],rim[(i+1)%16],outer);
 }
 ctx.lineWidth=2.25;poly(rim,finish);
 ctx.lineWidth=1.25;circle(81,finish);
 ctx.lineWidth=2.6;poly(table,1);
}
function compassStar(p,col,wave=-1){
 // Long cardinal points establish the compass first; diagonal points follow.
 // All visible arms share the same rotational transform in render().
 const order=[0,2,4,6,1,3,5,7];
 const stagger=.075, armDuration=.435;
 for(let step=0;step<order.length;step++){
   const i=order[step];
   const armP=ease(clamp((p-step*stagger)/armDuration));
   if(armP<=0)continue;
   const angle=-Math.PI/2+i*Math.PI/4, major=i%2===0;
   const baseR=63,tipR=major?184:139,half=major?.235:.175;
   const left=polar(baseR,angle-half),right=polar(baseR,angle+half),mid=polar(baseR,angle),tip=polar(tipR,angle);
   // Each arm pulses independently around the clock; the completed star
   // does not rotate, and the gemstone and compass ring remain stationary.
   let armScale=1, pulseColorAmt=0;
   if(wave>=0){
     const waveOffset=i*.075;
     const u=(wave-waveOffset)/.49;
     if(u>0&&u<1){
       const pulse=u<.38?ease(u/.38):1-ease((u-.38)/.62);
       armScale+=.055*pulse;
       pulseColorAmt=pulse;
     }
   }
   ctx.save();ctx.scale(armScale,armScale);
   // Each point genuinely extends outward from its base, instead of
   // shortening its endpoints and shortening its strokes a second time.
   const activeTip=mix(mid,tip,armP);
   const shadeColor=mixColor(col.red,col.peridot,pulseColorAmt);
   const lineColor=mixColor(col.gold,col.green,pulseColorAmt);
   fillPolygon([left,mid,activeTip],shadeColor,(.38+.10*pulseColorAmt)*armP);
   ctx.strokeStyle=lineColor;ctx.lineWidth=major?2.5:2.0;
   stroke(left,activeTip,1);stroke(right,activeTip,1);
   ctx.lineWidth=1.15;stroke(mid,activeTip,prog(armP,.35,1));
   ctx.restore();
 }
}
function outerBorder(p,col,erasing=false){
 // Drawing: both strokes advance clockwise from north and south.
 // Erasing: the START of each completed half-arc advances along that same
 // clockwise path, leaving the leading endpoints fixed. No backward retraction.
 const r=146, progress=ease(clamp(p));
 const a1=-Math.PI/2,a2=Math.PI/2;
 ctx.strokeStyle=col.gold;ctx.lineWidth=1.75;
 const drawSweep=Math.PI*progress;
 const startOffset=erasing?drawSweep:0;
 const endOffset=erasing?Math.PI:drawSweep;
 if(endOffset-startOffset>1e-5){
   for(const origin of [a1,a2]){
     ctx.beginPath();ctx.arc(0,0,r,origin+startOffset,origin+endOffset,false);ctx.stroke();
   }
 }
 // Graduations follow the same forward-moving draw/erase front.
 const count=24;
 for(let i=0;i<count;i++){
   const offset=(i+.5)*TAU/count;
   const withinHalf=(offset%Math.PI)/Math.PI;
   const tickP=erasing
     ? 1-ease(clamp((progress-withinHalf+.015)/.13))
     : ease(clamp((progress-withinHalf-.015)/.13));
   if(tickP<=0)continue;
   const a=-Math.PI/2+offset;
   const length=i%3===1?3.5:9;
   const from=polar(r-1.5,a),to=polar(r-1.5-length*tickP,a);
   ctx.save();ctx.globalAlpha=(i%3===1?.60:.70)*tickP;
   ctx.lineWidth=i%3===1?.75:.95;stroke(from,to,1);ctx.restore();
 }
}

  return function render(elapsedSeconds, reducedMotion = false) {
    let ix = 1, local = 1;
    if (!reducedMotion) {
      const current = ((elapsedSeconds * .75) % TOTAL_DURATION + TOTAL_DURATION) % TOTAL_DURATION;
      ix = PHASE_ENDS.findIndex(end => current < end);
      if (ix < 0) ix = PHASES.length - 1;
      const prior = ix === 0 ? 0 : PHASE_ENDS[ix - 1];
      local = (current - prior) / PHASES[ix];
    }
    ctx.clearRect(0, 0, 800, 800);
    ctx.save();
    ctx.translate(400, 400);
    ctx.scale(1.58, 1.58);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    let ringProgress = 1, wave = -1, erasing = false;
    if (!reducedMotion) {
      if (ix === 0) ringProgress = local;
      if (ix === 2) wave = local;
      if (ix === 3) { ringProgress = local; erasing = true; }
      if (ix === 4) ringProgress = 0;
    }
    compassStar(1, col, wave);
    ctx.save();
    ctx.fillStyle = col.bg;
    ctx.beginPath();
    ctx.arc(0, 0, gemBackgroundRadius, 0, TAU);
    ctx.fill();
    ctx.restore();
    gemstone(1, col, wave);
    if ((!erasing && ringProgress > 0) || (erasing && ringProgress < 1)) {
      outerBorder(ringProgress, col, erasing);
    }
    ctx.restore();
  };
}

