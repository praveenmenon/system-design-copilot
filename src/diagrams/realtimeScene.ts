export type DiagramData = {
    type: "excalidraw",
    scene: { elements: any[]; appState: any; files: Record<string, unknown> }
  }
  
  function rect(elements:any[], id:string, x:number,y:number,w:number,h:number,label:string){
    elements.push({
      id, type:"rectangle", x, y, width:w, height:h, angle:0,
      strokeColor:"#1e1e1e", backgroundColor:"transparent", fillStyle:"hachure",
      strokeWidth:1, strokeStyle:"solid", roughness:1, opacity:100,
      roundness:{ type:3 }, seed:Math.random()*1e9|0, version:1, versionNonce:Math.random()*1e9|0,
      isDeleted:false, groupIds:[], frameId:null, boundElements:[]
    });
    elements.push({
      id:id+"-t", type:"text", x:x+10, y:y+18, width:Math.max(60,label.length*7), height:24,
      strokeColor:"#1e1e1e", backgroundColor:"transparent",
      seed:Math.random()*1e9|0, version:1, versionNonce:Math.random()*1e9|0,
      isDeleted:false, text:label, fontSize:18, fontFamily:1, textAlign:"left", baseline:18
    });
  }
  function arrow(elements:any[], ax:number,ay:number, bx:number,by:number, label?:string){
    elements.push({
      id:"a-"+Math.random().toString(36).slice(2), type:"arrow",
      x:ax, y:ay, width:bx-ax, height:by-ay, angle:0,
      strokeColor:"#1e1e1e", fillStyle:"hachure", strokeWidth:1, strokeStyle:"solid", roughness:1, opacity:100,
      seed:Math.random()*1e9|0, version:1, versionNonce:Math.random()*1e9|0, isDeleted:false,
      points:[[0,0],[bx-ax,by-ay]], startArrowhead:null, endArrowhead:"arrow"
    });
    if(label){
      elements.push({
        id:"al-"+Math.random().toString(36).slice(2), type:"text",
        x:(ax+bx)/2 - label.length*3, y:(ay+by)/2 - 14, width:label.length*6+20, height:22,
        strokeColor:"#1e1e1e", backgroundColor:"transparent",
        seed:Math.random()*1e9|0, version:1, versionNonce:Math.random()*1e9|0,
        isDeleted:false, text:label, fontSize:14, fontFamily:1, textAlign:"center", baseline:18
      });
    }
  }
  const LAYERS = { client:0, edge:1, gateway:2, service:3, async:4, data:5 };
  function pos(layer:number, row:number){ const x0=80,y0=80,xg=260,yg=120,w=180,h=64; return {x:x0+layer*xg, y:y0+row*yg, w,h}; }
  
  export function realtimeScene(): DiagramData {
    const E:any[] = [];
    const c = pos(LAYERS.client,0); rect(E,"client",c.x,c.y,c.w,c.h,"Client");
    const gw = pos(LAYERS.gateway,0); rect(E,"gw",gw.x,gw.y,gw.w,gw.h,"Realtime GW (WS/SSE)");
    const ps = pos(LAYERS.async,0); rect(E,"pubsub",ps.x,ps.y,ps.w,ps.h,"Pub/Sub");
    const nt = pos(LAYERS.service,0); rect(E,"notifier",nt.x,nt.y,nt.w,nt.h,"Notifier");
    const pc = pos(LAYERS.data,0); rect(E,"presence",pc.x,pc.y,pc.w,pc.h,"Presence Cache");
  
    arrow(E, c.x+c.w, c.y+c.h/2, gw.x, gw.y+gw.h/2, "WS/SSE");
    arrow(E, gw.x+gw.w, gw.y+gw.h/2, ps.x, ps.y+ps.h/2, "Publish");
    arrow(E, ps.x+ps.w, ps.y+ps.h/2, nt.x, nt.y+nt.h/2, "Fan-out");
    arrow(E, nt.x+nt.w, nt.y+nt.h/2, gw.x, gw.y+gw.h/2, "Push");
    arrow(E, nt.x+nt.w, nt.y+nt.h/2, pc.x, pc.y+pc.h/2, "Presence");
  
    const xs = E.flatMap((el:any)=>[el.x, el.x+(el.width||0)]);
    const ys = E.flatMap((el:any)=>[el.y, el.y+(el.height||0)]);
    const minX=Math.min(...xs), minY=Math.min(...ys), pad=80;
    const appState = { viewBackgroundColor:"#ffffff", zoom:1, scrollX:-(minX-pad), scrollY:-(minY-pad) };
  
    return { type:"excalidraw", scene:{ elements:E, appState, files:{} } };
  }
  export default realtimeScene;
  