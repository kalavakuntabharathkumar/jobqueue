# Real-Time Clinical Workflow Dashboard

A portfolio-ready real-time workflow dashboard for coordinating clinical cases.

## Stack
React, Node.js/Express, Socket.io, MongoDB, Docker, Kubernetes, JWT/RBAC.

## Features
- Real-time case status synchronization using Socket.io
- Four-role RBAC: admin, pathologist, technician, reviewer
- JWT authentication
- Audit trail for case actions
- Queue filtering and status updates
- MongoDB persistence adapter
- Docker Compose
- Kubernetes deployment with three API replicas

## Run locally
```bash
docker compose up --build
```

Frontend: http://localhost:5174  
API: http://localhost:4100

The application uses a lightweight in-memory fallback when MongoDB is unavailable, making the demo easy to run locally. Connect the MongoDB adapter for persistent deployment.

## Kubernetes
```bash
kubectl apply -f k8s/
kubectl get pods
kubectl get svc
```
