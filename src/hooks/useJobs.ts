import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { jobsApi, handleApiError } from "../services/api";
import type { Job, CreateJobData, UpdateJobData, JobFilters, JobStatus, AsyncState } from "../types";

// Hook for fetching all jobs
export const useJobs = (filters?: JobFilters) => {
  const [state, setState] = useState<AsyncState<Job[]>>({
    data: null,
    loading: true,
    error: null,
  });

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(
    () => filters,
    [filters?.search, filters?.status, filters?.page, filters?.limit, filters?.employerId],
  );

  const fetchJobs = useCallback(
    async (currentFilters?: JobFilters) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await jobsApi.getAll(currentFilters || memoizedFilters);

        setState({
          data: response.data || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = handleApiError(error);
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
      }
    },
    [memoizedFilters],
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const refetch = useCallback(
    (newFilters?: JobFilters) => {
      fetchJobs(newFilters);
    },
    [fetchJobs],
  );

  return {
    jobs: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
};

// Hook for fetching a single job
export const useJob = (id: number | null) => {
  const [state, setState] = useState<AsyncState<Job>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchJob = useCallback(async (jobId: number) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await jobsApi.getById(jobId);

      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id, fetchJob]);

  const refetch = useCallback(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id, fetchJob]);

  return {
    job: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
};

// Hook for fetching user's jobs (employer only)
export const useUserJobs = () => {
  const [state, setState] = useState<AsyncState<Job[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchUserJobs = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await jobsApi.getUserJobs();

      setState({
        data: response.data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, []);

  useEffect(() => {
    fetchUserJobs();
  }, [fetchUserJobs]);

  const refetch = useCallback(() => {
    fetchUserJobs();
  }, [fetchUserJobs]);

  return {
    jobs: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
};

// Hook for admin jobs
export const useAdminJobs = (filters?: JobFilters) => {
  const [state, setState] = useState<AsyncState<Job[]>>({
    data: null,
    loading: true,
    error: null,
  });

  // Serialize filters for stable dependency
  const filtersString = JSON.stringify(filters);

  const getAllAdminJobs = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await jobsApi.getAllAdmin(filters);

      setState({
        data: response.data || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [filtersString]);

  useEffect(() => {
    getAllAdminJobs();
  }, [getAllAdminJobs]);

  const refetch = useCallback(() => {
    getAllAdminJobs();
  }, [getAllAdminJobs]);

  return {
    jobs: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
};

// Hook for job mutations (create, update, delete)
export const useJobMutations = () => {
  const [loading, setLoading] = useState(false);

  const createJob = useCallback(
    async (data: CreateJobData): Promise<{ success: boolean; message?: string; job?: Job }> => {
      try {
        setLoading(true);
        const response = await jobsApi.create(data);

        return {
          success: true,
          message: "Job created successfully!",
          job: response.data,
        };
      } catch (error) {
        const errorMessage = handleApiError(error);
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateJob = useCallback(
    async (id: number, data: UpdateJobData): Promise<{ success: boolean; message?: string; job?: Job }> => {
      try {
        setLoading(true);
        const response = await jobsApi.update(id, data);

        return {
          success: true,
          message: "Job updated successfully!",
          job: response.data,
        };
      } catch (error) {
        const errorMessage = handleApiError(error);
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteJob = useCallback(async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      await jobsApi.delete(id);

      return {
        success: true,
        message: "Job deleted successfully!",
      };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateJobStatus = useCallback(
    async (id: number, status: JobStatus): Promise<{ success: boolean; message?: string; job?: Job }> => {
      try {
        setLoading(true);
        const response = await jobsApi.updateAdmin(id, { status });

        return {
          success: true,
          message: "Job status updated successfully!",
          job: response.data,
        };
      } catch (error) {
        const errorMessage = handleApiError(error);
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    createJob,
    updateJob,
    deleteJob,
    updateJobStatus,
    loading,
  };
};
