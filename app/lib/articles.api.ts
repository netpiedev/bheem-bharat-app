import type {
  ApiListResponse,
  ApiSingleResponse,
  ArticleCategory,
  ArticleDetails,
  ArticleListItem,
} from "@/app/types/articles.types";
import axiosInstance from "./axiosInstance";

/**
 * Fetch articles with pagination and optional category filtering
 */
export const fetchArticles = async (
  page = 1,
  limit = 10,
  category?: string
): Promise<ApiListResponse<ArticleListItem>> => {
  const params: any = { page, limit };

  // Only add category if it's not "All"
  if (category && category !== "All") {
    params.category = category;
  }

  const res = await axiosInstance.get<ApiListResponse<ArticleListItem>>(
    "/resources/articles",
    { params }
  );
  return res.data;
};

export const fetchArticleById = async (id: string): Promise<ArticleDetails> => {
  const res = await axiosInstance.get<ApiSingleResponse<ArticleDetails>>(
    `/resources/articles/${id}`
  );
  return res.data.data;
};

export const fetchArticleCategories = async (): Promise<ApiListResponse<ArticleCategory>> => {
  const res = await axiosInstance.get<ApiListResponse<ArticleCategory>>(
    "/resources/articles/categories"
  );
  return res.data;
};