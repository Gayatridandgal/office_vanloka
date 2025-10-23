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
  description: string;
}

export interface Gps {
  id: string; // A unique identifier for the record
  title: string;
  gps_id: string; // The actual ID of the device hardware
  remark: string;
}

export interface Beacon {
  id: string; // A unique identifier for the record
  title: string;
  beacon_id: string;
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
