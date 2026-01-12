/* =========================
   COMMON API RESPONSES
========================= */

export interface ApiListResponse<T> {
  status: "success";
  count: number;
  data: T[];
}

export interface ApiSingleResponse<T> {
  status: "success";
  data: T;
}

/* =========================
   BOOKS
========================= */

export type BookCategoryListItem = {
  id: string;
  name: string;
  books_count: number;
};

export type BookListItem = {
  id: string;
  name: string;
  author: string;
  category: string;
  cover_image_object_key: string;
};

export type BookDetail = {
  id: string;
  name: string;
  author: string;
  category: string;
  description: string;
  source: string;
  cover_image_object_key: string;
  pdf_file_object_key: string;
  created_at: string;
};
