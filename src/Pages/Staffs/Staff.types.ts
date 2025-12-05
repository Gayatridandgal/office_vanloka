
export interface Staff {
  id: number;
  employee_id: string;
  photo?: FileList;
  first_name: string;
  last_name: string;
  full_name: string;
  designation: string;
  gender: string;

  joining_date: string;
  email: string;
  phone: string;

  address_line_1: string;
  address_line_2: string;
  landmark: string;
  district: string;
  city: string;
  state: string;
  pincode: string;


  roles: string[]; // Changed from role: Role[] to roles: string[]
  status: "Active" | "Inactive";
  created_at: string;
  updated_at: string;
}