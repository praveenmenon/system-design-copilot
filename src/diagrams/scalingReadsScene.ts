export type DiagramData = {
    type: "excalidraw",
    scene: { elements: any[]; appState: any; files: Record<string, unknown> }
  }
  const LAYERS = { client:0, edge:1, gateway:2, service:3, async:4, data:5 };
  function pos(layer:number,row:number){ const x0=80,y0=80,xg=260,yg=120,w=180,h=64; return {x:x0+layer*xg,y:y0+row*yg,w,h}; }
  function rect(E:any[], id:string, p:any, label:string){ E.push({id,type:"rectangle",x:p.x,y:p.y,width:p.w,height:p.h,angle:0,strokeColor:"#1e1e1e",backgroundColor:"transparent",fillStyle:"hachure",strokeWidth:1,strokeStyle:"solid",roughness:1,opacity:100,roundness:{type:3},seed:Math.random()*1e9|0,version:1,versionNonce:Math.random()*1e9|0,isDeleted:false}); E.push({id:id+"-t",type:"text",x:p.x+10,y:p.y+18,width:Math.max(60,label.length*7),height:24,strokeColor:"#1e1e1e",backgroundColor:"transparent",seed:Math.random()*1e9|0,version:1,versionNonce:Math.random()*1e9|0,isDeleted:false,text:label,fontSize:18,fontFamily:1,textAlign:"left",baseline:18}); }
  function arrow(E:any[], a:any, b:any, label?:string){ E.push({id:"a-"+Math.random().toString(36).slice(2),type:"arrow",x:a.x+a.w,y:a.y+a.h/2,width:b.x-(a.x+a.w),height:b.y+b.h/2-(a.y+a.h/2),strokeColor:"#1e1e1e",fillStyle:"hachure",strokeWidth:1,strokeStyle:"solid",roughness:1,opacity:100,seed:Math.random()*1e9|0,version:1,versionNonce:Math.random()*1e9|0,isDeleted:false,points:[[0,0],[b.x-(a.x+a.w), b.y+b.h/2-(a.y+a.h/2)]],endArrowhead:"arrow"}); if(label){E.push({id:"al-"+Math.random().toString(36).slice(2),type:"text",x:(a.x+a.w+b.x)/2-label.length*3,y:(a.y+a.h/2+b.y+b.h/2)/2-14,width:label.length*6+20,height:22,strokeColor:"#1e1e1e",backgroundColor:"transparent",seed:Math.random()*1e9|0,version:1,versionNonce:Math.random()*1e9|0,isDeleted:false,text:label,fontSize:14,fontFamily:1,textAlign:"center",baseline:18});}}
  export function scalingReadsScene(): DiagramData {
    const E:any[]=[];
    const client=pos(LAYERS.client,0); rect(E,"client",client,"Client");
    const cdn=pos(LAYERS.edge,0); rect(E,"cdn",cdn,"CDN");
    const gw=pos(LAYERS.gateway,0); rect(E,"gw",gw,"API Gateway");
    const svc=pos(LAYERS.service,0); rect(E,"svc",svc,"Read Service");
    const cache=pos(LAYERS.data,0); rect(E,"cache",cache,"Cache");
    const dbro=pos(LAYERS.data,1); rect(E,"dbro",dbro,"Read Replica");
    const db=pos(LAYERS.data,2); rect(E,"db",db,"Primary DB");
  
    arrow(E, client, cdn, "GET (cached)");
    arrow(E, client, gw, "GET (miss)");
    arrow(E, gw, svc, "Route");
    arrow(E, svc, cache, "Read-through");
    arrow(E, svc, dbro, "Query");
    arrow(E, db, dbro, "Replicate");
  
    const xs=E.flatMap((el:any)=>[el.x,el.x+(el.width||0)]), ys=E.flatMap((el:any)=>[el.y,el.y+(el.height||0)]);
    const appState = { viewBackgroundColor:"#fff", zoom:1, scrollX:-(Math.min(...xs)-80), scrollY:-(Math.min(...ys)-80) };
    return { type:"excalidraw", scene:{ elements:E, appState, files:{} } };
  }
  export default scalingReadsScene;
  