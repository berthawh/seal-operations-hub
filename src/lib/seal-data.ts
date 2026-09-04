/**
 * Working dataset for the Seal UI.
 * The course catalogue is the real, controlled 16-type catalogue (12 months
 * validity throughout). Sessions, people and organisations are sample records.
 */

export type SessionStatus = "upcoming" | "in_progress" | "completed" | "attention" | "cancelled";
export type CertificateStatus = "issued" | "pending" | "hold" | "draft" | "expired";
export type TrackingStatus = "on_track" | "due_soon" | "overdue" | "completed";

export interface Organisation {
  id: string;
  name: string;
  shortName: string;
  sector: string;
  location: string;
  people: number;
  sessions: number;
  certificates: number;
  compliance: number;
  accent: string;
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  role: "Learner" | "Trainer" | "Coordinator" | "Administrator";
  jobTitle: string;
  organisationId: string;
  email: string;
  sessions: number;
  certificates: number;
  progress: number;
  lastActivity: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  category: string;
  durationHours: number;
  validityMonths: number;
  status: "active" | "draft" | "retired";
  sessions: number;
  certificates: number;
  summary: string;
}

/** Classroom time applies to every course in the catalogue. */
export const classroomTime = "9:00am – 5:00pm, including a one hour break";

/** Controlled small print carried by every course. */
export const courseTerms: { title: string; body: string[] }[] = [
  {
    title: "Certificate of Attendance",
    body: [
      "*A certificate of attendance is issued and delivered by email within 24 hours of the course being completed.",
    ],
  },
  {
    title: "Course delivery",
    body: [
      "The training is delivered Face to Face On-Site. We can deliver customised training at your premises. Our Instructor Services team will help you tailor the programme to your organisation's needs.",
    ],
  },
  {
    title: "Training room rules",
    body: [
      "Smoking and drug use are strictly prohibited on-site. Offenders will be asked to leave, the session will be non-refundable, and they will incur a £100 fine.",
      "Please keep the area tidy. Dispose of rubbish in the bins provided and return all equipment to its original location.",
    ],
  },
  {
    title: "Cancellation Policy",
    body: ["At least 24 hours' notice required."],
  },
];



export interface TrainingSession {
  id: string;
  reference: string;
  courseId: string;
  date: string;
  time: string;
  trainerId: string;
  organisationId: string;
  attendees: number;
  capacity: number;
  status: SessionStatus;
  progress: number;
  certificatesIssued: number;
  trackingOpen: number;
  location: string;
}

export interface Certificate {
  id: string;
  number: string;
  personId: string;
  courseId: string;
  organisationId: string;
  sessionId: string;
  completedOn: string;
  validUntil: string;
  status: CertificateStatus;
  delivery: "delivered" | "queued" | "not_sent" | "bounced";
}

export interface TrackingItem {
  id: string;
  label: string;
  personId: string;
  sessionId: string;
  certificateId?: string;
  status: TrackingStatus;
  due: string;
  progress: number;
  note: string;
}

export interface ActivityItem {
  id: string;
  kind: "session" | "certificate" | "person" | "automation" | "organisation";
  title: string;
  detail: string;
  time: string;
}

export const organisations: Organisation[] = [
  {
    id: "org-1",
    name: "Northgate Facilities Group",
    shortName: "NFG",
    sector: "Facilities",
    location: "Manchester, UK",
    people: 48,
    sessions: 9,
    certificates: 122,
    compliance: 86,
    accent: "seal",
  },
  {
    id: "org-2",
    name: "Harbourline Logistics",
    shortName: "HL",
    sector: "Logistics",
    location: "Rotterdam, NL",
    people: 31,
    sessions: 6,
    certificates: 74,
    compliance: 92,
    accent: "info",
  },
  {
    id: "org-3",
    name: "Verity Care Partnership",
    shortName: "VCP",
    sector: "Healthcare",
    location: "Leeds, UK",
    people: 63,
    sessions: 12,
    certificates: 168,
    compliance: 71,
    accent: "success",
  },
  {
    id: "org-4",
    name: "Meridian Energy Services",
    shortName: "MES",
    sector: "Energy",
    location: "Aberdeen, UK",
    people: 22,
    sessions: 4,
    certificates: 39,
    compliance: 64,
    accent: "warning",
  },
];

export const people: Person[] = [
  {
    id: "per-1",
    name: "Amara Okafor",
    initials: "AO",
    role: "Trainer",
    jobTitle: "Lead Trainer",
    organisationId: "org-1",
    email: "amara.okafor@example.com",
    sessions: 14,
    certificates: 0,
    progress: 100,
    lastActivity: "2 hours ago",
  },
  {
    id: "per-2",
    name: "Daniel Reyes",
    initials: "DR",
    role: "Learner",
    jobTitle: "Site Operative",
    organisationId: "org-1",
    email: "daniel.reyes@example.com",
    sessions: 4,
    certificates: 3,
    progress: 75,
    lastActivity: "Yesterday",
  },
  {
    id: "per-3",
    name: "Ingrid Halvorsen",
    initials: "IH",
    role: "Coordinator",
    jobTitle: "Training Coordinator",
    organisationId: "org-2",
    email: "ingrid.halvorsen@example.com",
    sessions: 11,
    certificates: 1,
    progress: 90,
    lastActivity: "3 days ago",
  },
  {
    id: "per-4",
    name: "Sofia Marchetti",
    initials: "SM",
    role: "Learner",
    jobTitle: "Care Assistant",
    organisationId: "org-3",
    email: "sofia.marchetti@example.com",
    sessions: 6,
    certificates: 5,
    progress: 100,
    lastActivity: "Today",
  },
  {
    id: "per-5",
    name: "Tomas Brennan",
    initials: "TB",
    role: "Learner",
    jobTitle: "Maintenance Technician",
    organisationId: "org-4",
    email: "tomas.brennan@example.com",
    sessions: 2,
    certificates: 1,
    progress: 40,
    lastActivity: "Last week",
  },
  {
    id: "per-6",
    name: "Priya Nandan",
    initials: "PN",
    role: "Administrator",
    jobTitle: "Operations Manager",
    organisationId: "org-3",
    email: "priya.nandan@example.com",
    sessions: 18,
    certificates: 0,
    progress: 100,
    lastActivity: "1 hour ago",
  },
];

export const courses: Course[] = [
  {
    id: "crs-1",
    code: "SCTA-01",
    name: "Care Certificate",
    category: "Care essentials",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 12,
    certificates: 96,
    summary:
      "The 15 standards of the Care Certificate, delivered and assessed for new care staff.",
  },
  {
    id: "crs-2",
    code: "SCTA-02",
    name: "Etac Training",
    category: "Moving & handling",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 8,
    certificates: 54,
    summary: "Safe and competent use of Etac transfer and repositioning equipment.",
  },
  {
    id: "crs-3",
    code: "SCTA-03",
    name: "First Aid Basic Life Support",
    category: "Clinical skills",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 10,
    certificates: 88,
    summary: "Adult basic life support, CPR, choking and emergency first aid response.",
  },
  {
    id: "crs-4",
    code: "SCTA-04",
    name: "Information and Governance Training",
    category: "Governance",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 6,
    certificates: 62,
    summary: "Data protection, record keeping and confidentiality duties in care settings.",
  },
  {
    id: "crs-5",
    code: "SCTA-05",
    name: "Ligatures Training",
    category: "Clinical skills",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 4,
    certificates: 27,
    summary: "Ligature risk awareness, prevention and safe emergency response.",
  },
  {
    id: "crs-6",
    code: "SCTA-06",
    name: "Mandatory Training",
    category: "Care essentials",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 14,
    certificates: 118,
    summary: "The core mandatory subjects required annually across all care roles.",
  },
  {
    id: "crs-7",
    code: "SCTA-07",
    name: "MAPA Training",
    category: "Behaviour & restraint",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 7,
    certificates: 49,
    summary: "Management of actual or potential aggression, from prevention to safe intervention.",
  },
  {
    id: "crs-8",
    code: "SCTA-08",
    name: "Medication Administration",
    category: "Clinical skills",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 9,
    certificates: 71,
    summary: "Safe administration, recording and error reporting for medicines in care.",
  },
  {
    id: "crs-9",
    code: "SCTA-09",
    name: "Moving and Handling Training",
    category: "Moving & handling",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 11,
    certificates: 83,
    summary: "Safe people and load handling, risk assessment and equipment technique.",
  },
  {
    id: "crs-10",
    code: "SCTA-10",
    name: "Oliver McGowan Mandatory Training",
    category: "Care essentials",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 5,
    certificates: 44,
    summary: "Learning disability and autism awareness in line with the Oliver McGowan standard.",
  },
  {
    id: "crs-11",
    code: "SCTA-11",
    name: "PMVA Refresher Training",
    category: "Behaviour & restraint",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 6,
    certificates: 38,
    summary: "Annual refresher of prevention and management of violence and aggression skills.",
  },
  {
    id: "crs-12",
    code: "SCTA-12",
    name: "PMVA Training Breakaway",
    category: "Behaviour & restraint",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 4,
    certificates: 25,
    summary: "Breakaway and disengagement techniques for staff safety.",
  },
  {
    id: "crs-13",
    code: "SCTA-13",
    name: "PMVA Training",
    category: "Behaviour & restraint",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 5,
    certificates: 33,
    summary: "Full prevention and management of violence and aggression programme.",
  },
  {
    id: "crs-14",
    code: "SCTA-14",
    name: "Positive Behaviour Support Training",
    category: "Behaviour & restraint",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 4,
    certificates: 29,
    summary: "Person-centred behaviour support planning and proactive strategies.",
  },
  {
    id: "crs-15",
    code: "SCTA-15",
    name: "Safeguarding Training",
    category: "Safeguarding",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 9,
    certificates: 76,
    summary: "Recognising, recording and escalating safeguarding concerns for adults and children.",
  },
  {
    id: "crs-16",
    code: "SCTA-16",
    name: "Tracheostomy Care and Suctioning Training",
    category: "Clinical skills",
    durationHours: 7,
    validityMonths: 12,
    status: "active",
    sessions: 3,
    certificates: 21,
    summary: "Routine tracheostomy care, suctioning technique and emergency management.",
  },
];


export const sessions: TrainingSession[] = [
  {
    id: "ses-1",
    reference: "SES-2481",
    courseId: "crs-1",
    date: "12 Sep 2026",
    time: "09:00 – 15:00",
    trainerId: "per-1",
    organisationId: "org-1",
    attendees: 14,
    capacity: 16,
    status: "upcoming",
    progress: 0,
    certificatesIssued: 0,
    trackingOpen: 2,
    location: "Northgate Training Suite",
  },
  {
    id: "ses-2",
    reference: "SES-2478",
    courseId: "crs-2",
    date: "4 Sep 2026",
    time: "13:00 – 16:00",
    trainerId: "per-1",
    organisationId: "org-3",
    attendees: 11,
    capacity: 12,
    status: "in_progress",
    progress: 62,
    certificatesIssued: 4,
    trackingOpen: 5,
    location: "Verity Care — Room 2",
  },
  {
    id: "ses-3",
    reference: "SES-2470",
    courseId: "crs-3",
    date: "27 Aug 2026",
    time: "09:00 – 17:00",
    trainerId: "per-3",
    organisationId: "org-2",
    attendees: 9,
    capacity: 10,
    status: "completed",
    progress: 100,
    certificatesIssued: 9,
    trackingOpen: 0,
    location: "Harbourline HQ",
  },
  {
    id: "ses-4",
    reference: "SES-2465",
    courseId: "crs-1",
    date: "21 Aug 2026",
    time: "09:00 – 15:00",
    trainerId: "per-3",
    organisationId: "org-4",
    attendees: 6,
    capacity: 14,
    status: "attention",
    progress: 100,
    certificatesIssued: 2,
    trackingOpen: 4,
    location: "Meridian Yard Office",
  },
  {
    id: "ses-5",
    reference: "SES-2489",
    courseId: "crs-2",
    date: "24 Sep 2026",
    time: "10:00 – 13:00",
    trainerId: "per-1",
    organisationId: "org-2",
    attendees: 3,
    capacity: 12,
    status: "upcoming",
    progress: 0,
    certificatesIssued: 0,
    trackingOpen: 0,
    location: "Remote — video",
  },
  {
    id: "ses-6",
    reference: "SES-2455",
    courseId: "crs-3",
    date: "8 Aug 2026",
    time: "09:00 – 17:00",
    trainerId: "per-1",
    organisationId: "org-3",
    attendees: 12,
    capacity: 12,
    status: "completed",
    progress: 100,
    certificatesIssued: 12,
    trackingOpen: 1,
    location: "Verity Care — Room 1",
  },
];

export const certificates: Certificate[] = [
  {
    id: "cert-1",
    number: "SEAL-2026-0421",
    personId: "per-4",
    courseId: "crs-2",
    organisationId: "org-3",
    sessionId: "ses-2",
    completedOn: "4 Sep 2026",
    validUntil: "4 Sep 2027",
    status: "pending",
    delivery: "queued",
  },
  {
    id: "cert-2",
    number: "SEAL-2026-0418",
    personId: "per-2",
    courseId: "crs-1",
    organisationId: "org-1",
    sessionId: "ses-1",
    completedOn: "21 Aug 2026",
    validUntil: "21 Aug 2028",
    status: "issued",
    delivery: "delivered",
  },
  {
    id: "cert-3",
    number: "SEAL-2026-0410",
    personId: "per-5",
    courseId: "crs-1",
    organisationId: "org-4",
    sessionId: "ses-4",
    completedOn: "21 Aug 2026",
    validUntil: "21 Aug 2028",
    status: "hold",
    delivery: "not_sent",
  },
  {
    id: "cert-4",
    number: "SEAL-2026-0402",
    personId: "per-3",
    courseId: "crs-3",
    organisationId: "org-2",
    sessionId: "ses-3",
    completedOn: "27 Aug 2026",
    validUntil: "27 Aug 2029",
    status: "issued",
    delivery: "delivered",
  },
  {
    id: "cert-5",
    number: "SEAL-2026-0395",
    personId: "per-4",
    courseId: "crs-3",
    organisationId: "org-3",
    sessionId: "ses-6",
    completedOn: "8 Aug 2026",
    validUntil: "8 Aug 2029",
    status: "draft",
    delivery: "not_sent",
  },
  {
    id: "cert-6",
    number: "SEAL-2025-0188",
    personId: "per-2",
    courseId: "crs-5",
    organisationId: "org-1",
    sessionId: "ses-6",
    completedOn: "2 Jun 2024",
    validUntil: "2 Jun 2026",
    status: "expired",
    delivery: "delivered",
  },
];

export const tracking: TrackingItem[] = [
  {
    id: "trk-1",
    label: "Post-session assessment",
    personId: "per-4",
    sessionId: "ses-2",
    certificateId: "cert-1",
    status: "due_soon",
    due: "in 3 days",
    progress: 60,
    note: "Awaiting learner submission.",
  },
  {
    id: "trk-2",
    label: "Attendance confirmation",
    personId: "per-5",
    sessionId: "ses-4",
    certificateId: "cert-3",
    status: "overdue",
    due: "6 days ago",
    progress: 25,
    note: "Trainer has not confirmed the roster.",
  },
  {
    id: "trk-3",
    label: "Certificate approval",
    personId: "per-2",
    sessionId: "ses-1",
    certificateId: "cert-2",
    status: "completed",
    due: "Completed",
    progress: 100,
    note: "Approved and delivered.",
  },
  {
    id: "trk-4",
    label: "Renewal window",
    personId: "per-3",
    sessionId: "ses-3",
    certificateId: "cert-4",
    status: "on_track",
    due: "in 41 days",
    progress: 15,
    note: "Renewal reminder scheduled.",
  },
];

export const activity: ActivityItem[] = [
  {
    id: "act-1",
    kind: "certificate",
    title: "Certificate SEAL-2026-0421 awaiting approval",
    detail: "Generated from SES-2478",
    time: "12 min ago",
  },
  {
    id: "act-2",
    kind: "session",
    title: "SES-2478 marked in progress",
    detail: "Amara Okafor · Verity Care Partnership",
    time: "1 hour ago",
  },
  {
    id: "act-3",
    kind: "automation",
    title: "Automation ran: issue on completion",
    detail: "4 certificates queued for delivery",
    time: "3 hours ago",
  },
  {
    id: "act-4",
    kind: "person",
    title: "Tomas Brennan added to SES-2465",
    detail: "Meridian Energy Services",
    time: "Yesterday",
  },
  {
    id: "act-5",
    kind: "organisation",
    title: "Meridian Energy Services compliance dropped",
    detail: "64% — 4 tracking items overdue",
    time: "2 days ago",
  },
];

export const automations = [
  {
    id: "aut-1",
    name: "Issue certificate on session completion",
    trigger: "Session status → Completed",
    action: "Generate certificates for attendees marked present",
    workflow: "Certificates",
    enabled: true,
    runs: 128,
  },
  {
    id: "aut-2",
    name: "Renewal reminder",
    trigger: "Certificate valid-until is 60 days away",
    action: "Email the learner and organisation coordinator",
    workflow: "Tracking",
    enabled: true,
    runs: 64,
  },
  {
    id: "aut-3",
    name: "Chase missing attendance",
    trigger: "Session ended with unconfirmed roster",
    action: "Notify the trainer daily until confirmed",
    workflow: "Sessions",
    enabled: false,
    runs: 12,
  },
  {
    id: "aut-4",
    name: "Hold certificate on failed assessment",
    trigger: "Assessment outcome → Not achieved",
    action: "Place the certificate on hold and notify the coordinator",
    workflow: "Certificates",
    enabled: true,
    runs: 7,
  },
];

export const byId = <T extends { id: string }>(list: T[], id: string | undefined) =>
  list.find((item) => item.id === id);

export const courseOf = (id: string) => byId(courses, id);
export const personOf = (id: string) => byId(people, id);
export const orgOf = (id: string) => byId(organisations, id);
export const sessionOf = (id: string) => byId(sessions, id);
export const certificateOf = (id: string) => byId(certificates, id);

export const sessionStatusLabel: Record<SessionStatus, string> = {
  upcoming: "Upcoming",
  in_progress: "In progress",
  completed: "Completed",
  attention: "Requires attention",
  cancelled: "Cancelled",
};

export const certificateStatusLabel: Record<CertificateStatus, string> = {
  issued: "Issued",
  pending: "Awaiting approval",
  hold: "On hold",
  draft: "Draft",
  expired: "Expired",
};

export const trackingStatusLabel: Record<TrackingStatus, string> = {
  on_track: "On track",
  due_soon: "Due soon",
  overdue: "Overdue",
  completed: "Completed",
};

/** Colour coding for the course catalogue, grouped by category. */
export const courseCategoryColour: Record<
  string,
  { chip: string; dot: string }
> = {
  "Care essentials": {
    chip: "border-seal/25 bg-seal-soft text-seal",
    dot: "bg-seal",
  },
  "Moving & handling": {
    chip: "border-info/25 bg-info-soft text-info",
    dot: "bg-info",
  },
  "Clinical skills": {
    chip: "border-success/25 bg-success-soft text-success",
    dot: "bg-success",
  },
  Governance: {
    chip: "border-border bg-neutral-soft text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  "Behaviour & restraint": {
    chip: "border-danger/25 bg-danger-soft text-danger",
    dot: "bg-danger",
  },
  Safeguarding: {
    chip: "border-warning/30 bg-warning-soft text-warning-foreground",
    dot: "bg-warning",
  },
};

const fallbackColour = { chip: "border-border bg-neutral-soft text-muted-foreground", dot: "bg-muted-foreground" };

/** Colour classes for a single course, by its category. */
export function courseColour(courseId: string) {
  const course = courses.find((c) => c.id === courseId);
  return (course && courseCategoryColour[course.category]) || fallbackColour;
}
