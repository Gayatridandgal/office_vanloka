import type { Permission, Role } from "../Pages/RolesPermissions/RolesPermissions.types";

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  message?: string;
}

export interface SubLink {
  name: string;
  path: string;
  feature: string;
  icon: JSX.Element;
  requiredPermissions?: string[];
}

export interface SidebarLinkType {
  name: string;
  icon: JSX.Element;
  feature: string;
  path?: string;
  subLinks?: SubLink[];
  requiredPermissions?: string[];
}

// application types
export interface User {
  id?: string | number;
  username?: string;
  email?: string;
  mobile?: string;
  password?: string;
  token?: string;
  refresh_token?: string;
  roles?: Role[];
  permissions?: Permission[];
  photo_url?: string;
}


export interface Gps {
  id: string; // A unique identifier for the record
  name: string;
  imei_number: string; // The actual ID of the device hardware
  remark?: string;
}

export interface Beacon {
  id: string; // A unique identifier for the record
  name: string;
  imei_number?: string; // The actual ID of the device hardware
  remark?: string;
  lastSeen?: Timestamps;
}

export interface Organisation {
  id: string;
  plan_id: string;
  name: string;
  registred_business_name: string;
  udyam_number: string;
  gst_number: string;
  sector: string;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  contact_person_designation: string;
  emergency_contact_number: string;

  // count
  employees: string;
  vehicles: string;
  gps_required: string;
  beacon_required: string;
  checkpoints?: { name: string }[];

  gps_devices?: { name: string; imei_number: string }[];
  beacon_devices?: { name: string; imei_number: string }[];

  address?: string;

  // Admin credentials
  username: string;
  password: string;
  status: "Active" | "Inactive";
}

export interface LiveVehicle {
  vehicleId: string;
  vehicleName: string; // e.g., the bus number
  orgId: string;
  gps: {
    lat: number;
    lng: number;
    speed: number;
    timestamp: string;
  };
  beacons: Beacon[];
}
