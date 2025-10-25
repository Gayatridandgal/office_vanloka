import type { Driver, Vehicle } from "../Types/Index";

//  Dummy features data for demonstration
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

//  Dummy permissions data for demonstration
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

// Dummy roles data for demonstration
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

// Dummy vehicle data for demostration
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

// Dummy vehicle data for demostration
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

export const assignedGps = [
  { id: "GPS-001", name: "GPS-989", imei_number: "8989871523" },
  { id: "GPS-002", name: "GPS-787", imei_number: "4565544344" },
  { id: "GPS-003", name: "GPS-898", imei_number: "0091212398" },
  { id: "GPS-004", name: "GPS-121", imei_number: "8675309444" },
];

export const assignedBeacons = [
  { id: "BEACON-001", name: "BEACON-909", imei_number: "8675309111" },
  { id: "BEACON-002", name: "BEACON-187", imei_number: "8675309222" },
  { id: "BEACON-003", name: "BEACON-098", imei_number: "8675309333" },
  { id: "BEACON-004", name: "BEACON-101", imei_number: "3432212321" },
];
