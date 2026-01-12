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
   MEDIA
========================= */

export type Media = {
  id: string;
  title: string;
  description: string;
  source_text: string;
  file_type: string;
  duration: number;
  thumbnail_key: string;
  object_key: string;
  mime_type: string;
};

export type MediaListItem = {
  id: string;
  title: string;
  description: string;
  file_type: string;
  duration: number;
  thumbnail_key: string;
  object_key: string;
};

export type MediaDetail = {
  id: string;
  title: string;
  description: string;
  source_text: string;
  file_type: string;
  duration: number;
  thumbnail_key: string;
  object_key: string;
  mime_type: string;
};
