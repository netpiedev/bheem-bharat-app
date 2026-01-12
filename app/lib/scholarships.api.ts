import axiosInstance from "./axiosInstance";

import {
  ApiListResponse,
  ApiSingleResponse,
  ScholarshipDetails,
  ScholarshipListItem,
  ScholarshipState,
} from "@/app/types/scholarships.types";

/* =========================================
   SCHOLARSHIPS APIs (Frontend)
========================================= */

/**
 * Get all scholarship states (dropdown)
 * GET /resources/scholarships/states
 */
export const fetchScholarshipStates = async (): Promise<ScholarshipState[]> => {
  const res = await axiosInstance.get<ApiListResponse<ScholarshipState>>(
    "/resources/scholarships/states"
  );

  return res.data.data;
};

/**
 * Get all scholarships
 * GET /resources/scholarships
 */
export const fetchAllScholarships = async (): Promise<
  ScholarshipListItem[]
> => {
  const res = await axiosInstance.get<ApiListResponse<ScholarshipListItem>>(
    "/resources/scholarships"
  );

  return res.data.data;
};

/**
 * Get scholarships by state name
 * GET /resources/scholarships?state=West Bengal
 */
export const fetchScholarshipsByState = async (
  stateName: string
): Promise<ScholarshipListItem[]> => {
  if (!stateName) {
    throw new Error("stateName is required");
  }

  const res = await axiosInstance.get<ApiListResponse<ScholarshipListItem>>(
    `/resources/scholarships`,
    {
      params: { state: stateName },
    }
  );

  return res.data.data;
};

/**
 * Get scholarship details
 * GET /resources/scholarships/:id
 */
export const fetchScholarshipDetails = async (
  scholarshipId: string
): Promise<ScholarshipDetails> => {
  if (!scholarshipId) {
    throw new Error("scholarshipId is required");
  }

  const res = await axiosInstance.get<ApiSingleResponse<ScholarshipDetails>>(
    `/resources/scholarships/${scholarshipId}`
  );

  return res.data.data;
};
