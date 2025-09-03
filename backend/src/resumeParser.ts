import pdf from "pdf-parse";

export type ParsedResume = { rawText: string; sections: Record<string, string[]> };

export interface Role {
  title: string;
  company: string;
  dateRange: string;
  start: Date | null;
  end: Date | null;
  fullText: string;
}

const monthMap: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
};

export function parseDate(str: string): Date | null {
  const lower = str.toLowerCase();
  if (lower.includes("present")) return new Date(2100, 0);
  const parts = lower.split(/[\s\-]/).filter(Boolean);
  if (parts.length >= 2) {
    const month = monthMap[parts[0]];
    const year = parseInt(parts[1]);
    if (!isNaN(month) && !isNaN(year)) return new Date(year, month);
  }
  if (parts.length === 1) {
    const year = parseInt(parts[0]);
    if (!isNaN(year)) return new Date(year, 0);
  }
  return null;
}

/* ----------------- Resume Parsing ------------------ */

export async function parseBufferToResume(buffer: Buffer, filename: string): Promise<ParsedResume> {
  let text = "";
  if (/\.pdf$/i.test(filename)) {
    const data = await pdf(buffer);
    text = data.text;
  } else {
    text = buffer.toString("utf-8");
  }
  text = text.replace(/\r/g, "").trim();

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const sections: Record<string,string[]> = {};
  let current = "misc";
  sections[current] = [];

  const headers = ["experience","work experience","education","skills","projects"];
  for (const line of lines) {
    const lower = line.toLowerCase();
    const header = headers.find(h => lower.startsWith(h));
    if (header) {
      current = header;
      sections[current] = [];
    } else {
      sections[current].push(line);
    }
  }

  return { rawText: text, sections };
}

/* ----------------- Work Experience ------------------ */

export function extractRoles(parsed: ParsedResume): Role[] {
  const exp = parsed.sections["work experience"];
  if (!exp) return [];

  const roles: Role[] = [];
  for (let i = 0; i < exp.length; i++) {
    const line = exp[i];
    if (/engineer|developer|intern|trainee|freelance/i.test(line)) {
      const title = line.trim();
      const company = exp[i + 1] || "";
      const dateRange = exp[i + 2] || "";

      let start: Date | null = null;
      let end: Date | null = null;
      const match = dateRange.match(/([A-Za-z]+ \d{4}|Present)/g);
      if (match) {
        start = parseDate(match[0]);
        end = match.length > 1 ? parseDate(match[1]) : null;
      }

      const fullText = [title, company, dateRange].join(" – ");
      roles.push({ title, company, dateRange, start, end, fullText });
    }
  }
  return roles;
}

export function getMostRecentRoles(parsed: ParsedResume): Role[] {
  const roles = extractRoles(parsed);
  if (!roles.length) return [];

  roles.sort((a, b) => {
    const endA = a.end || a.start || new Date(0);
    const endB = b.end || b.start || new Date(0);
    return endB.getTime() - endA.getTime();
  });

  const latestEnd = roles[0].end || roles[0].start;
  if (!latestEnd) return [roles[0]];

  return roles.filter(r => {
    const end = r.end || r.start;
    return end?.getTime() === latestEnd.getTime();
  });
}
