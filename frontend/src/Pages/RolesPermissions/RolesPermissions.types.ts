export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions_count?: number;
  permissions?: Permission[];
}


export interface Permission {
  id: number;
  name: string;
}
