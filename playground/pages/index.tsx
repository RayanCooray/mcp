import { useState } from "react";
import Swal from "sweetalert2";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const API = process.env.NEXT_PUBLIC_API_BASE || "https://mcp-mdj2.onrender.com";

  async function upload() {
    if (!file) return;
    const fd = new FormData();
    fd.append("resume", file);

    try {
      const r = await fetch(`${API}/upload-resume`, { method: "POST", body: fd });
      const j = await r.json();
      setStatus(JSON.stringify(j));

      if (j.ok) {
        Swal.fire({
          icon: "success",
          title: "Resume Uploaded!",
          text: "Your CV was successfully uploaded.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: j.error || "Something went wrong.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Network or server error.",
      });
    }
  }

  async function ask() {
    try {
      const r = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question }),
      });
      const j = await r.json();

      let textAnswer = "";
      if (typeof j.answer === "string") {
        textAnswer = j.answer;
      } else if (j.answer?.parts) {
        textAnswer = j.answer.parts.map((p: any) => p.text).join("\n");
      } else {
        textAnswer = "No answer received.";
      }

      setAnswer(textAnswer);

      if (textAnswer) {
        Swal.fire({
          icon: "success",
          title: "Answer Received!",
          text: textAnswer.length > 100 ? textAnswer.slice(0, 100) + "..." : textAnswer,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to get answer",
        text: "Network or server error.",
      });
    }
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>MCP Playground</h1>

      <div style={styles.section}>
        <input
          type="file"
          title="Upload Resume"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={styles.fileInput}
        />
        <button onClick={upload} style={styles.button}>Upload Resume</button>
        <p style={styles.status}>{status}</p>
      </div>

      <div style={styles.section}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask about CV"
          style={styles.textInput}
        />
        <button onClick={ask} style={styles.button}>Ask</button>
      </div>

      <pre style={styles.pre}>{answer}</pre>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  title: {
    textAlign: "center",
    color: "#333",
  },
  section: {
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 600,
    marginLeft: "auto",
    marginRight: "auto",
  },
  fileInput: {
    padding: 10,
    fontSize: 16,
  },
  textInput: {
    padding: 10,
    fontSize: 16,
    borderRadius: 5,
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    fontSize: 16,
    borderRadius: 5,
    border: "none",
    backgroundColor: "#0070f3",
    color: "#fff",
    cursor: "pointer",
  },
  status: {
    fontSize: 14,
    color: "#666",
  },
  pre: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 5,
    border: "1px solid #ddd",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxWidth: 600,
    margin: "0 auto",
  },
};
