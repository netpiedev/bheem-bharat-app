import type {
  ApiListResponse,
  ApiSingleResponse,
  Law,
  LawCategory
} from "@/app/types/laws.types";
import axiosInstance from "./axiosInstance";

/**
 * Get all Law Categories
 * Endpoint: /resources/laws/categories
 */
export const fetchLawCategories = async (): Promise<ApiListResponse<LawCategory>> => {
  const res = await axiosInstance.get<ApiListResponse<LawCategory>>(
    "/resources/laws/categories"
  );
  return res.data;
};

// /**
//  * Get all Laws (List View)
//  * Endpoint: /resources/laws/
//  */
// export const fetchLaws = async (): Promise<Law[]> => {
//   const res = await axiosInstance.get<ApiListResponse<Law>>("/resources/laws/");
//   return res.data.data;
// };
/**
 * Get Laws with Pagination and Category filtering
 * Endpoint: /resources/laws/?page=1&limit=10&category=Name
 */
export const fetchLaws = async (page = 1, limit = 10, category?: string): Promise<ApiListResponse<Law>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // If the category is not "All", add it to params
  if (category && category !== "All") {
    params.append("category", category);
  }

  const res = await axiosInstance.get<ApiListResponse<Law>>(`/resources/laws/?${params.toString()}`);
  return res.data; // Return the whole response object to get the 'count'
};

/**
 * Get single Law by ID
 * Endpoint: /resources/laws/:id
 */
export const fetchLawById = async (id: string): Promise<Law> => {
  if (!id) {
    throw new Error("Law ID is required");
  }

  const res = await axiosInstance.get<ApiSingleResponse<Law>>(
    `/resources/laws/${id}`
  );
  return res.data.data;
};
