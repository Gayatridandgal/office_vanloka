export const app_features = [
"VIEW DASHBOARD",
"MANAGE ROLE PERMISIONS",
"MANAGE EMPLOYEES",
"MANAGE ATTENDERS",
"MANAGE VEHICLES",
"MANAGE DRIVERS",
"MANAGE INSTRUCTORS",
"MANAGE TRAVELERS",
"MANAGE BOOKINGS",
"MANAGE VENDORS",
"MANAGE SUPPORT TICKETS",
"VIEW BASIC REPORTS",
"VIEW COMPLIANCE REPORTS",
"ALL_ACCESS"
];


export const subscriptionsData = [
  {
    id: "SUB-ALPHA-001",
    organisation_id: "ORG-003C",
    plan_id: "PREMIUM-01",
    payment_date: "2025-01-01",
    start_date: "2025-01-01",
    end_date: "2026-01-01",
    next_payment_date: "2026-01-01", // For yearly, it's the end date
    payment_method: "Bank Transfer",
    billing_cycle: "Yearly",
    amount: 54990,
    status: "Active",
  },
  {
    id: "SUB-GREEN-002",
    organisation_id: "ORG-001A",
    plan_id: "STANDARD-01",
    payment_date: "2025-09-15",
    start_date: "2025-09-15",
    end_date: "2025-10-15",
    next_payment_date: "2025-10-15", // For monthly, it's the end date
    payment_method: "UPI",
    billing_cycle: "Monthly",
    amount: 2999,
    status: "Active",
  },
];
