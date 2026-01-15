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
   ARTICLES
========================= */

export interface ArticleListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  published_date: string;
  created_at: string;
}

export interface ArticleDetails {
  id: string;
  title: string;
  content: string;
  category: string;
  published_date: string;
  official_url: string;
  created_at: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
}
