import { useState, useEffect, useCallback } from "react";
import { applicationsApi, handleApiError } from "../services/api";
import type {
  Application,
  CreateApplicationData,
  UpdateApplicationData,
  ApplicationStatus,
  AsyncState,
} from "../types";

// Hook for fetching all applications (admin only)
export const useAllApplications = () => {
  const [state, setState] = useState<AsyncState<Application[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchAllApplications = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await applicationsApi.getAll();

      setState({
        data: response || [],
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
    fetchAllApplications();
  }, [fetchAllApplications]);

  const refetch = useCallback(() => {
    fetchAllApplications();
  }, [fetchAllApplications]);

  return {
    applications: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
};

// Hook for fetching applications for a specific job (employer only)
export const useJobApplications = (jobId: number | null) => {
  const [state, setState] = useState<AsyncState<Application[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchJobApplications = useCallback(async (currentJobId: number) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await applicationsApi.getForJob(currentJobId);

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
    if (jobId) {
      fetchJobApplications(jobId);
    }
  }, [jobId, fetchJobApplications]);

  const refetch = useCallback(() => {
    if (jobId) {
      fetchJobApplications(jobId);
    }
  }, [jobId, fetchJobApplications]);

  return {
    applications: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
};

// Hook for fetching a single application
export const useApplication = (id: number | null) => {
  const [state, setState] = useState<AsyncState<Application>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchApplication = useCallback(async (applicationId: number) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await applicationsApi.getById(applicationId);

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
      fetchApplication(id);
    }
  }, [id, fetchApplication]);

  const refetch = useCallback(() => {
    if (id) {
      fetchApplication(id);
    }
  }, [id, fetchApplication]);

  return {
    application: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
};

// Hook for fetching user's applications (seeker only)
export const useUserApplications = () => {
  const [state, setState] = useState<AsyncState<Application[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchUserApplications = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await applicationsApi.getUserApplications();

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
    fetchUserApplications();
  }, [fetchUserApplications]);

  const refetch = useCallback(() => {
    fetchUserApplications();
  }, [fetchUserApplications]);

  return {
    applications: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
};

// Hook for application mutations (create, update)
export const useApplicationMutations = () => {
  const [loading, setLoading] = useState(false);

  const createApplication = useCallback(
    async (
      jobId: number,
      data: CreateApplicationData,
    ): Promise<{ success: boolean; message?: string; application?: Application }> => {
      try {
        setLoading(true);
        const response = await applicationsApi.create(jobId, data);

        return {
          success: true,
          message: "Application submitted successfully!",
          application: response.data,
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

  const updateApplication = useCallback(
    async (
      id: number,
      data: UpdateApplicationData,
    ): Promise<{ success: boolean; message?: string; application?: Application }> => {
      try {
        setLoading(true);
        const response = await applicationsApi.update(id, data);

        return {
          success: true,
          message: "Application status updated successfully!",
          application: response.data,
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

  const updateApplicationStatus = useCallback(
    async (
      id: number,
      status: ApplicationStatus,
    ): Promise<{ success: boolean; message?: string; application?: Application }> => {
      return updateApplication(id, { status });
    },
    [updateApplication],
  );

  return {
    createApplication,
    updateApplication,
    updateApplicationStatus,
    loading,
  };
};

// Hook for checking if user has already applied to a job
export const useApplicationStatus = (jobId: number | null) => {
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);

  const checkApplicationStatus = useCallback(async (currentJobId: number) => {
    try {
      setLoading(true);
      const response = await applicationsApi.getUserApplications();

      const userApplications = response.data || [];
      const existingApplication = userApplications.find((app) => app.jobId === currentJobId);

      setHasApplied(!!existingApplication);
      setApplicationId(existingApplication?.id || null);
    } catch (error) {
      console.error("Error checking application status:", error);
      setHasApplied(false);
      setApplicationId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (jobId) {
      checkApplicationStatus(jobId);
    }
  }, [jobId, checkApplicationStatus]);

  const refetch = useCallback(() => {
    if (jobId) {
      checkApplicationStatus(jobId);
    }
  }, [jobId, checkApplicationStatus]);

  return {
    hasApplied,
    applicationId,
    loading,
    refetch,
  };
};

// Hook for fetching employer applications (employer only)
export const useEmployerApplications = (filters?: { page?: number; limit?: number }) => {
  const [state, setState] = useState<AsyncState<Application[]>>({
    data: null,
    loading: true,
    error: null,
  });

  // Serialize filters for stable dependency
  const filtersString = JSON.stringify(filters);

  const fetchEmployerApplications = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await applicationsApi.getEmployerApplications(filters);

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
    fetchEmployerApplications();
  }, [fetchEmployerApplications]);

  const refetch = useCallback(() => {
    fetchEmployerApplications();
  }, [fetchEmployerApplications]);

  return {
    applications: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
};
