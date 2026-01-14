/* =========================
   COMMON API RESPONSES
========================= */

export interface ApiListResponse<T> {
  status: "success";
  count: number;
  data: T[];
  page: number;
  limit: number;
}

export interface ApiSingleResponse<T> {
  status: "success";
  data: T;
}

/* =========================
   HOSTELS
========================= */

export type HostelType = "Boys" | "Girls" | "Both";

export interface Hostel {
  id: string;
  name: string;
  hostel_type: HostelType;

  address: string;
  city: string;
  state: string;
  pincode: string;

  contact_phone: string;
  contact_person: string;

  facilities: string;
  eligibility: string;

  monthly_fee: number;
  capacity: number;

  images: string[];

  created_at: string;
  updated_at: string;
}

export type HostelListItem = {
  id: string;
  name: string;
  hostel_type: HostelType;
  address: string;
  city: string;
  state: string;
  capacity: number;
  images: string[];
};
