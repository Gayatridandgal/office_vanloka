// src/data/index.ts
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

// Dummy data for demonstration
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
