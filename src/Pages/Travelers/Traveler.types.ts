import type { Booking } from "../Bookings/Booking.types";

export interface Traveller {
  id: number;
  traveller_uid?: string;
  first_name: string;
  last_name: string;
  gender?: string;
  date_of_birth?: string;
  profile_photo?: string;
  relationship?: string;
  beacon_id?: string;
  aadhaar_number?: string;
  blood_group?: string;
  remarks_notes?: string;
  created_at?: string;
  updated_at?: string;
  bookings?:Booking[];
}

