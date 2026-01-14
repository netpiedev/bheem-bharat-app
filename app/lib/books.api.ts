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
  ApiListResponse<BookCategoryListItem>
> => {
  const res = await axiosInstance.get<ApiListResponse<BookCategoryListItem>>(
    "/resources/books/categories"
  );
  return res.data;
};

/* Get books by category */
/* Updated fetchBooksByCategory in books.api.ts */
export const fetchBooksByCategory = async ({
  categoryId,
  pageParam = 1,
}: {
  categoryId: string;
  pageParam?: number;
}): Promise<ApiListResponse<BookListItem>> => {
  const res = await axiosInstance.get<ApiListResponse<BookListItem>>(
    `/resources/books/`,
    {
      params: {
        category: categoryId, // Backend uses the ID
        page: pageParam,
        limit: 10,
      },
    }
  );
  return res.data;
};

/* Get book by id */
export const fetchBookById = async (id: string): Promise<BookDetail> => {
  const res = await axiosInstance.get<ApiSingleResponse<BookDetail>>(
    `/resources/books/${id}`
  );
  return res.data.data;
};
