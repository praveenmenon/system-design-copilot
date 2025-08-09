export type DiagramData = {
    type: "excalidraw",
    scene: { elements: any[]; appState: any; files: Record<string, unknown> }
  }
  const L={client:0, edge:1, gateway:2, service:3, async:4, data:5};
  const P=(l:number,r:number)=>({x:80+260*l,y:80+120*r,w:180,h:64});
  function R(E:any[], id:string, p:any, label:string){E.push({id,type:"rectangle",x:p.x,y:p.y,width:p.w,height:p.h,angle:0,strokeColor:"#1e1e1e",backgroundColor:"transparent",fillStyle:"hachure",strokeWidth:1,strokeStyle:"solid",roughness:1,opacity:100,roundness:{type:3},seed:Math.random()*1e9|0,version:1,versionNonce:Math.random()*1e9|0,isDeleted:false});E.push({id:id+"-t",type:"text",x:p.x+10,y:p.y+18,width:Math.max(60,label.length*7),height:24,strokeColor:"#1e1e1e",backgroundColor:"transparent",seed:Math.random()*1e9|0,version:1,versionNonce:Math.random()*1e9|0,isDeleted:false,text:label,fontSize:18,fontFamily:1,textAlign:"left",baseline:18});}
  function A(E:any[], a:any, b:any, label?:string){E.push({id:"a-"+Math.random().toString(36).slice(2),type:"arrow",x:a.x+a.w,y:a.y+a.h/2,width:b.x-(a.x+a.w),height:b.y+b.h/2-(a.y+a.h/2),strokeColor:"#1e1e1e",fillStyle:"hachure",strokeWidth:1,strokeStyle:"solid",roughness:1,opacity:100,seed:Math.random()*1e9|0,version:1,versionNonce:Math.random()*1e9|0,isDeleted:false,points:[[0,0],[b.x-(a.x+a.w), b.y+b.h/2-(a.y+a.h/2)]],endArrowhead:"arrow"}); if(label){E.push({id:"al-"+Math.random().toString(36).slice(2),type:"text",x:(a.x+a.w+b.x)/2-label.length*3,y:(a.y+a.h/2+b.y+b.h/2)/2-14,width:label.length*6+20,height:22,strokeColor:"#1e1e1e",backgroundColor:"transparent",seed:Math.random()*1e9|0,version:1,versionNonce:Math.random()*1e9|0,isDeleted:false,text:label,fontSize:14,fontFamily:1,textAlign:"center",baseline:18});}}
  export function contentionScene(): DiagramData {
    const E:any[]=[];
    const client=P(L.client,0); R(E,"client",client,"Client");
    const gw=P(L.gateway,0); R(E,"gw",gw,"API Gateway");
    const svc=P(L.service,0); R(E,"svc",svc,"Reservation Service");
    const q=P(L.async,0); R(E,"queue",q,"Per-item Queue");
    const reaper=P(L.async,1); R(E,"reaper",reaper,"Hold Reaper");
    const db=P(L.data,0); R(E,"db",db,"Inventory DB");
  
    A(E, client, gw, "POST /reserve");
    A(E, gw, svc, "Route");
    A(E, svc, q, "Serialize");
    A(E, q, reaper, "Consume");
    A(E, reaper, db, "Upsert/expire");
    A(E, svc, db, "Confirm txn");
  
    const xs=E.flatMap((el:any)=>[el.x,el.x+(el.width||0)]), ys=E.flatMap((el:any)=>[el.y,el.y+(el.height||0)]);
    const appState={viewBackgroundColor:"#fff", zoom:1, scrollX:-(Math.min(...xs)-80), scrollY:-(Math.min(...ys)-80)};
    return { type:"excalidraw", scene:{ elements:E, appState, files:{} } };
  }
  export default contentionScene;
  