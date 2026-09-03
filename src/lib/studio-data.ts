/**
 * CO Studio controlled catalogue.
 * 16 controlled course / certificate types. Names, outcomes and artwork are
 * placeholders until the supplied originals are provided — validity rules must
 * come from supplied business rules, not from this file.
 */

export interface StudioOutcome {
  id: string;
  text: string;
}

export interface StudioCourse {
  id: string;
  code: string;
  name: string;
  category: string;
  validityMonths: number;
  outcomes: StudioOutcome[];
  certificateId: string;
  updatedBy: string;
  updatedAt: string;
}

export interface StudioCertificateType {
  id: string;
  code: string;
  name: string;
  courseId: string;
  accent: string;
  backAsset: string;
  updatedBy: string;
  updatedAt: string;
}

const CATEGORIES = [
  "Clinical skills",
  "Care essentials",
  "Safeguarding",
  "Health & safety",
];

const EDITORS = ["A. Whitfield", "M. Osei", "R. Kaur", "T. Bennett"];

const ACCENTS = ["#474AF5", "#1F7A5A", "#8A4B14", "#3A3F55"];

function outcomes(prefix: string): StudioOutcome[] {
  return [1, 2, 3, 4].map((n) => ({
    id: `${prefix}-o${n}`,
    text: `Learning outcome ${n} placeholder — replace with the controlled wording.`,
  }));
}

export const studioCourses: StudioCourse[] = Array.from({ length: 16 }, (_, i) => {
  const n = i + 1;
  const id = `sc-${String(n).padStart(2, "0")}`;
  return {
    id,
    code: `SCTA-${String(n).padStart(2, "0")}`,
    name: `Controlled Course ${String(n).padStart(2, "0")} (placeholder)`,
    category: CATEGORIES[i % CATEGORIES.length]!,
    validityMonths: [12, 24, 36][i % 3]!,
    outcomes: outcomes(id),
    certificateId: `sx-${String(n).padStart(2, "0")}`,
    updatedBy: EDITORS[i % EDITORS.length]!,
    updatedAt: `12 Aug 2026`,
  };
});

export const studioCertificateTypes: StudioCertificateType[] = studioCourses.map((c, i) => ({
  id: c.certificateId,
  code: c.code,
  name: `${c.name.replace(" (placeholder)", "")} Certificate`,
  courseId: c.id,
  accent: ACCENTS[i % ACCENTS.length]!,
  backAsset: `${c.code.toLowerCase()}-back.jpg`,
  updatedBy: c.updatedBy,
  updatedAt: c.updatedAt,
}));

export function getStudioCourse(id: string) {
  return studioCourses.find((c) => c.id === id);
}

export function getStudioCertificate(id: string) {
  return studioCertificateTypes.find((c) => c.id === id);
}

/** Fixed overlay values shown in the Studio preview only. */
export const previewValues = {
  learner: "Jordan Ellis",
  completed: "12 August 2026",
  validUntil: "12 August 2028",
  number: "SCTA-120826-014",
};
