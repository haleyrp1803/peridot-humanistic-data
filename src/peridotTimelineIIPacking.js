/* Timeline II / Packing A.
 * Pure, deterministic viewport layout. Chronological coordinates are read-only.
 * A bounded initial placement is followed by two local improvement sweeps.
 * Packing B accepts locked prior assignments for spatial stability during pan.
 */
export const TIMELINE_II_LANE_COUNT = 20;

const less = (a,b) => {
  for(let i=0;i<a.length;i++) {
    if(a[i] < b[i]-1e-8)return true;
    if(a[i] > b[i]+1e-8)return false;
  }
  return false;
};

export function packTimelineIIMarks(items, lanePositions, {nodeDiameter=46.5,bandThickness=34.5,padding=9,sweeps=2,lockedLanes=null}={}) {
  if (!Array.isArray(items) || !Array.isArray(lanePositions) || !lanePositions.length) return [];
  const n=items.length, laneCount=lanePositions.length;
  if(!n)return [];
  const footprints=items.map((item,index)=>{
    const start=Number(item.start),finish=Number(item.finish);
    const period=Boolean(item.period);
    const t0=period?Math.min(start,finish):start-nodeDiameter/2;
    const t1=period?Math.max(Math.max(start,finish),t0+bandThickness):start+nodeDiameter/2;
    return {index,id:String(item.id??index),period,start:t0,end:t1,radius:(period?bandThickness:nodeDiameter)/2};
  });
  // A conflict graph prevents repeatedly scanning unrelated marks. It also
  // makes chronological neighborhoods independent of the input order.
  const neighbors=Array.from({length:n},()=>[]);
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    const a=footprints[i],b=footprints[j];
    if(a.start>=b.end+padding || b.start>=a.end+padding)continue;
    neighbors[i].push(j);neighbors[j].push(i);
  }
  const assignments=Array(n).fill(-1);
  const locked=Array(n).fill(false);
  // Reuse previously seen lanes at the same scale/orientation. Existing marks
  // stay fixed while newly entering marks are fitted around them.
  for(let i=0;i<n;i++){
    const prior=lockedLanes instanceof Map ? lockedLanes.get(footprints[i].id) : null;
    if(Number.isInteger(prior) && prior>=0 && prior<laneCount){
      assignments[i]=prior;
      locked[i]=true;
    }
  }
  const laneSpace=Math.max(1,(lanePositions[laneCount-1]-lanePositions[0])/Math.max(1,laneCount-1));
  const conflictCost=(i,li,j,lj)=>{
    const a=footprints[i],b=footprints[j];
    const crossGap=Math.abs(lanePositions[li]-lanePositions[lj]);
    const required=a.radius+b.radius+padding;
    if(crossGap>=required)return 0;
    const shared=Math.max(0,Math.min(a.end,b.end)-Math.max(a.start,b.start));
    const chronologicalNear=a.start<b.end+padding&&b.start<a.end+padding;
    if(!chronologicalNear)return 0;
    const crossOverlap=(required-crossGap)/required;
    const temporalOverlap=shared;
    // Protect the discoverability of point nodes, but consider every band.
    const kindWeight=(!a.period&&!b.period)?5:(a.period!==b.period?3:1);
    return kindWeight*(Math.max(0,temporalOverlap)+padding*0.15)*crossOverlap;
  };
  const score=(i,lane)=>{
    let impact=0, collisions=0, crowded=0;
    for(const j of neighbors[i]){
      if(assignments[j]<0)continue;
      const c=conflictCost(i,lane,j,assignments[j]);
      if(c>0){impact+=c;collisions++;}
      else if(Math.abs(lanePositions[lane]-lanePositions[assignments[j]])<laneSpace*1.4)crowded++;
    }
    // Actual occupancy of a lane in the local temporal neighborhood, rather
    // than a global count of all events ever assigned to it.
    let localUsage=0;
    for(const j of neighbors[i])if(assignments[j]===lane)localUsage++;
    return [impact,collisions,localUsage,crowded,Math.abs(lane-(laneCount-1)/2)*0.001,lane];
  };
  // Place the most constrained marks first, independent of original event order.
  const order=Array.from({length:n},(_,i)=>i).sort((i,j)=>
    neighbors[j].length-neighbors[i].length ||
    Number(footprints[i].period)-Number(footprints[j].period) ||
    footprints[j].end-footprints[j].start-(footprints[i].end-footprints[i].start) ||
    footprints[i].start-footprints[j].start || footprints[i].id.localeCompare(footprints[j].id));
  for(const i of order){
    if(locked[i])continue;
    let best=0,bestScore=null;
    for(let l=0;l<laneCount;l++){
      const candidate=score(i,l);
      if(!bestScore||less(candidate,bestScore)){bestScore=candidate;best=l;}
    }
    assignments[i]=best;
  }
  // Local best-response swaps: changes are allowed only where a genuine
  // collision improvement occurs or an equal-cost move reduces local crowding.
  for(let pass=0;pass<Math.max(0,Math.min(4,sweeps));pass++){
    let moved=0;
    for(const i of (pass%2?[...order].reverse():order)){
      if(locked[i])continue;
      const current=assignments[i],currentScore=score(i,current);
      let best=current,bestScore=currentScore;
      for(let l=0;l<laneCount;l++){
        if(l===current)continue;
        const candidate=score(i,l);
        if(less(candidate,bestScore)) {best=l;bestScore=candidate;}
      }
      if(best!==current){assignments[i]=best;moved++;}
    }
    if(!moved)break;
  }
  return assignments;
}

export function timelineIIPackingMetrics(items, lanes, lanePositions, settings={}) {
  // Test-facing metric: count and weighted area of collisions across all pairs.
  const radius=item=>(item.period?(settings.bandThickness??34.5):(settings.nodeDiameter??46.5))/2;
  let collisions=0,area=0;
  for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
    const a=items[i],b=items[j];
    const a0=a.period?a.start:a.start-radius(a),a1=a.period?Math.max(a.start+(settings.bandThickness??34.5),a.finish):a.start+radius(a);
    const b0=b.period?b.start:b.start-radius(b),b1=b.period?Math.max(b.start+(settings.bandThickness??34.5),b.finish):b.start+radius(b);
    const x=Math.max(0,Math.min(a1,b1)-Math.max(a0,b0));
    const y=Math.max(0,radius(a)+radius(b)-Math.abs(lanePositions[lanes[i]]-lanePositions[lanes[j]]));
    if(x&&y){collisions++;area+=x*y;}
  }
  return {collisions,area};
}
