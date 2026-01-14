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
   ORGANIZATIONS
========================= */

export type OrganizationListItem = {
  id: string;
  name: string;
  short_description: string;
  city: string;
  state: string;
};

export type Organization = {
  id: string;
  name: string;
  description: string;
  short_description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website_url?: string;
  created_at: string;
};
