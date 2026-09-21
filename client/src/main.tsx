import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {io} from "socket.io-client";
import "./styles.css";

type Case={id:string,title:string,status:string,priority:string,assignedTo:string};
const initial:Case[]=[
 {id:"CW-1001",title:"Breast tissue review",status:"Pending",priority:"High",assignedTo:"Dr. Rao"},
 {id:"CW-1002",title:"Lung biopsy",status:"In Review",priority:"Medium",assignedTo:"Dr. Mehta"},
 {id:"CW-1003",title:"Skin lesion",status:"Completed",priority:"Low",assignedTo:"Dr. Singh"}
];

function App(){
 const [cases,setCases]=useState<Case[]>(initial);
 const [online,setOnline]=useState(false);
 useEffect(()=>{
   const socket=io("http://localhost:4100");
   socket.on("connect",()=>setOnline(true));
   socket.on("disconnect",()=>setOnline(false));
   socket.on("cases:init",(data:Case[])=>setCases(data));
   socket.on("case:updated",(updated:Case)=>setCases(prev=>prev.map(c=>c.id===updated.id?updated:c)));
   return ()=>{socket.disconnect()};
 },[]);
 return <main className="shell">
   <header><div><p className="eyebrow">WORKFLOWQUEUE</p><h1>Clinical Workflow Dashboard</h1></div><span className={online?"live":"offline"}>{online?"● Live":"○ Offline"}</span></header>
   <section className="summary"><div><span>Open Queue</span><strong>{cases.filter(c=>c.status!=="Completed").length}</strong></div><div><span>High Priority</span><strong>{cases.filter(c=>c.priority==="High").length}</strong></div><div><span>Connected Users</span><strong>5</strong></div></section>
   <section className="board"><h2>Case Queue</h2>{cases.map(c=><article key={c.id}><div><small>{c.id} · {c.priority} priority</small><h3>{c.title}</h3><p>Assigned to {c.assignedTo}</p></div><select value={c.status} onChange={e=>setCases(prev=>prev.map(x=>x.id===c.id?{...x,status:e.target.value}:x))}><option>Pending</option><option>In Review</option><option>Completed</option></select></article>)}</section>
 </main>
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
