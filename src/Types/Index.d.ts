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

export interface FormDropdown {
  id: any;
  type: string;
  field: string;
  value: string;
}

export interface StateDistrict {
  id: any;
  state: string;
  district: string;
  city: string;
  pincode: string;
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

export interface GpsDevice {
  id: any;
  sequnce_number: string;
  serial_number: string;
  device_id: string;
  manufacture_date:Date;
  imei_number: string;
  status: string;
}

export interface BeaconDevice {
  id: any;
  sequnce_number: string;
  serial_number: string;
  device_id: string;
  manufacture_date:Date;
  imei_number: string;
  status: string;
}

export interface oldLiveVehicle {
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

export interface LiveVehicle {
  vehicleId: string;
  vehicleName: string;
  registrationNumber?: string;
  orgId: string;
  gps: {
    lat: number;
    lng: number;
    speed: number;
    timestamp: string;
  };
  beacons: Array<{
    id: string;
    name: string;
    type: string;
    lastSeen: string;
    rssi?: number;
  }>;
  battery?: number;
}
