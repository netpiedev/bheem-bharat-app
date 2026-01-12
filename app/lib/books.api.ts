// app/api/books.api.ts
import axiosInstance from "./axiosInstance";

import type {
  ApiListResponse,
  ApiSingleResponse,
  BookCategoryListItem,
  BookDetail,
  BookListItem,
} from "@/app/types/books.types";

/* Get all categories */
export const fetchBookCategories = async (): Promise<
  BookCategoryListItem[]
> => {
  const res = await axiosInstance.get<ApiListResponse<BookCategoryListItem>>(
    "/resources/books/categories"
  );
  return res.data.data;
};

/* Get books by category */
export const fetchBooksByCategory = async (
  category: string
): Promise<BookListItem[]> => {
  const res = await axiosInstance.get<ApiListResponse<BookListItem>>(
    `/resources/books/?category=${encodeURIComponent(category)}`
  );
  return res.data.data;
};

/* Get book by id */
export const fetchBookById = async (id: string): Promise<BookDetail> => {
  const res = await axiosInstance.get<ApiSingleResponse<BookDetail>>(
    `/resources/books/${id}`
  );
  return res.data.data;
};
