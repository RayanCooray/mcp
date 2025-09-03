import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import express from "express";
import multer from "multer";
import cors from "cors";
import bodyParser from "body-parser";
import { parseBufferToResume } from "./resumeParser";
import { handleChatWithAI } from "./chat";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
let parsedResume: any = null;

app.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    parsedResume = await parseBufferToResume(req.file.buffer, req.file.originalname);
    res.json({ ok: true, sections: Object.keys(parsedResume.sections) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to parse resume" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    if (!parsedResume) return res.status(400).json({ error: "Upload resume first" });
    const { question } = req.body;
    const answer = await handleChatWithAI(question, parsedResume);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to handle chat" });
  }
});

app.get("/", (req, res) => res.send("MCP server is running"));

app.listen(PORT, () => console.log(`MCP server listening on ${PORT}`));