// app/api/articles.api.ts
import axiosInstance from "./axiosInstance";

import type {
  ApiListResponse,
  ApiSingleResponse,
  ArticleCategory,
  ArticleDetails,
  ArticleListItem,
} from "@/app/types/articles.types";

/* Get all articles */
export const fetchAllArticles = async (): Promise<ArticleListItem[]> => {
  const res = await axiosInstance.get<ApiListResponse<ArticleListItem>>(
    "/resources/articles"
  );
  return res.data.data;
};

/* Get articles by category */
export const fetchArticlesByCategory = async (
  category: string
): Promise<ArticleListItem[]> => {
  const res = await axiosInstance.get<ApiListResponse<ArticleListItem>>(
    `/resources/articles/?category=${encodeURIComponent(category)}`
  );
  return res.data.data;
};

/* Get article by id */
export const fetchArticleById = async (id: string): Promise<ArticleDetails> => {
  const res = await axiosInstance.get<ApiSingleResponse<ArticleDetails>>(
    `/resources/articles/${id}`
  );
  return res.data.data;
};

/* Get all categories */
export const fetchArticleCategories = async (): Promise<ArticleCategory[]> => {
  const res = await axiosInstance.get<ApiListResponse<ArticleCategory>>(
    "/resources/articles/categories"
  );
  return res.data.data;
};
