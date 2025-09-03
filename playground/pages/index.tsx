import { useState } from "react";
import Swal from "sweetalert2";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [showEmailCard, setShowEmailCard] = useState(false);

  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const API = process.env.NEXT_PUBLIC_API_BASE || "https://mcp-mdj2.onrender.com";

  // const API = "http://localhost:4000";
  
  async function upload() {
    if (!file) return;
    setUploading(true);
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append("resume", file);

      const r = await fetch(`${API}/upload-resume`, { method: "POST", body: fd });
      const j = await r.json();

      if (j.ok && j.sections) {
        setStatus(`✅ Resume uploaded successfully!\nSections found:\n- ${j.sections.join("\n- ")}`);
        Swal.fire({
          icon: "success",
          title: "Resume Uploaded!",
          text: "Your CV was successfully uploaded.",
        });
        setResumeUploaded(true);
      } else {
        setStatus(`❌ Upload failed: ${j.error || "Unknown error"}`);
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: j.error || "Something went wrong.",
        });
      }
    } catch (err) {
      setStatus("❌ Network or server error.");
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Network or server error.",
      });
    } finally {
      setUploading(false);
    }
  }


  async function ask() {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    try {
      const r = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const j = await r.json();

      let textAnswer = "";
      if (typeof j.answer === "string") textAnswer = j.answer;
      else if (j.answer?.parts) textAnswer = j.answer.parts.map((p: any) => p.text).join("\n");
      else textAnswer = "No answer received.";

      setAnswer(textAnswer);

      if (textAnswer) {
        Swal.fire({
          icon: "success",
          title: "Answer Received!",
          text: textAnswer.slice(0, 100) + "...",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to get answer",
        text: "Network or server error.",
      });
    } finally {
      setAsking(false);
    }
  }


  const renderAnswer = () => {
    if (!answer) return null;
    const lines = answer.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**"))
        return (
          <h3 key={i} style={styles.heading}>
            {line.replace(/\*\*/g, "")}
          </h3>
        );
      else if (line.startsWith("*   "))
        return (
          <li key={i} style={styles.listItem}>
            {line.replace("*   ", "")}
          </li>
        );
      else
        return (
          <p key={i} style={styles.paragraph}>
            {line}
          </p>
        );
    });
  };


  async function sendEmail() {
    if (!emailRecipient.trim() || !emailSubject.trim() || !emailBody.trim()) return;
    setSendingEmail(true);
    try {
      const r = await fetch(`${API}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: emailRecipient,
          subject: emailSubject,
          body: emailBody,
        }),
      });
      const j = await r.json();

      if (j.ok) {
        Swal.fire({
          icon: "success",
          title: "Email Sent!",
          text: `Email successfully sent to ${emailRecipient}`,
        });
        setEmailRecipient("");
        setEmailSubject("");
        setEmailBody("");
        setShowEmailCard(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Email Failed",
          text: j.error || "Something went wrong.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Email Failed",
        text: "Network or server error.",
      });
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>MCP Playground</h1>
      <p style={styles.guide}>
        Step 1: Upload your resume → Step 2: Ask a question. <br />
        (All inputs are disabled while uploading or waiting for a response)
      </p>

      <p style={styles.guide}>
        Step 3: If this candidate suits you, send them an email.<br />
        (please note that this is a personal smtp configured email for testing do not overuse)
      </p>

      <div style={styles.card}>
       
        <input
          type="file"
          title="Upload Resume"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={styles.fileInput}
          disabled={uploading || asking}
        />
        <button
          onClick={upload}
          style={styles.button}
          disabled={uploading || asking || !file}
        >
          {uploading ? "Uploading..." : "Upload Resume"}
        </button>

      
        {status && (
          <div style={styles.statusCard}>
            {status.split("\n").map((line, i) => (
              <p key={i} style={styles.statusLine}>
                {line}
              </p>
            ))}
          </div>
        )}

        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about CV"
          style={styles.textInput}
          disabled={uploading || asking || !resumeUploaded}
        />
        <button
          onClick={ask}
          style={styles.button}
          disabled={uploading || asking || !question.trim() || !resumeUploaded}
        >
          {asking ? "Thinking..." : "Ask"}
        </button>

        
        {answer && <div style={styles.answerCard}>{renderAnswer()}</div>}

        <button
          onClick={() => setShowEmailCard((prev) => !prev)}
          style={{ ...styles.button, backgroundColor: "#28a745" }}
        >
          {showEmailCard ? "Hide Email" : "Send Email"}
        </button>

        {showEmailCard && (
          <div style={styles.emailCard}>
            <input
              value={emailRecipient}
              onChange={(e) => setEmailRecipient(e.target.value)}
              placeholder="Recipient Email"
              style={styles.textInput}
              disabled={uploading || asking || sendingEmail}
            />
            <input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject"
              style={styles.textInput}
              disabled={uploading || asking || sendingEmail}
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Email Body"
              style={{ ...styles.textInput, height: 100 }}
              disabled={uploading || asking || sendingEmail}
            />
            <button
              onClick={sendEmail}
              style={styles.button}
              disabled={
                uploading ||
                asking ||
                sendingEmail ||
                !emailRecipient ||
                !emailSubject ||
                !emailBody
              }
            >
              {sendingEmail ? "Sending..." : "Send Email"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    fontFamily: "'Segoe UI', sans-serif",
    minHeight: "100vh",
  },
  title: {
    textAlign: "center",
    fontSize: 32,
    marginBottom: 10,
  },
  guide: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "100%",
    maxWidth: 700,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  fileInput: {
    padding: 12,
    border: "2px dashed #0070f3",
    borderRadius: 10,
    textAlign: "center",
    cursor: "pointer",
  },
  textInput: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  button: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    backgroundColor: "#0070f3",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  statusCard: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#e6f7ff",
    borderRadius: 10,
    border: "1px solid #91d5ff",
  },
  statusLine: {
    margin: 2,
    fontSize: 14,
    color: "#0050b3",
  },
  answerCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#f9f9f9",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    maxHeight: 400,
    overflowY: "auto",
  },
  emailCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#fffbe6",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  heading: { fontSize: 18, fontWeight: 700, marginTop: 15, color: "#333" },
  paragraph: { fontSize: 14, margin: 5, lineHeight: 1.5, color: "#555" },
  listItem: { fontSize: 14, marginLeft: 20, lineHeight: 1.5, color: "#555" },
};
