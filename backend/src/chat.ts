import axios from "axios";
import { ParsedResume, extractRoles, getMostRecentRoles } from "./resumeParser";

const GEMINI_API_KEY = process.env.GEMINI;
console.log("GEMINI_API_KEY:", GEMINI_API_KEY);

/* ----------------- Gemini API Query ------------------ */
async function queryGemini(prompt: string): Promise<string> {
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const response = await axios.post(
      url,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json", "X-goog-api-key": GEMINI_API_KEY || "" } }
    );

    console.log("Gemini response:", JSON.stringify(response.data, null, 2));

    return response.data?.candidates?.[0]?.content || "Gemini did not return any content.";
  } catch (err: any) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Gemini API call failed. Please check your API key or network.";
  }
}

/* ----------------- Structured Resume Chat ------------------ */
export async function handleChatWithAI(question: string, parsed: ParsedResume): Promise<string> {
  const q = question.toLowerCase();
  let answer = "";

  // 1️⃣ Work experience
  if (q.includes("last position") || q.includes("most recent role") || q.includes("latest job")) {
    const latest = getMostRecentRoles(parsed);
    if (latest.length > 0) {
      answer = `Most recent role(s):\n${latest.map(r => `- ${r.fullText}`).join("\n")}`;
    }
  }

  if (!answer && (q.includes("all roles") || q.includes("work experience") || q.includes("job history"))) {
    const roles = extractRoles(parsed);
    if (roles.length > 0) {
      answer = `Work experience:\n${roles.map(r => `- ${r.fullText}`).join("\n")}`;
    }
  }

  // 2️⃣ Skills
  if (!answer && (q.includes("skills") || q.includes("technologies") || q.includes("tools"))) {
    const skills = parsed.sections["skills"];
    answer = skills && skills.length > 0
      ? `Skills:\n- ${skills.join("\n- ")}`
      : "";
  }

  // 3️⃣ Education
  if (!answer && (q.includes("education") || q.includes("study") || q.includes("degree"))) {
    const edu = parsed.sections["education"];
    answer = edu && edu.length > 0
      ? `Education:\n- ${edu.join("\n- ")}`
      : "";
  }

  // 4️⃣ Projects
  if (!answer && (q.includes("project") || q.includes("portfolio"))) {
    const proj = parsed.sections["projects"];
    answer = proj && proj.length > 0
      ? `Projects:\n- ${proj.join("\n- ")}`
      : "";
  }

  // 5️⃣ Summary
  if (!answer && (q.includes("summary") || q.includes("objective") || q.includes("about myself"))) {
    const summary = parsed.sections["summary"] || parsed.sections["objective"];
    answer = summary && summary.length > 0
      ? `Summary:\n${summary.join(" ")}`
      : "";
  }

  // 6️⃣ Contact info
  if (!answer && (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("portfolio"))) {
    const contact = parsed.sections["contact"] || parsed.sections["misc"];
    if (contact) {
      const text = contact.join(" ");
      const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      const url = text.match(/https?:\/\/\S+/i);
      const phone = text.match(/(\+?\d[\d\s\-]{7,}\d)/);

      const parts: string[] = [];
      if (email) parts.push(`📧 Email: ${email[0]}`);
      if (phone) parts.push(`📱 Phone: ${phone[0]}`);
      if (url) parts.push(`🌐 Portfolio: ${url[0]}`);

      answer = parts.length > 0 ? parts.join("\n") : "";
    }
  }

  // 7️⃣ Fallback to Gemini AI
  if (!answer) {
    const prompt = `Answer this question based on this resume: ${parsed.rawText}\n\nQuestion: ${question}`;
    answer = await queryGemini(prompt);
  }

  // 8️⃣ Final fallback
  return answer || "I couldn't find an answer. Please ask a different question.";
}
