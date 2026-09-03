/**
 * CO Studio controlled catalogue.
 * The 16 controlled course / certificate types are the real, locked catalogue.
 * Every course carries 12 months validity. Learning outcomes and certificate
 * artwork remain placeholders until the supplied originals are provided.
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

const EDITORS = ["A. Whitfield", "M. Osei", "R. Kaur", "T. Bennett"];

const ACCENTS = ["#474AF5", "#1F7A5A", "#8A4B14", "#3A3F55"];

/** The locked catalogue: name + category. Order matches the controlled list. */
const CATALOGUE: { name: string; category: string }[] = [
  { name: "Care Certificate", category: "Care essentials" },
  { name: "Etac Training", category: "Moving & handling" },
  { name: "First Aid Basic Life Support", category: "Clinical skills" },
  { name: "Information and Governance Training", category: "Governance" },
  { name: "Ligatures Training", category: "Clinical skills" },
  { name: "Mandatory Training", category: "Care essentials" },
  { name: "MAPA Training", category: "Behaviour & restraint" },
  { name: "Medication Administration", category: "Clinical skills" },
  { name: "Moving and Handling Training", category: "Moving & handling" },
  { name: "Oliver McGowan Mandatory Training", category: "Care essentials" },
  { name: "PMVA Refresher Training", category: "Behaviour & restraint" },
  { name: "PMVA Training Breakaway", category: "Behaviour & restraint" },
  { name: "PMVA Training", category: "Behaviour & restraint" },
  { name: "Positive Behaviour Support Training", category: "Behaviour & restraint" },
  { name: "Safeguarding Training", category: "Safeguarding" },
  { name: "Tracheostomy Care and Suctioning Training", category: "Clinical skills" },
];

function outcomes(prefix: string): StudioOutcome[] {
  return [1, 2, 3, 4].map((n) => ({
    id: `${prefix}-o${n}`,
    text: `Learning outcome ${n} placeholder — replace with the controlled wording.`,
  }));
}

export const studioCourses: StudioCourse[] = CATALOGUE.map((entry, i) => {
  const n = i + 1;
  const id = `sc-${String(n).padStart(2, "0")}`;
  return {
    id,
    code: `SCTA-${String(n).padStart(2, "0")}`,
    name: entry.name,
    category: entry.category,
    validityMonths: 12,
    outcomes: outcomes(id),
    certificateId: `sx-${String(n).padStart(2, "0")}`,
    updatedBy: EDITORS[i % EDITORS.length]!,
    updatedAt: `12 Aug 2026`,
  };
});


export const studioCertificateTypes: StudioCertificateType[] = studioCourses.map((c, i) => ({
  id: c.certificateId,
  code: c.code,
  name: `${c.name} Certificate`,
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
  validUntil: "12 August 2027",
  number: "SCTA-120826-014",
};
