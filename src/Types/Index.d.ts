export interface User {
  username?: string;
  email?: string;
  password?: string;
}

export interface SubLink {
  name: string;
  path: string;
  feature: string;
}

export interface SidebarLinkType {
  name: string;
  icon: JSX.Element;
  feature: string;
  path?: string;
  subLinks?: SubLink[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
}

export interface Staff {
  id: string;
  photo?: FileList | string;
  first_name: string;
  last_name: string;
  dob?: string;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  joining_date?: string;
  leaving_date?: string;
  email: string;
  phone: string;
  designation: string;
  role: Role[];
  status: "Active" | "Inactive";
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

export interface Vehicle {
  id: string;
  model: string;
  name: string;
  registration_number: string;
  insurance_certificate: file;
  puc_certificate: file;
  gps_code: string;
  status: "Active" | "Inactive" | "Maintenance"; // Use a specific type for status
}

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  driving_license: file;
  aadhaar_card?: file;
  pan_card?: file;
  beacon_code: string;
  status: "Active" | "Inactive"; // Use a specific type for status
}

export interface Traveler {
  id: string; // A unique ID for the traveler, useful for mapping keys
  user_id: string; // Reference to the parent user
  organisation_id: string;
  photo: FileList | string; // Can be a FileList on create, or a string (URL) when fetched
  first_name: string;
  last_name: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  beacon?: string;
  relationship: "Spouse" | "Child" | "Parent" | "Sibling" | "Other";
}

export interface AppUser {
  id: string;
  organisation_id: string | null;
  photo: FileList | string;
  first_name: string;
  last_name: string;
  dob: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pin: string;
  travelers?: Traveler[];
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

export interface Booking {
  id: string;
  user_id: string;
  traveler_id: string;
  organisation_id: string;
  beacon?: string;
  booking_date: string;
  start_date: string;
  end_date: string;
  pickup_location: string; // This will be a checkpoint name
  drop_location: string; // This will be the organisation's address
  pickup_time: string;
  status: "Active" | "Completed" | "Cancelled" | "New";
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
