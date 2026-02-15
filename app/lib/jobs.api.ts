import axiosInstance from "./axiosInstance";
import type {
  ApiListResponse,
  ApiSingleResponse,
  Job,
  JobApplication,
  JobApplicationResponse,
  JobListItem,
  JobType,
} from "@/app/types/jobs.types";

/**
 * Fetch jobs with pagination and optional filtering by type, location, and search
 */
export const fetchJobs = async (
  page = 1,
  limit = 20,
  type?: JobType,
  location?: string,
  search?: string
): Promise<ApiListResponse<JobListItem>> => {
  const params: any = { page, limit };
  if (type) {
    params.type = type;
  }
  if (location && location.trim()) {
    params.location = location.trim();
  }
  if (search && search.trim()) {
    params.search = search.trim();
  }

  const res = await axiosInstance.get<ApiListResponse<JobListItem>>("/jobs", {
    params,
  });
  return res.data;
};

/**
 * Fetch job by ID
 */
export const fetchJobById = async (id: string): Promise<Job> => {
  try {
    const res = await axiosInstance.get<ApiSingleResponse<Job>>(`/jobs/${id}`);
    console.log("🟢 [jobs.api] fetchJobById response:", res.data);
    if (!res.data || !res.data.data) {
      throw new Error("Invalid response structure from API");
    }
    return res.data.data;
  } catch (error: any) {
    console.error("🔴 [jobs.api] fetchJobById error:", error);
    throw error;
  }
};

/**
 * Apply to a job
 */
export const applyToJob = async (
  jobId: string,
  application: JobApplication
): Promise<JobApplicationResponse> => {
  const res = await axiosInstance.post<JobApplicationResponse>(
    `/jobs/${jobId}/apply`,
    application
  );
  return res.data;
};
