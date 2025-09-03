# MCP Server – Coding Challenge

This repository contains the **Model Context Protocol (MCP) server** for the coding challenge. It includes:

- A backend API for parsing your resume and chatting about it
- An email sending endpoint
- An optional Next.js playground for testing the backend
- **Gemini API integration** for AI-powered CV chat responses

---

## Features

- **Upload & Parse Resume**: Supports PDF or text files.
- **Chat Endpoint**: Ask questions about your CV (e.g., "What role did I have at my last position?") powered by **Gemini API**.
- **Email Sending Endpoint**: Send emails using SMTP via nodemailer.
- **Next.js Playground**: Minimal frontend UI to interact with the backend.

---

## Live Deployment

- **Backend (API)**: [https://mcp-mdj2.onrender.com](https://mcp-mdj2.onrender.com)
- **Backend is Deployed on Render**
- **Front end is deployed on vercel**
- **Frontend (Playground)**: [https://mcp-theta-ochre.vercel.app/](https://mcp-theta-ochre.vercel.app/)

---

## Running Locally

### Backend
```bash
cd backend
cp .env.example .env   # Fill in your SMTP credentials and GEMINI_API_KEY
npm install
npm run dev             # Starts backend server on http://localhost:4000
```

### Frontend
```bash
cd playground
npm install
npm run dev
```

### Docker Compose
```bash
docker-compose up --build
```

## API Examples
```bash
curl -X POST http://localhost:4000/upload-resume -F "resume=@resume.pdf"
curl -X POST http://localhost:4000/chat -H "Content-Type: application/json" -d '{"question":"What role did I have?"}'
curl -X POST http://localhost:4000/send-email -H "Content-Type: application/json" -d '{"recipient":"me@test.com","subject":"Hello","body":"Hi"}'
```
