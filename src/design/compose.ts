import type { DesignGraph, Node, Edge } from "./types";

export function mergeGraphs(graphs: DesignGraph[]): DesignGraph {
  const nodeMap = new Map<string, Node>();
  const edges: Edge[] = [];
  for (const g of graphs) { g.nodes.forEach(n => nodeMap.set(n.id, n)); edges.push(...g.edges); }
  return { nodes: [...nodeMap.values()], edges };
}

export function layoutLayers(g: DesignGraph): DesignGraph {
  const layers = ["client","edge","gateway","service","async","data"];
  const byLayer: Record<string, Node[]> = Object.fromEntries(layers.map(l=>[l, []]));
  g.nodes.forEach(n => byLayer[n.layer].push(n));
  const xGap = 260, yGap = 120, x0 = 80, y0 = 80;
  const positions: Record<string, {x:number,y:number,w:number,h:number}> = {};
  layers.forEach((layer, li) => byLayer[layer].forEach((n, idx) =>
    positions[n.id] = { x: x0 + li*xGap, y: y0 + idx*yGap, w: 180, h: 64 }));

  return { nodes: g.nodes.map(n => ({ ...n, meta: { ...(n.meta||{}), pos: positions[n.id] } })), edges: g.edges };
}

export function toExcalidraw(g: DesignGraph) {
  const elements:any[] = [];
  const rect = (id:string, x:number,y:number,w:number,h:number,label:string) => {
    elements.push({ id, type:"rectangle", x, y, width:w, height:h, angle:0,
      strokeColor:"#1e1e1e", backgroundColor:"transparent", fillStyle:"hachure",
      strokeWidth:1, strokeStyle:"solid", roughness:1, opacity:100,
      roundness:{ type:3 }, seed:Math.random()*1e9|0, version:1, versionNonce:Math.random()*1e9|0,
      isDeleted:false, groupIds:[], frameId:null, boundElements:[], updated: Date.now(), link:null, locked:false });
    elements.push({ id:id+"-t", type:"text", x:x+10, y:y+18, width: Math.max(60, label.length*7), height:24,
      strokeColor:"#1e1e1e", backgroundColor:"transparent", fillStyle:"hachure",
      strokeWidth:1, strokeStyle:"solid", roughness:1, opacity:100,
      seed:Math.random()*1e9|0, version:1, versionNonce:Math.random()*1e9|0,
      isDeleted:false, groupIds:[], frameId:null, boundElements:[], updated: Date.now(),
      fontSize:18, fontFamily:1, text:label, textAlign:"left", verticalAlign:"top", baseline:18 });
  };
  const arrow = (ax:number, ay:number, bx:number, by:number, label?:string) => {
    elements.push({ id: "a-"+Math.random().toString(36).slice(2), type:"arrow", x:ax, y:ay, width: bx-ax, height: by-ay,
      strokeColor:"#1e1e1e", fillStyle:"hachure", strokeWidth:1, strokeStyle:"solid", roughness:1, opacity:100,
      seed:Math.random()*1e9|0, version:1, versionNonce:Math.random()*1e9|0, isDeleted:false,
      points: [[0,0],[bx-ax, by-ay]], endArrowhead:"arrow" });
    if (label) elements.push({ id:"al-"+Math.random().toString(36).slice(2), type:"text",
      x:(ax+bx)/2 - label.length*3, y:(ay+by)/2 - 14, width:label.length*6+20, height:22,
      strokeColor:"#1e1e1e", fillStyle:"hachure", strokeWidth:1, strokeStyle:"solid", roughness:1,
      opacity:100, seed:Math.random()*1e9|0, version:1, versionNonce:Math.random()*1e9|0,
      isDeleted:false, fontSize:14, fontFamily:1, text:label, textAlign:"center", baseline:18 });
  };
  const pos = (id:string) => (g.nodes.find(n=>n.id===id)?.meta as any).pos;
  g.nodes.forEach(n => { const p = (n.meta as any).pos; rect(n.id, p.x, p.y, p.w, p.h, n.label); });
  g.edges.forEach(e => { const a = pos(e.from), b = pos(e.to); arrow(a.x+a.w, a.y+a.h/2, b.x, b.y+b.h/2, e.label); });

  const xs = elements.flatMap((el:any)=>[el.x, el.x + (el.width||0)]);
  const ys = elements.flatMap((el:any)=>[el.y, el.y + (el.height||0)]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const appState = { viewBackgroundColor:"#ffffff", zoom:1, scrollX: -(minX - 80), scrollY: -(minY - 80) };
  return { elements, appState, files:{} };
}
