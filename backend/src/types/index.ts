export type ParsedResume = {
  rawText: string; // the full text extracted from the resume
  sections: Record<string, string[]>; // each section (e.g., "skills", "education") mapped to its lines
};


export interface Role {
  title: string;
  company: string;
  dateRange: string;
  start?: Date | null;
  end?: Date | null;
  fullText: string;
}
