import type { ApiListResponse, ApiSingleResponse } from "./organizations.types";

export type JobType = "remote" | "hybrid" | "onsite";

export type JobListItem = {
  id: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  type: JobType;
  created_at: string;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  salary: string | null;
  location: string | null;
  type: JobType;
  created_at: string;
  updated_at?: string | null;
};

export type JobApplication = {
  name: string;
  email: string;
  description?: string;
};

export type JobApplicationResponse = {
  status: "success";
  data: {
    id: string;
    job_id: string;
    name: string;
    email: string;
    description?: string;
    created_at: string;
  };
  message: string;
};
