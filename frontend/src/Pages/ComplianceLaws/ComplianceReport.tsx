import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import {
  ShieldCheck,
  ArrowLeft,
  FileText,
  Menu,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

import { AdvancedReport } from "./AdvancedReport";
import { InsightBox } from "./BasicReport";

const cv: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const iv: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
};
import { PDFExportModal } from "./PDFExportModal";

/* ─── Mock Data ─────── */
const instructorLicenses = [
  {
    name: "Rajesh Kumar",
    licNo: "TN-0012-2021",
    expiry: "Aug 2026",
    status: "Valid",
  },
  {
    name: "Priya Sharma",
    licNo: "KA-0045-2022",
    expiry: "Jan 2027",
    status: "Valid",
  },
  {
    name: "Anil Verma",
    licNo: "MH-0078-2020",
    expiry: "Apr 2026",
    status: "Expiring",
  },
  {
    name: "Sunita Patil",
    licNo: "KA-0033-2023",
    expiry: "Oct 2027",
    status: "Valid",
  },
  {
    name: "Deepak Nair",
    licNo: "KL-0092-2019",
    expiry: "Feb 2025",
    status: "Expired",
  },
];

const vehicleCompliance = [
  {
    no: "KA01AA1234",
    fitness: "Dec 2026",
    insurance: "Nov 2026",
    rc: "2032",
    permit: "Valid",
  },
  {
    no: "KA01BB5678",
    fitness: "Jun 2026",
    insurance: "Mar 2026",
    rc: "2030",
    permit: "Expired",
  },
  {
    no: "KA01CC9012",
    fitness: "Sep 2026",
    insurance: "Jul 2026",
    rc: "2031",
    permit: "Valid",
  },
  {
    no: "KA01DD3456",
    fitness: "Jan 2026",
    insurance: "Dec 2025",
    rc: "2029",
    permit: "Expired",
  },
  {
    no: "KA01EE7890",
    fitness: "Mar 2027",
    insurance: "Feb 2027",
    rc: "2033",
    permit: "Valid",
  },
];

const auditLog = [
  {
    user: "Admin",
    action: "Modified session entry",
    module: "Sessions",
    time: "Mar 28, 2026 · 11:02",
    risk: "High",
  },
  {
    user: "Manager",
    action: "Added new trainee",
    module: "Trainees",
    time: "Mar 27, 2026 · 09:45",
    risk: "Low",
  },
  {
    user: "Admin",
    action: "Deleted attendance record",
    module: "Attendance",
    time: "Mar 26, 2026 · 16:30",
    risk: "High",
  },
  {
    user: "Staff",
    action: "Updated vehicle record",
    module: "Vehicles",
    time: "Mar 25, 2026 · 13:15",
    risk: "Medium",
  },
  {
    user: "Manager",
    action: "Exported trainee list",
    module: "Reports",
    time: "Mar 24, 2026 · 10:00",
    risk: "Low",
  },
];

/* ─── Sub-components ─── */
const StatusBadge = ({ s }: { s: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    Valid: { bg: "#DCFCE7", color: "#15803D" },
    Expiring: { bg: "#FEF3C7", color: "#B45309" },
    Expired: { bg: "#FEE2E2", color: "#DC2626" },
    High: { bg: "#FEE2E2", color: "#DC2626" },
    Medium: { bg: "#FEF3C7", color: "#B45309" },
    Low: { bg: "#DCFCE7", color: "#15803D" },
  };
  const c = map[s] ?? { bg: "#F1F5F9", color: "#64748B" };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        padding: "3px 9px",
        borderRadius: 20,
        background: c.bg,
        color: c.color,
      }}
    >
      {s}
    </span>
  );
};

const ComplianceScore = ({ score }: { score: number }) => {
  const color = score >= 80 ? "#059669" : score >= 60 ? "#D97706" : "#DC2626";
  const label =
    score >= 80
      ? "GREEN — Fully Compliant"
      : score >= 60
        ? "AMBER — Review Needed"
        : "RED — Action Required";
  return (
    <div
      className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5"
      style={{
        background: color + "12",
        border: `2px solid ${color}40`,
        borderRadius: 16,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: `conic-gradient(${color} ${score * 3.6}deg, #E2E8F0 0deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 900,
            color,
          }}
        >
          {score}
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          AI Compliance Score
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color, marginTop: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
          Based on license validity, training hours, vehicle fitness & audit
          trail flags.
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN ─── */
export const ComplianceReport = () => {
  const navigate = useNavigate();
  const [pdfOpen, setPdfOpen] = useState(false);

  return (
    <>
      <div
        className="page-header"
        style={{ borderBottom: "1px solid #E2E8F0" }}
      >
        <div>
          <div
            className="page-title"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <ShieldCheck size={20} color="#059669" strokeWidth={2.5} />
            Compliance Report — March 2026
          </div>
          <div className="breadcrumb">
            Reports <span>/</span> Compliance
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="lg:hidden btn btn-secondary px-2"
            onClick={() => window.dispatchEvent(new Event("open-sidebar"))}
            style={{ width: 36, height: 36 }}
          >
            <Menu size={18} />
          </button>
          <button
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => navigate("/reports")}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <button
            className="btn btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#059669",
              boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
            }}
            onClick={() => setPdfOpen(true)}
          >
            <FileText size={15} /> Export PDF
          </button>
        </div>
      </div>

      <div
        className="page-body"
        id="compliance-report-content"
        style={{ background: "#F8FAFC" }}
      >
        <motion.div variants={cv} initial="hidden" animate="show">
          {/* Embedded Advanced (which embeds Basic) */}
          <AdvancedReport embedded />

          {/* ════════════════════════════════════
               PAGE 7 — RTO COMPLIANCE DASHBOARD
              ════════════════════════════════════ */}

          <ComplianceScore score={72} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Registered Trainees",
                val: "142 / 150",
                sub: "RTO Quota: 150",
                ok: true,
              },
              {
                label: "Min Hours Compliant",
                val: "89%",
                sub: "11% not yet at required hours",
                ok: true,
              },
              {
                label: "DL Test Pass Rate",
                val: "76%",
                sub: "Submitted to RTO",
                ok: true,
              },
              {
                label: "Pending RTO Filings",
                val: "3",
                sub: "Due within 7 days",
                ok: false,
              },
            ].map((k) => (
              <motion.div
                key={k.label}
                variants={iv}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 20,
                  border: `1.5px solid ${k.ok ? "#E2E8F0" : "#FCA5A5"}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <ShieldCheck size={20} color={k.ok ? "#059669" : "#DC2626"} />
                  {!k.ok && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        background: "#FEE2E2",
                        color: "#DC2626",
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      ACTION
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {k.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: k.ok ? "#0F172A" : "#DC2626",
                    marginTop: 2,
                  }}
                >
                  {k.val}
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>
                  {k.sub}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Instructor Licenses */}
          <motion.div
            variants={iv}
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #F1F5F9",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <FileText size={16} color="#059669" />
              <div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: "#0F172A",
                    margin: 0,
                  }}
                >
                  Instructor License Status
                </h3>
                <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
                  Government-issued driving instructor certification validity
                </p>
              </div>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="data-table w-full bg-white min-w-[600px]">
                <thead style={{ background: "#F8FAFC" }}>
                  <tr>
                    {[
                      "Instructor",
                      "License No.",
                      "Expiry Date",
                      "Status",
                      "Action Required",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 20px",
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#94A3B8",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {instructorLicenses.map((r, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid #F8FAFC",
                        background:
                          r.status === "Expired" ? "#FEF2F280" : "white",
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 20px",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#1E293B",
                        }}
                      >
                        {r.name}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: 12,
                          color: "#64748B",
                          fontFamily: "monospace",
                        }}
                      >
                        {r.licNo}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: 13,
                          color: "#475569",
                        }}
                      >
                        {r.expiry}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <StatusBadge s={r.status} />
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: 12,
                          color: r.status === "Valid" ? "#64748B" : "#DC2626",
                          fontWeight: r.status !== "Valid" ? 700 : 400,
                        }}
                      >
                        {r.status === "Valid"
                          ? "None"
                          : r.status === "Expiring"
                            ? "⚠ Renew within 30 days"
                            : "🚨 Suspend until renewed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              style={{
                padding: "12px 20px",
                background: "#FEF2F2",
                borderTop: "1px solid #FCA5A5",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "#991B1B",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                🤖 AI Flag: Deepak Nair's license expired Feb 2025 — immediate
                suspension from training duty required. RTO liability risk.
              </p>
            </div>
          </motion.div>

          {/* Vehicle Compliance */}
          <motion.div
            variants={iv}
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #F1F5F9",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <ShieldCheck size={16} color="#059669" />
              <div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: "#0F172A",
                    margin: 0,
                  }}
                >
                  Vehicle Fitness & Insurance Status
                </h3>
                <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
                  All mandatory certificates per vehicle
                </p>
              </div>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="data-table w-full bg-white min-w-[600px]">
                <thead style={{ background: "#F8FAFC" }}>
                  <tr>
                    {[
                      "Vehicle No.",
                      "Fitness Cert",
                      "Insurance",
                      "RC Valid Till",
                      "Permit",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 20px",
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#94A3B8",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicleCompliance.map((v, i) => {
                    const risky =
                      v.permit === "Expired" ||
                      v.insurance === "Dec 2025" ||
                      v.insurance === "Mar 2026";
                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid #F8FAFC",
                          background: risky ? "#FEF2F280" : "white",
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 20px",
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#1E293B",
                          }}
                        >
                          {v.no}
                        </td>
                        <td
                          style={{
                            padding: "14px 20px",
                            fontSize: 13,
                            color: "#475569",
                          }}
                        >
                          {v.fitness}
                        </td>
                        <td
                          style={{
                            padding: "14px 20px",
                            fontSize: 13,
                            fontWeight: 700,
                            color: risky ? "#DC2626" : "#475569",
                          }}
                        >
                          {v.insurance}
                        </td>
                        <td
                          style={{
                            padding: "14px 20px",
                            fontSize: 13,
                            color: "#475569",
                          }}
                        >
                          {v.rc}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <StatusBadge s={v.permit} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              style={{
                padding: "12px 20px",
                background: "#FFFBEB",
                borderTop: "1px solid #FDE68A",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "#92400E",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                🤖 AI Flag: KA01BB5678 permit expired · KA01DD3456 insurance
                expired Dec 2025 — remove from active fleet until documents are
                renewed.
              </p>
            </div>
          </motion.div>

          {/* ════════════════════════════════════
               PAGE 8 — AUDIT TRAIL
              ════════════════════════════════════ */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "KYC Complete Trainees",
                val: "94%",
                sub: "6% missing documents",
                ok: true,
              },
              {
                label: "Document Upload Rate",
                val: "96.8%",
                sub: "of trainee profiles",
                ok: true,
              },
              {
                label: "High-Risk Audit Events",
                val: "2",
                sub: "This month",
                ok: false,
              },
              {
                label: "Data Retention",
                val: "3+ Yrs",
                sub: "Compliance: OK",
                ok: true,
              },
            ].map((k) => (
              <motion.div
                key={k.label}
                variants={iv}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 20,
                  border: `1.5px solid ${k.ok ? "#E2E8F0" : "#FCA5A5"}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  {k.ok ? (
                    <CheckCircle2 size={18} color="#059669" />
                  ) : (
                    <XCircle size={18} color="#DC2626" />
                  )}
                  {!k.ok && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        background: "#FEE2E2",
                        color: "#DC2626",
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      REVIEW
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {k.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: k.ok ? "#0F172A" : "#DC2626",
                    marginTop: 2,
                  }}
                >
                  {k.val}
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>
                  {k.sub}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Audit Log Table */}
          <motion.div
            variants={iv}
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #F1F5F9",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Clock size={16} color="#7C3AED" />
              <div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: "#0F172A",
                    margin: 0,
                  }}
                >
                  User Activity Audit Log
                </h3>
                <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
                  Recent system actions — last 7 days
                </p>
              </div>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="data-table w-full bg-white min-w-[600px]">
                <thead style={{ background: "#F8FAFC" }}>
                  <tr>
                    {[
                      "User",
                      "Action",
                      "Module",
                      "Timestamp",
                      "Risk Level",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 20px",
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#94A3B8",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((r, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid #F8FAFC",
                        background: r.risk === "High" ? "#FEF2F240" : "white",
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 20px",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#1E293B",
                        }}
                      >
                        {r.user}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: 13,
                          color: "#475569",
                        }}
                      >
                        {r.action}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: 12,
                          color: "#7C3AED",
                          fontWeight: 700,
                        }}
                      >
                        {r.module}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: 11,
                          color: "#94A3B8",
                        }}
                      >
                        {r.time}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <StatusBadge s={r.risk} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              style={{
                padding: "14px 20px",
                background: "#FEF2F2",
                borderTop: "1px solid #FCA5A5",
              }}
            >
              <InsightBox
                type="warning"
                title="2 High-Risk Audit Events"
                text="Session modification & attendance deletion without dual approval detected. Enable mandatory manager approval workflow for delete actions."
              />
            </div>
          </motion.div>

          {/* FINAL COMPLIANCE SUMMARY BANNER */}
          <motion.div
            variants={iv}
            style={{
              background: "linear-gradient(135deg,#065F46,#047857)",
              borderRadius: 20,
              padding: "28px 28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <ShieldCheck size={22} color="white" />
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "white",
                  margin: 0,
                }}
              >
                Compliance Summary — Motor Driving School · March 2026
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: "✅ Completed",
                  items: [
                    "89% trainees at required hours",
                    "94% KYC complete",
                    "96.8% document uploads",
                    "3+ yr data retention",
                  ],
                },
                {
                  label: "⚠️ Due This Week",
                  items: [
                    "Renew Anil Verma license (Apr)",
                    "Renew KA01BB5678 permit",
                    "File 3 pending RTO forms",
                  ],
                },
                {
                  label: "🚨 Immediate Actions",
                  items: [
                    "Suspend Deepak Nair (expired lic.)",
                    "Ground KA01DD3456 (expired ins.)",
                    "Review 2 high-risk audit events",
                  ],
                },
              ].map((col) => (
                <div
                  key={col.label}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "16px 18px",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.85)",
                      marginBottom: 10,
                    }}
                  >
                    {col.label}
                  </div>
                  {col.items.map((item) => (
                    <div
                      key={item}
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.7)",
                        marginBottom: 5,
                        display: "flex",
                        gap: 6,
                      }}
                    >
                      <span style={{ flexShrink: 0 }}>→</span>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* PDF Export Modal */}
      <PDFExportModal
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        reportTitle="Compliance Report"
        contentId="compliance-report-content"
      />
    </>
  );
};

export default ComplianceReport;
