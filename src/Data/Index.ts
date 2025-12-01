import type {
  LiveVehicle,
} from "../Types/Index";

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

export const allPermissions = [
  "view users",
  "create users",
  "edit users",
  "delete users",

  "view vehicles",
  "create vehicles",
  "edit vehicles",
  "delete vehicles",

  "view drivers",
  "create drivers",
  "edit drivers",
  "delete drivers",

  "view gps",
  "create gps",
  "edit gps",
  "delete gps",

  "view beacon",
  "create beacon",
  "edit beacon",
  "delete beacon",

  "view bookings",
  "create bookings",
  "edit bookings",
  "delete bookings",
];

export const rolesData = [
  {
    id: 1,
    name: "Administrator",
    description: "Access to all features and settings.",
    permissions: [
      "view users",
      "create users",
      "edit users",
      "delete users",

      "view vehicles",
      "create vehicles",
      "edit vehicles",
      "delete vehicles",
    ],
  },
  {
    id: 2,
    name: "Accountant",
    description: "Access to view only permissions",
    permissions: ["view vehicles", "view drivers"],
  },
  {
    id: 3,
    name: "Support Agent",
    description: "Manage user feedbacks and tickets",
    permissions: [],
  },
];

export const vehiclesData = [
  {
    id: "1",
    model: "TAT A406",
    name: "North-Bus",
    registration_number: "KA-01-AB-1234",
    insurance_certificate: "insurance.png",
    puc_certificate: "puc.png",
    gps_code: "GPS-A001",
    status: "Active",
  },
  {
    id: "2",
    model: "TATA A890",
    name: "Bus-8",
    registration_number: "KA-01-AB-1234",
    insurance_certificate: "",
    puc_certificate: "",
    gps_code: "GPS-A001",
    status: "Active",
  },

  {
    id: "3",
    model: "TATA A897",
    name: "BUS-5",
    registration_number: "KA-01-AB-1234",
    insurance_certificate: "insurance.png",
    puc_certificate: "puc.png",
    gps_code: "GPS-A001",
    status: "Active",
  },
];

export const driverData = [
  {
    id: "1",
    first_name: "Arun",
    last_name: "Kumar",
    phone: "9898787676",
    email: "arunkumar98@gmail.com",
    driving_license: "driving_license.jpeg",
    aadhaar_card: "aadhaar_card.jpeg",
    pan_card: "pan_card.jpg",
    beacon_code: "GPS-A001",
    status: "Active",
  },

  {
    id: "2",
    first_name: "Kishor",
    last_name: "Harje",
    phone: "9891187676",
    email: "kishorharje89@gmail.com",
    driving_license: "driving_license.jpeg",
    aadhaar_card: "aadhaar_card.jpeg",
    pan_card: "pan_card.jpg",
    beacon_code: "GPS-A001",
    status: "Active",
  },

  {
    id: "3",
    first_name: "Pratik",
    last_name: "Desai",
    phone: "9890087676",
    email: "pratikdesai009@gmail.com",
    driving_license: "driving_license.jpeg",
    aadhaar_card: "",
    pan_card: "",
    beacon_code: "GPS-A001",
    status: "Active",
  },
];

export const liveVehicleData: LiveVehicle[] = [
  {
    vehicleId: "1",
    vehicleName: "Bus 101",
    orgId: "ORG-001A", // Alpha Logistics
    gps: {
      lat: 15.8597, // Belagavi Area
      lng: 74.5077,
      speed: 45,
      timestamp: new Date().toISOString(),
    },
    beacons: [
      {
        id: "Beacon-918",
        name: "Viresh Sangappa",
        lastSeen: new Date().toISOString(),
      },
      {
        id: "Beacon-188",
        name: "Maya Somanache",
        lastSeen: new Date().toISOString(),
      },
    ],
  },
  {
    vehicleId: "2",
    vehicleName: "Bus 202",
    orgId: "ORG-003C", // Green Acres
    gps: {
      lat: 15.84,
      lng: 74.52,
      speed: 15,
      timestamp: new Date().toISOString(),
    },
    beacons: [
      {
        id: "Beacon-118",
        name: "Kumar Kothawadakar",
        lastSeen: new Date().toISOString(),
      },
    ],
  },
  {
    vehicleId: "3",
    vehicleName: "ST-101",
    orgId: "ORG-001A", // Alpha Logistics
    gps: {
      lat: 15.865,
      lng: 74.49,
      speed: 60,
      timestamp: new Date().toISOString(),
    },
    beacons: [
      {
        id: "Beacon-928",
        name: "Vikas Basrikatti",
        lastSeen: new Date().toISOString(),
      },
      {
        id: "Beacon-890",
        name: "Yogesh Dhamanekar",
        lastSeen: new Date().toISOString(),
      },
    ],
  },
];

export const plansData = [
  {
    id: "PREMIUM-01",
    name: "Premium Suite",
    description:
      "The complete solution for large-scale fleets requiring advanced analytics and maximum device support.",
    monthly_price: 4999,
    yearly_price: 54990, // Approx. 1 month discount
    duration: "Monthly",
    features: [
      { name: "VEHICLE MANAGEMENT", value: 50 },
      { name: "DRIVER MANAGEMENT", value: 100 },
      { name: "ERP INTEGRATION", value: 20 },
    ],
    status: "Active",
  },
  {
    id: "STANDARD-01",
    name: "Standard Pack",
    description:
      "Perfect for medium-sized businesses that need real-time tracking and standard reporting.",
    monthly_price: 2999,
    yearly_price: 32990,
    duration: "Monthly",
    features: [
      { name: "VEHICLE MANAGEMENT", value: 25 },
      { name: "DRIVER MANAGEMENT", value: 30 },
      { name: "ERP INTEGRATION", value: 10 },
    ],
    status: "Active",
  },
  {
    id: "BASIC-01",
    name: "Basic Starter",
    description:
      "Ideal for small businesses or individuals who need essential tracking for a few assets.",
    monthly_price: 999,
    yearly_price: 10990,
    duration: "Yearly",
    features: [
      { name: "VEHICLE MANAGEMENT", value: 10 },
      { name: "DRIVER MANAGEMENT", value: 10 },
      { name: "ERP INTEGRATION", value: 2 },
    ],
    status: "Inactive",
  },
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
