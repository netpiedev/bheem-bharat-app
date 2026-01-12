import axiosInstance from "./axiosInstance";

// ==========================================
// Types
// ==========================================

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

// ==========================================
// Fetch Functions
// ==========================================

/**
 * Get all Law Categories
 * Endpoint: /resources/laws/categories
 */
export const fetchLawCategories = async (): Promise<LawCategory[]> => {
  const res = await axiosInstance.get<ApiListResponse<LawCategory>>(
    "/resources/laws/categories"
  );
  return res.data.data;
};

/**
 * Get all Laws (List View)
 * Endpoint: /resources/laws/
 */
export const fetchLaws = async (): Promise<Law[]> => {
  const res = await axiosInstance.get<ApiListResponse<Law>>("/resources/laws/");
  return res.data.data;
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
