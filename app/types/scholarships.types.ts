/* =========================================
   COMMON API RESPONSES
========================================= */

export interface ApiListResponse<T> {
  status: "success";
  count: number;
  data: T[];
}

export interface ApiSingleResponse<T> {
  status: "success";
  data: T;
}

/* =========================================
   SCHOLARSHIP STATE (Dropdown)
========================================= */

export interface ScholarshipState {
  id: string;
  name: string;
  created_at: string;
}

/* =========================================
   SCHOLARSHIP LIST ITEM
   (Used in list / filter screen)
========================================= */

export interface ScholarshipListItem {
  id: string;
  title: string;
  description: string;

  state_id: string;
  state_name: string;

  last_date: string; // ISO string
}

/* =========================================
   SCHOLARSHIP DETAILS
   (Used in details screen)
========================================= */

export interface ScholarshipDetails {
  id: string;

  title: string;
  description: string;

  state_id: string;
  state_name: string;

  income_limit: number | string | null;

  gender: string;
  minority_type: string | null;

  education_level: string;

  benefits: string;
  application_process: string;

  documents_required: string[];

  last_date: string;
  official_url: string;

  created_at: string;
}
