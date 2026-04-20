export type ComplianceStatus = "Compliant" | "Non-Compliant" | "Pending Review";

export interface ComplianceRecord {
  id: string;
  documentName: string;
  subLaw: string;
  category: string;
  authority: string;
  authorityContact: string;
  issueDate: string;
  status: ComplianceStatus;
  appliesTo: string[];
  remarks: string;
  consent: boolean;
  consentTimestamp: string;
  videoUrl?: string;
}

export const INITIAL_COMPLIANCE: ComplianceRecord[] = [
  {
    id: "KA-CMP-1001",
    documentName: "Driving School Recognition Certificate",
    subLaw: "MV Act Sec. 12",
    category: "License",
    authority: "Regional Transport Office (RTO)",
    authorityContact: "RTO Bengaluru South",
    issueDate: "2025-08-12",
    status: "Compliant",
    appliesTo: ["Management", "Premises / Infrastructure"],
    remarks: "Valid and verified.",
    consent: true,
    consentTimestamp: "2026-03-10T10:20:00.000Z",
    videoUrl: "",
  },
  {
    id: "KA-CMP-1002",
    documentName: "Vehicle Insurance Compliance",
    subLaw: "CMVR Rule 146",
    category: "Insurance",
    authority: "IRDAI / RTO",
    authorityContact: "Policy desk",
    issueDate: "2025-11-01",
    status: "Pending Review",
    appliesTo: ["All Vehicles"],
    remarks: "Renewal documents under review.",
    consent: true,
    consentTimestamp: "2026-03-15T09:05:00.000Z",
    videoUrl: "",
  },
  {
    id: "KA-CMP-1003",
    documentName: "Pollution Under Control Register",
    subLaw: "EPA 1986",
    category: "Environmental",
    authority: "State Pollution Control Board",
    authorityContact: "SPCB Unit 2",
    issueDate: "2025-10-05",
    status: "Compliant",
    appliesTo: ["All Vehicles"],
    remarks: "All PUC entries up to date.",
    consent: true,
    consentTimestamp: "2026-03-01T12:00:00.000Z",
    videoUrl: "",
  },
  {
    id: "KA-CMP-1004",
    documentName: "Instructor License Audit",
    subLaw: "CMVR Rule 24",
    category: "Driving Rules",
    authority: "Traffic Police / RTO",
    authorityContact: "Audit Cell",
    issueDate: "2025-09-20",
    status: "Non-Compliant",
    appliesTo: ["All Instructors"],
    remarks: "Two instructor renewals pending.",
    consent: true,
    consentTimestamp: "2026-03-11T08:45:00.000Z",
    videoUrl: "",
  },
];

export const complianceStatusVariant = (status: string): string => {
  if (status === "Compliant") return "green";
  if (status === "Non-Compliant") return "red";
  return "blue";
};

export const categoryVariant = (category: string): string => {
  if (category === "License") return "purple";
  if (category === "Insurance") return "blue";
  if (category === "Environmental") return "green";
  if (category === "Driving Rules") return "amber";
  return "slate";
};
