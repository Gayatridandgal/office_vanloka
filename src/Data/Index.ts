import type {
  AppUser,
  Beacon,
  Booking,
  Driver,
  Gps,
  LiveVehicle,
  Organisation,
  Staff,
  Traveler,
  Vehicle,
} from "../Types/Index";

export const app_features = [
  "VIEW_DASHBOARD",
  "MANAGE_VEHICLES",
  "MANAGE_DRIVERS",
  "MANAGE_USERS",
  "MANAGE_TRAVELERS",
  "MANAGE_GPS",
  "MANAGE_BEACON",
  "MANAGE_BOOKINGS",
  "MANAGE_TRAININGS",
  "DEFAULT",
  "MANAGE_SUPPORT_TICKETS",
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

export const staffData: Staff[] = [
  {
    id: "STAFF-001",
    photo: "https://randomuser.me/api/portraits/men/40.jpg",
    first_name: "Sanjay",
    last_name: "Kumar",
    email: "sanjay.k@example.com",
    phone: "9988776655",
    designation: "Senior Manager",
    role: [
      { id: 1, name: "Administrator" },
      { id: 2, name: "Accountant" },
    ],
    status: "Active",
  },
  {
    id: "STAFF-002",
    photo: "https://randomuser.me/api/portraits/men/40.jpg",
    first_name: "Anita",
    last_name: "Desai",
    email: "anita.d@example.com",
    phone: "9112233445",
    designation: "Support Executive",
    role: [{ id: 1, name: "Administrator" }],
    status: "Active",
  },
];

export const vehiclesData: Vehicle[] = [
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

export const driverData: Driver[] = [
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

export const assignedGps: Gps[] = [
  { id: "GPS-001", name: "GPS-989", imei_number: "8989871523" },
  { id: "GPS-002", name: "GPS-787", imei_number: "4565544344" },
  { id: "GPS-003", name: "GPS-898", imei_number: "0091212398" },
  { id: "GPS-004", name: "GPS-121", imei_number: "8675309444" },
];

export const assignedBeacons: Beacon[] = [
  { id: "BEACON-001", name: "BEACON-909", imei_number: "8675309111" },
  { id: "BEACON-002", name: "BEACON-187", imei_number: "8675309222" },
  { id: "BEACON-003", name: "BEACON-098", imei_number: "8675309333" },
  { id: "BEACON-004", name: "BEACON-101", imei_number: "3432212321" },
];

export const travelersData: Traveler[] = [
  {
    id: "TRV-001",
    user_id: "USER-001",
    organisation_id: "ORG-001A",
    photo: "https://randomuser.me/api/portraits/women/33.jpg",
    first_name: "Priya",
    last_name: "Verma",
    dob: "1988-11-15",
    gender: "Female",
    beacon: "BEACON-001",
    relationship: "Spouse",
  },
  {
    id: "TRV-002",
    user_id: "USER-001",
    organisation_id: "ORG-001A",
    photo: "https://randomuser.me/api/portraits/men/34.jpg",
    first_name: "Aarav",
    last_name: "Verma",
    dob: "2015-02-10",
    gender: "Male",
    beacon: "BEACON-002",
    relationship: "Child",
  },
];

export const appUsersData: AppUser[] = [
  {
    id: "USER-001",
    organisation_id: "ORG-001A",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    first_name: "Rohan",
    last_name: "Verma",
    dob: "1985-05-20",
    email: "rohan.verma@example.com",
    phone: "9876543210",
    address_line1: "123, MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    pin: "400001",
  },
  {
    id: "USER-002",
    organisation_id: "ORG-001A",
    photo: "https://randomuser.me/api/portraits/women/40.jpg",
    first_name: "Sunita",
    last_name: "Patel",
    dob: "1992-08-30",
    email: "sunita.patel@example.com",
    phone: "9123456789",
    address_line1: "45, Park Street",
    city: "Kolkata",
    state: "West Bengal",
    pin: "700016",
  },
];

export const organisationData: Organisation[] = [
  {
    id: "ORG-001A",
    plan_id: "PREMIUM-01",
    name: "Alpha Logistics Solutions",
    registred_business_name: "AlphaLogi Pvt. Ltd.",
    udyam_number: "UDYAM-MH-01-0012345",
    gst_number: "27AABCT1234A1Z5",
    sector: "Transportation & Supply Chain",
    contact_person_name: "Aman Sharma",
    contact_person_email: "aman.sharma@alphalogi.com",
    contact_person_phone: "+919876543210",
    contact_person_designation: "Operations Head",
    emergency_contact_number: "+912240123000",
    address: "AlphaLogi HQ, 100 Logistics Way, Mumbai, MH",
    employees: "450",
    vehicles: "120",
    gps_required: "120",
    beacon_required: "50",
    checkpoints: [{ name: "CBT" }, { name: "Channamma" }, { name: "Goa Ves" }],
    gps_devices: [{ name: "GPS-918", imei_number: "889777" }],
    beacon_devices: [
      { name: "Beacon-918", imei_number: "56455" },
      { name: "Beacon-987", imei_number: "85463" },
    ],
    username: "aman.admin@gmail.com",
    password: "hashed_password_alpha123",
    status: "Active",
  },

  {
    id: "ORG-003C",
    plan_id: "STANDARD-01",
    name: "Green Acres Farms",
    registred_business_name: "Green Acres Agricultural Co.",
    udyam_number: "UDYAM-PB-03-0098765",
    gst_number: "03AAGCT9876C1Z8",
    sector: "Agriculture & Farming",
    contact_person_name: "Baljeet Kaur",
    contact_person_email: "baljeet.kaur@greenacres.co",
    contact_person_phone: "+917009988770",
    contact_person_designation: "Farm Manager",
    emergency_contact_number: "+911602450123",
    address: "Green Acres Farm, 15 Farm Lane, Punjab, PB",
    employees: "150",
    vehicles: "25",
    gps_required: "10",
    beacon_required: "0",
    checkpoints: [
      { name: "Tilakwadi" },
      { name: "3rd Gate" },
      { name: "Piranwadi" },
    ],
    username: "baljeet.manager@greenacres.com",
    password: "hashed_password_greenfarm456",
    status: "Active",
  },
];

export const bookingsData: Booking[] = [
  {
    id: "BOOK-001",
    user_id: "USER-001",
    traveler_id: "TRV-001",
    beacon: "BEACON-001",
    organisation_id: "ORG-001A",
    booking_date: "2025-10-20",
    start_date: "2025-11-01",
    end_date: "2025-12-01",
    pickup_location: "Channamma", // This is now a checkpoint
    drop_location: "AlphaLogi HQ, 100 Logistics Way, Mumbai, MH", // This is the org's address
    pickup_time: "08:00 AM",
    status: "Active",
  },

  {
    id: "BOOK-001",
    user_id: "USER-001",
    traveler_id: "TRV-001",
    organisation_id: "ORG-001A",
    beacon: "BEACON-002",
    booking_date: "2025-10-20",
    start_date: "2025-11-01",
    end_date: "2025-12-01",
    pickup_location: "Channamma", // This is now a checkpoint
    drop_location: "AlphaLogi HQ, 100 Logistics Way, Mumbai, MH", // This is the org's address
    pickup_time: "08:00 AM",
    status: "Completed",
  },

  {
    id: "BOOK-001",
    user_id: "USER-001",
    traveler_id: "TRV-001",
    organisation_id: "ORG-001A",
    beacon: "",
    booking_date: "2025-10-20",
    start_date: "2025-11-01",
    end_date: "2025-12-01",
    pickup_location: "Channamma", // This is now a checkpoint
    drop_location: "AlphaLogi HQ, 100 Logistics Way, Mumbai, MH", // This is the org's address
    pickup_time: "08:00 AM",
    status: "New",
  },
  {
    id: "BOOK-002",
    user_id: "USER-001",
    traveler_id: "TRV-002",
    organisation_id: "ORG-001A",
    beacon: "BEACON-004",
    booking_date: "2025-09-15",
    start_date: "2025-10-01",
    end_date: "2025-11-01",
    pickup_location: "CBT", // A checkpoint
    drop_location: "AlphaLogi HQ, 100 Logistics Way, Mumbai, MH", // Org's address
    pickup_time: "07:00 AM",
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
