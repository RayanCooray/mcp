# MCP Server – Coding Challenge

## Features
- Upload and parse a resume (PDF or text)
- Chat endpoint to answer questions about your CV
- Email sending endpoint (SMTP via nodemailer)
- Minimal Next.js playground UI

## Running locally

### Backend
```bash
cd backend
cp .env.example .env   # fill in SMTP creds
npm install
npm run dev
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
