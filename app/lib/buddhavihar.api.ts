import axiosInstance from "./axiosInstance";

import {
  ApiListResponse,
  ApiSingleResponse,
  BuddhaViharCity,
  BuddhaViharDetails,
  BuddhaViharListItem,
  BuddhaViharState,
} from "@/app/types/buddhavihar.types";

/* =========================================
   Buddha Vihar APIs (Frontend)
========================================= */

/**
 * Get all states with counts
 * GET /resources/buddhavihars/states
 */
export const fetchBuddhaViharStates = async (): Promise<BuddhaViharState[]> => {
  const res = await axiosInstance.get<ApiListResponse<BuddhaViharState>>(
    "/resources/buddhavihars/states"
  );

  return res.data.data;
};

/**
 * Get cities by state
 * GET /resources/buddhavihars/states/:stateId/cities
 */
export const fetchCitiesByState = async (
  stateId: string
): Promise<BuddhaViharCity[]> => {
  if (!stateId) {
    throw new Error("stateId is required");
  }

  const res = await axiosInstance.get<ApiListResponse<BuddhaViharCity>>(
    `/resources/buddhavihars/states/${stateId}/cities`
  );

  return res.data.data;
};

/**
 * Get Buddha Vihars by city
 * GET /resources/buddhavihars/cities/:cityId/vihars
 */
export const fetchBuddhaViharsByCity = async (
  cityId: string
): Promise<BuddhaViharListItem[]> => {
  if (!cityId) {
    throw new Error("cityId is required");
  }

  const res = await axiosInstance.get<ApiListResponse<BuddhaViharListItem>>(
    `/resources/buddhavihars/cities/${cityId}/vihars`
  );

  return res.data.data;
};

/**
 * Get Buddha Vihar details
 * GET /resources/buddhavihars/vihars/:viharId
 */
export const fetchBuddhaViharDetails = async (
  viharId: string
): Promise<BuddhaViharDetails> => {
  if (!viharId) {
    throw new Error("viharId is required");
  }

  const res = await axiosInstance.get<ApiSingleResponse<BuddhaViharDetails>>(
    `/resources/buddhavihars/vihars/${viharId}`
  );

  return res.data.data;
};
