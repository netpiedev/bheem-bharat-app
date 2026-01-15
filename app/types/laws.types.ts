export interface ApiListResponse<T> {
  status: string;
  count: number;
  data: T[];
}

export interface ApiSingleResponse<T> {
  status: string;
  data: T;
}

export interface LawCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface Law {
  id: string;
  title: string;
  short_description: string;
  full_description: string;
  important_points: string[];
  category: string;
  act_year: string;
  official_url: string;
  created_at: string;
}
