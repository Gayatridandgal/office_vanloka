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

const YOUTUBE_LINKS = [
  "https://youtu.be/2COpnrHSvDU?si=K_z-oi1WwLyg4tAI",
  "https://youtu.be/-p4zOmoAITI?si=1QiMd_ZFQZVVhbfB",
  "https://youtu.be/hkgZe1q33ko?si=pH-1AtkttjcyeZFu",
  "https://youtu.be/BaYQQi_9ImM?si=fcFlx3WsleefHByP",
  "https://youtu.be/QSr0QW1fues?si=8JpNUxBNT8sZVz8h"
];

export const INITIAL_COMPLIANCE: ComplianceRecord[] = [
  {
    id: "KA-CMP-2001",
    documentName: "Factories Act Sec 61 (Working Hours)",
    subLaw: "Factories Act Sec 61",
    category: "Working Hours",
    authority: "Labour Department",
    authorityContact: "Directorate of Factories",
    issueDate: "2026-04-10",
    status: "Compliant",
    appliesTo: ["All Employees", "Operational Staff"],
    remarks: "This video explains compliance requirements under Factories Act Section 61, focusing on maintaining employee working hours and shift records. Proper tracking ensures accountability, audit readiness, and legal compliance in workplace operations. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-10T10:00:00Z",
    videoUrl: YOUTUBE_LINKS[0]
  },
  {
    id: "KA-CMP-2002",
    documentName: "Factories Act Sec 62 (Shift Registers)",
    subLaw: "Factories Act Sec 62",
    category: "Shift Management",
    authority: "Labour Department",
    authorityContact: "Directorate of Factories",
    issueDate: "2026-04-11",
    status: "Compliant",
    appliesTo: ["Shift Workers", "Management"],
    remarks: "Learn about compliance under Factories Act Section 62, which requires maintaining detailed shift registers. Accurate records help organizations track workforce operations and ensure transparency. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-11T11:00:00Z",
    videoUrl: YOUTUBE_LINKS[1]
  },
  {
    id: "KA-CMP-2003",
    documentName: "Factories Act Sec 45 (Emergency Readiness)",
    subLaw: "Factories Act Sec 45",
    category: "Safety",
    authority: "Safety Council",
    authorityContact: "Emergency Response Cell",
    issueDate: "2026-04-12",
    status: "Compliant",
    appliesTo: ["Workspace", "First Aid Teams"],
    remarks: "This video covers emergency readiness under Factories Act Section 45. Organizations must ensure proper safety measures, including first aid and response systems, to protect employees. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-03-12T12:00:00Z",
    videoUrl: YOUTUBE_LINKS[2]
  },
  {
    id: "KA-CMP-2004",
    documentName: "Contract Labour Act Sec 25 (Worker Registers)",
    subLaw: "Contract Labour Act Sec 25",
    category: "Labour Law",
    authority: "Labour Commissioner",
    authorityContact: "Worker Welfare Board",
    issueDate: "2026-04-05",
    status: "Pending Review",
    appliesTo: ["Contract Workers"],
    remarks: "Understand the importance of maintaining worker registers under Contract Labour Act Section 25. Proper documentation ensures workforce transparency and regulatory compliance. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-05T09:30:00Z",
    videoUrl: YOUTUBE_LINKS[3]
  },
  {
    id: "KA-CMP-2005",
    documentName: "Contract Labour Act Sec 29 (Wage Records)",
    subLaw: "Contract Labour Act Sec 29",
    category: "Finance",
    authority: "Labour Department",
    authorityContact: "Audit & Payroll",
    issueDate: "2026-03-28",
    status: "Compliant",
    appliesTo: ["Admin", "Payroll"],
    remarks: "This video explains wage record compliance under Contract Labour Act Section 29. Maintaining accurate payment records helps prevent disputes and ensures transparency. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-03-28T15:45:00Z",
    videoUrl: YOUTUBE_LINKS[4]
  },
  {
    id: "KA-CMP-2006",
    documentName: "Contract Labour Act Sec 30 (Service Records)",
    subLaw: "Contract Labour Act Sec 30",
    category: "Labour Law",
    authority: "Labour Inspectorate",
    authorityContact: "Compliance Officer",
    issueDate: "2026-04-01",
    status: "Compliant",
    appliesTo: ["Staff", "HR"],
    remarks: "Learn about service record compliance under Contract Labour Act Section 30. Maintaining proof of work ensures accountability and avoids disputes. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-01T10:00:00Z",
    videoUrl: YOUTUBE_LINKS[0]
  },
  {
    id: "KA-CMP-2007",
    documentName: "Companies Act Sec 134 (Risk Reporting)",
    subLaw: "Companies Act Sec 134",
    category: "Corporate",
    authority: "MCA",
    authorityContact: "Registrar of Companies",
    issueDate: "2026-03-15",
    status: "Compliant",
    appliesTo: ["Board", "Management"],
    remarks: "This video explains risk reporting requirements under Companies Act Section 134. Organizations must disclose operational risks and safety measures for accountability and governance. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-03-15T14:20:00Z",
    videoUrl: YOUTUBE_LINKS[1]
  },
  {
    id: "KA-CMP-2008",
    documentName: "Companies Act Sec 143 (Audit Compliance)",
    subLaw: "Companies Act Sec 143",
    category: "Audit",
    authority: "MCA / ICAI",
    authorityContact: "Internal Auditor",
    issueDate: "2026-03-10",
    status: "Compliant",
    appliesTo: ["Finance", "Legal"],
    remarks: "Understand audit requirements under Companies Act Section 143. Maintaining verifiable records ensures audit readiness and transparency in operations. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-03-10T09:00:00Z",
    videoUrl: YOUTUBE_LINKS[2]
  },
  {
    id: "KA-CMP-2009",
    documentName: "Companies Act Sec 177 (Risk Management)",
    subLaw: "Companies Act Sec 177",
    category: "Corporate",
    authority: "MCA",
    authorityContact: "Risk Committee",
    issueDate: "2026-03-05",
    status: "Compliant",
    appliesTo: ["Managers"],
    remarks: "This video covers risk management under Companies Act Section 177. Organizations must identify and manage risks to ensure stability and accountability. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-03-05T16:30:00Z",
    videoUrl: YOUTUBE_LINKS[3]
  },
  {
    id: "KA-CMP-2010",
    documentName: "Motor Vehicles Act Sec 66 (Vehicle Permits)",
    subLaw: "MV Act Sec 66",
    category: "Transport",
    authority: "RTO",
    authorityContact: "Permit Section",
    issueDate: "2026-04-18",
    status: "Compliant",
    appliesTo: ["Vehicles", "Logistics"],
    remarks: "Learn about vehicle permit requirements under Motor Vehicles Act Section 66. Valid permits are essential for legal and smooth transport operations. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-18T11:45:00Z",
    videoUrl: YOUTUBE_LINKS[4]
  },
  {
    id: "KA-CMP-2011",
    documentName: "Motor Vehicles Act Sec 3 (Driver Licensing)",
    subLaw: "MV Act Sec 3",
    category: "Driver Safety",
    authority: "RTO",
    authorityContact: "Licensing Authority",
    issueDate: "2026-04-12",
    status: "Compliant",
    appliesTo: ["Drivers"],
    remarks: "This video explains driver licensing requirements under Motor Vehicles Act Section 3. Ensuring valid licences improves safety and compliance. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-12T08:50:00Z",
    videoUrl: YOUTUBE_LINKS[0]
  },
  {
    id: "KA-CMP-2012",
    documentName: "Motor Vehicles Act Sec 129 (Safety Gear)",
    subLaw: "MV Act Sec 129",
    category: "Road Safety",
    authority: "Traffic Police",
    authorityContact: "Safety Awareness Unit",
    issueDate: "2026-04-02",
    status: "Compliant",
    appliesTo: ["All Commuters"],
    remarks: "Understand safety gear requirements under Motor Vehicles Act Section 129. Helmets and seatbelts play a key role in reducing accident risks. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-02T13:10:00Z",
    videoUrl: YOUTUBE_LINKS[1]
  },
  {
    id: "KA-CMP-2013",
    documentName: "Motor Vehicles Act Sec 146 (Insurance)",
    subLaw: "MV Act Sec 146",
    category: "Insurance",
    authority: "IRDAI",
    authorityContact: "Insurance Desk",
    issueDate: "2026-03-20",
    status: "Compliant",
    appliesTo: ["All Vehicles"],
    remarks: "This video explains vehicle insurance requirements under Motor Vehicles Act Section 146. Insurance ensures financial protection and compliance. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-03-20T10:15:00Z",
    videoUrl: YOUTUBE_LINKS[2]
  },
  {
    id: "KA-CMP-2014",
    documentName: "GST Act Sec 31 (Invoices)",
    subLaw: "GST Act Sec 31",
    category: "Finance",
    authority: "GST Council",
    authorityContact: "Tax Department",
    issueDate: "2026-04-01",
    status: "Compliant",
    appliesTo: ["Accounts", "Vendors"],
    remarks: "Learn about invoicing compliance under GST Act Section 31. Proper invoices ensure transparency and accurate tax reporting. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-01T15:00:00Z",
    videoUrl: YOUTUBE_LINKS[3]
  },
  {
    id: "KA-CMP-2015",
    documentName: "GST Act Sec 35 (Records)",
    subLaw: "GST Act Sec 35",
    category: "Finance",
    authority: "GST Department",
    authorityContact: "GST Compliance Cell",
    issueDate: "2026-04-01",
    status: "Compliant",
    appliesTo: ["Accounts"],
    remarks: "This video covers record-keeping requirements under GST Act Section 35. Maintaining proper records ensures audit readiness and transparency. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-01T16:00:00Z",
    videoUrl: YOUTUBE_LINKS[4]
  },
  {
    id: "KA-CMP-2016",
    documentName: "POSH Act (Women Safety)",
    subLaw: "POSH Act 2013",
    category: "Women Safety",
    authority: "W&C Welfare",
    authorityContact: "Internal Committee",
    issueDate: "2026-04-15",
    status: "Compliant",
    appliesTo: ["All Employees", "Transport"],
    remarks: "Understand workplace safety requirements under the POSH Act. Ensuring safe transport and environment protects women employees and builds trust. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-15T09:00:00Z",
    videoUrl: YOUTUBE_LINKS[0]
  },
  {
    id: "KA-CMP-2017",
    documentName: "Shops & Establishments Act (Working Hours & Welfare)",
    subLaw: "S&E Act",
    category: "Labour Law",
    authority: "Labour Department",
    authorityContact: "S&E Inspector",
    issueDate: "2026-03-25",
    status: "Non-Compliant",
    appliesTo: ["Office Staff"],
    remarks: "This video explains working hours and employee welfare under the Shops and Establishments Act. Proper conditions ensure fairness and compliance. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-03-25T11:30:00Z",
    videoUrl: YOUTUBE_LINKS[1]
  },
  {
    id: "KA-CMP-2018",
    documentName: "Industrial Disputes Act (Fair Conditions)",
    subLaw: "Ind. Disputes Act",
    category: "Labour Law",
    authority: "Labour Court",
    authorityContact: "Grievance Cell",
    issueDate: "2026-03-18",
    status: "Compliant",
    appliesTo: ["Operations"],
    remarks: "Learn about fair working conditions under the Industrial Disputes Act. Proper practices help prevent disputes and maintain workplace harmony. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-03-18T14:45:00Z",
    videoUrl: YOUTUBE_LINKS[2]
  },
  {
    id: "KA-CMP-2019",
    documentName: "ESG Reporting Norms (SEBI)",
    subLaw: "SEBI ESG Norms",
    category: "Sustainability",
    authority: "SEBI",
    authorityContact: "Governance Unit",
    issueDate: "2026-04-01",
    status: "Pending Review",
    appliesTo: ["Management", "Investors"],
    remarks: "This video explains ESG reporting requirements under SEBI norms. Transparency in safety and governance builds trust with stakeholders. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-01T12:00:00Z",
    videoUrl: YOUTUBE_LINKS[3]
  },
  {
    id: "KA-CMP-2020",
    documentName: "Environmental Protection Act (Emission Norms)",
    subLaw: "EPA Emission",
    category: "Sustainability",
    authority: "PC Board",
    authorityContact: "Emission Unit",
    issueDate: "2026-04-10",
    status: "Compliant",
    appliesTo: ["Fleet"],
    remarks: "Understand emission compliance under the Environmental Protection Act. Maintaining vehicle standards helps reduce pollution and ensures sustainability. Transform your Daily Travel Struggles with VanLoka.",
    consent: true,
    consentTimestamp: "2026-04-10T14:00:00Z",
    videoUrl: YOUTUBE_LINKS[4]
  }
];

export const complianceStatusVariant = (status: string): string => {
  if (status === "Compliant") return "green";
  if (status === "Non-Compliant") return "red";
  if (status === "Pending Review") return "amber";
  return "blue";
};

export const categoryVariant = (category: string): string => {
  const c = category.toLowerCase();
  if (c.includes("working")) return "purple";
  if (c.includes("safety")) return "rose";
  if (c.includes("labour")) return "amber";
  if (c.includes("finance")) return "emerald";
  if (c.includes("corporate")) return "blue";
  if (c.includes("audit")) return "slate";
  if (c.includes("transport")) return "indigo";
  if (c.includes("sustainability")) return "teal";
  return "slate";
};
