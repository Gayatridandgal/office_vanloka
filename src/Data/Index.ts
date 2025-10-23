import type { Gps, Vehicle } from "../Types/Index";

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

//  Dummy gps data for demonstration
export const gpsDevicesData: Gps[] = [
  {
    id: "1",
    title: "Bus 01 Tracker",
    gps_id: "GPS-A001",
    remark: "Primary tracker for the main fleet.",
  },
  {
    id: "2",
    title: "Service Van",
    gps_id: "GPS-B002",
    remark: "Secondary vehicle, needs battery check.",
  },
  {
    id: "3",
    title: "Delivery Truck",
    gps_id: "GPS-D004",
    remark: "Currently active on Route 66.",
  },
];

//  Dummy beacon data for demonstration
export const beaconDevicesData = [
  {
    id: "1",
    title: "Beacon",
    beacon_id: "BEACON-A001",
  },
  {
    id: "2",
    title: "Beacon",
    beacon_id: "BEACON-B002",
  },
  {
    id: "3",
    title: "Beacon",
    beacon_id: "BEACON-D003",
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
