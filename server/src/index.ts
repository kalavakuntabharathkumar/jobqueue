import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const port = Number(process.env.PORT || 4100);
const secret = process.env.JWT_SECRET || "local-secret";
const mongo = new MongoClient(process.env.MONGO_URL || "mongodb://localhost:27017/workflowqueue");

app.use(cors());
app.use(express.json());

const demoUsers = [
  { id: "1", email: "admin@workflow.local", role: "admin" },
  { id: "2", email: "pathologist@workflow.local", role: "pathologist" },
  { id: "3", email: "technician@workflow.local", role: "technician" },
  { id: "4", email: "reviewer@workflow.local", role: "reviewer" }
];

let cases = [
  { id: "CW-1001", title: "Breast tissue review", status: "Pending", priority: "High", assignedTo: "Dr. Rao" },
  { id: "CW-1002", title: "Lung biopsy", status: "In Review", priority: "Medium", assignedTo: "Dr. Mehta" },
  { id: "CW-1003", title: "Skin lesion", status: "Completed", priority: "Low", assignedTo: "Dr. Singh" }
];

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try { (req as any).user = jwt.verify(token, secret); next(); }
  catch { res.status(401).json({ error: "Invalid token" }); }
}

app.get("/health", (_req,res)=>res.json({status:"ok"}));

app.post("/api/auth/login", (req,res)=>{
  const user = demoUsers.find(u=>u.email===req.body.email);
  if (!user || !req.body.password) return res.status(401).json({error:"Invalid credentials"});
  res.json({token:jwt.sign(user,secret,{expiresIn:"2h"}),user});
});

app.get("/api/cases", auth, (_req,res)=>res.json(cases));

app.patch("/api/cases/:id/status", auth, (req,res)=>{
  const item = cases.find(c=>c.id===req.params.id);
  if (!item) return res.status(404).json({error:"Case not found"});
  item.status = req.body.status || item.status;
  io.emit("case:updated", item);
  res.json(item);
});

io.on("connection", socket=>{
  socket.emit("cases:init", cases);
  socket.on("case:status", (payload)=>{
    const item = cases.find(c=>c.id===payload.id);
    if (!item) return;
    item.status = payload.status;
    io.emit("case:updated", item);
  });
});

httpServer.listen(port,()=>console.log(`WorkflowQueue API listening on ${port}`));
