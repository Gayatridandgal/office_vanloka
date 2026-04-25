import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import tenantApi from "../../Services/ApiService";

type ToggleEntry = {
  label: string;
  description: string;
  value: boolean;
};

type OrganizationSettings = {
  id?: string;
  org_id?: string;
  name: string;
  type: string;
  registration_no: string;
  gst_number: string;
  pan_number: string;
  website: string;
  phone: string;
  email: string;
  status?: string;
  subscription_plan?: string;
  address: {
    address1: string;
    address2: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
  contact: {
    primary_name: string;
    primary_phone: string;
    primary_email: string;
  };
  institute: {
    affiliation_board: string;
    udise_code: string;
    institution_type: string;
    safety_officer_name: string;
    safety_officer_contact: string;
  };
  documents: {
    pan_card: string;
    gst_cert: string;
    registration_cert: string;
  };
};

const emptyOrg: OrganizationSettings = {
  name: "",
  type: "",
  registration_no: "",
  gst_number: "",
  pan_number: "",
  website: "",
  phone: "",
  email: "",
  address: {
    address1: "",
    address2: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
  },
  contact: {
    primary_name: "",
    primary_phone: "",
    primary_email: "",
  },
  institute: {
    affiliation_board: "",
    udise_code: "",
    institution_type: "",
    safety_officer_name: "",
    safety_officer_contact: "",
  },
  documents: {
    pan_card: "",
    gst_cert: "",
    registration_cert: "",
  },
};

const sectionClass = "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";
const labelClass = "mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    aria-pressed={checked}
    className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-slate-300"}`}
  >
    <span
      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);

const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: string;
  wide?: boolean;
}) => (
  <div className={wide ? "md:col-span-2" : undefined}>
    <label className={labelClass}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  </div>
);

const ReadField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="flex min-h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
      {value || "-"}
    </div>
  </div>
);

const SectionHeader = ({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: string;
}) => (
  <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>
    </div>
  </div>
);

export const SettingsPage = () => {
  const { user, tenantId } = useAuth();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [org, setOrg] = useState<OrganizationSettings>(emptyOrg);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggles, setToggles] = useState<ToggleEntry[]>([
    { label: "SMS Alerts", description: "Session reminders and updates", value: true },
    { label: "Auto Invoicing", description: "Generate PDFs automatically", value: false },
    { label: "Compliance Alerts", description: "Monitor SLA and policy checks", value: true },
    { label: "Feedback Forms", description: "Collect user feedback after trips", value: false },
  ]);

  const initials = useMemo(() => {
    const source = org.name || user?.name || "Organization";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "O";
  }, [org.name, user?.name]);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await tenantApi.get("/organization/me");
        if (res.data?.success && res.data?.data) {
          const data = res.data.data;
          setOrg({
            ...emptyOrg,
            ...data,
            address: { ...emptyOrg.address, ...(data.address || {}) },
            contact: { ...emptyOrg.contact, ...(data.contact || {}) },
            institute: { ...emptyOrg.institute, ...(data.institute || {}) },
            documents: { ...emptyOrg.documents, ...(data.documents || {}) },
          });
        }
      } catch (error) {
        console.error("Failed to fetch organization settings", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrg();
  }, []);

  const updateSection = <K extends keyof OrganizationSettings>(key: K, value: OrganizationSettings[K]) => {
    setOrg((current) => ({ ...current, [key]: value }));
  };

  const updateNested = <K extends keyof OrganizationSettings>(key: K, child: string, value: string) => {
    setOrg((current) => ({
      ...current,
      [key]: {
        ...(current[key] as Record<string, string>),
        [child]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();

      formData.append("name", org.name || "");
      formData.append("website", org.website || "");
      formData.append("phone", org.phone || "");
      formData.append("email", org.email || "");
      formData.append("gst_number", org.gst_number || "");
      formData.append("pan_number", org.pan_number || "");
      formData.append("address", JSON.stringify(org.address));
      formData.append("contact", JSON.stringify(org.contact));
      formData.append("institute", JSON.stringify(org.institute));
      formData.append("documents", JSON.stringify(org.documents));

      Object.entries(fileInputRefs.current).forEach(([field, input]) => {
        const file = input?.files?.[0];
        if (file) {
          formData.append(field, file);
        }
      });

      const res = await tenantApi.put("/organization/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        alert("Settings updated successfully.");
      }
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  const documentRows = [
    { label: "PAN Card", key: "pan_card" as const },
    { label: "GST Certificate", key: "gst_cert" as const },
    { label: "Registration Certificate", key: "registration_cert" as const },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Administration</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your organization profile, contact details, uploaded documents, and operational preferences from one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 lg:flex lg:flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Tenant</span>
              <span>{tenantId || org.org_id || "-"}</span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-[18px]">{saving ? "progress_activity" : "save"}</span>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <section className={sectionClass}>
              <SectionHeader
                icon="domain"
                title="Organization Profile"
                subtitle="Core identity details shown across the app and saved to your organization record."
              />
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <TextField label="Legal Name" value={org.name} onChange={(value) => updateSection("name", value)} placeholder="Organization name" wide />
                <ReadField label="Organization ID" value={org.org_id || org.id || tenantId || "-"} />
                <ReadField label="Type" value={org.type || "-"} />
                <ReadField label="Registration No." value={org.registration_no || "-"} />
                <TextField label="GST Number" value={org.gst_number} onChange={(value) => updateSection("gst_number", value)} placeholder="GST number" />
                <TextField label="PAN Number" value={org.pan_number} onChange={(value) => updateSection("pan_number", value)} placeholder="PAN number" />
                <TextField label="Website" value={org.website} onChange={(value) => updateSection("website", value)} placeholder="https://" wide />
                <TextField label="Primary Phone" value={org.phone} onChange={(value) => updateSection("phone", value)} placeholder="Contact number" />
                <TextField label="Primary Email" value={org.email} onChange={(value) => updateSection("email", value)} placeholder="Email address" type="email" />
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeader
                icon="contacts"
                title="Contact Information"
                subtitle="This is the contact record used by the system for organization-level communication."
              />
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <TextField
                  label="Contact Person"
                  value={org.contact.primary_name}
                  onChange={(value) => updateNested("contact", "primary_name", value)}
                  placeholder="Name"
                />
                <TextField
                  label="Contact Phone"
                  value={org.contact.primary_phone}
                  onChange={(value) => updateNested("contact", "primary_phone", value)}
                  placeholder="Phone number"
                />
                <TextField
                  label="Contact Email"
                  value={org.contact.primary_email}
                  onChange={(value) => updateNested("contact", "primary_email", value)}
                  placeholder="Email address"
                  type="email"
                  wide
                />
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeader
                icon="location_on"
                title="Address"
                subtitle="Registered office address used across reports and organizational records."
              />
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <TextField
                  label="Address Line 1"
                  value={org.address.address1}
                  onChange={(value) => updateNested("address", "address1", value)}
                  placeholder="Street address"
                  wide
                />
                <TextField
                  label="Address Line 2"
                  value={org.address.address2}
                  onChange={(value) => updateNested("address", "address2", value)}
                  placeholder="Area / locality"
                  wide
                />
                <TextField label="City" value={org.address.city} onChange={(value) => updateNested("address", "city", value)} placeholder="City" />
                <TextField label="District" value={org.address.district} onChange={(value) => updateNested("address", "district", value)} placeholder="District" />
                <TextField label="State" value={org.address.state} onChange={(value) => updateNested("address", "state", value)} placeholder="State" />
                <TextField label="PIN Code" value={org.address.pincode} onChange={(value) => updateNested("address", "pincode", value)} placeholder="PIN code" />
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeader
                icon="school"
                title="Institution Details"
                subtitle="Institution-specific fields that help classify your organization."
              />
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <TextField
                  label="Affiliation Board"
                  value={org.institute.affiliation_board}
                  onChange={(value) => updateNested("institute", "affiliation_board", value)}
                  placeholder="Board"
                />
                <TextField
                  label="UDISE Code"
                  value={org.institute.udise_code}
                  onChange={(value) => updateNested("institute", "udise_code", value)}
                  placeholder="UDISE code"
                />
                <TextField
                  label="Institution Type"
                  value={org.institute.institution_type}
                  onChange={(value) => updateNested("institute", "institution_type", value)}
                  placeholder="School / college / institute"
                />
                <TextField
                  label="Safety Officer"
                  value={org.institute.safety_officer_name}
                  onChange={(value) => updateNested("institute", "safety_officer_name", value)}
                  placeholder="Officer name"
                />
                <TextField
                  label="Officer Contact"
                  value={org.institute.safety_officer_contact}
                  onChange={(value) => updateNested("institute", "safety_officer_contact", value)}
                  placeholder="Officer phone"
                />
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeader
                icon="description"
                title="Documents"
                subtitle="Upload or replace official files. Existing files stay linked until updated."
              />
              <div className="grid gap-4 p-6 md:grid-cols-3">
                {documentRows.map((document) => {
                  const documentUrl = org.documents[document.key];
                  return (
                    <div key={document.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{document.label}</p>
                          <p className="mt-1 text-xs text-slate-400">PDF, image, or scanned copy</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">upload_file</span>
                      </div>

                      {documentUrl ? (
                        <a
                          href={documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
                        >
                          <span className="truncate">{documentUrl.split("/").pop()}</span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em]">View</span>
                        </a>
                      ) : (
                        <div className="mb-3 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-4 text-center text-xs font-semibold text-slate-400">
                          No file uploaded
                        </div>
                      )}

                      <input
                        ref={(element) => {
                          fileInputRefs.current[document.key] = element;
                        }}
                        type="file"
                        name={document.key}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section className={sectionClass}>
              <div className="bg-gradient-to-br from-slate-900 to-slate-700 px-6 py-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Logged in as</p>
                    <h3 className="mt-1 text-lg font-bold">{user?.name || org.name || "Organization"}</h3>
                    <p className="mt-1 text-sm text-white/75">{user?.email || org.email || "-"}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 p-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Status</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{org.status || "Active"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Plan</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{org.subscription_plan || "Professional"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Organization ID</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{org.org_id || org.id || tenantId || "-"}</p>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeader
                icon="tune"
                title="Operational Settings"
                subtitle="These switches are local UI settings and can later be connected to the backend."
              />
              <div className="divide-y divide-slate-100 px-6">
                {toggles.map((item, index) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                    </div>
                    <Toggle
                      checked={item.value}
                      onChange={() =>
                        setToggles((current) =>
                          current.map((entry, currentIndex) =>
                            currentIndex === index ? { ...entry, value: !entry.value } : entry,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeader
                icon="info"
                title="System Summary"
                subtitle="Quick reference for the current workspace and sync state."
              />
              <div className="space-y-0 px-6 py-4">
                {[
                  { label: "API Status", value: "Connected" },
                  { label: "Last Sync", value: new Date().toLocaleDateString() },
                  { label: "Tenant", value: tenantId || org.org_id || "-" },
                ].map((row, index, rows) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between py-3 ${index < rows.length - 1 ? "border-b border-slate-100" : ""}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{row.label}</span>
                    <span className="text-sm font-semibold text-slate-800">{row.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;