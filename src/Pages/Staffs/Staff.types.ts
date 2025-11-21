
export interface Staff {
  id: number;
  employee_id: string;
  photo?: FileList;
  first_name: string;
  last_name: string;
  full_name: string;
  designation: string;
  gender: string;
  address: string;
  joining_date: string;
  email: string;
  phone: string;
  roles: string[]; // Changed from role: Role[] to roles: string[]
  status: "Active" | "Inactive";
  created_at: string;
  updated_at: string;
}