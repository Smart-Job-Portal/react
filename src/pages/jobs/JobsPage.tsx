import React, { useState, useMemo } from "react";
import { Search, Briefcase } from "lucide-react";
import { useJobs } from "../../hooks/useJobs";
import { useAuth } from "../../contexts/AuthContext";
import { useApplicationMutations } from "../../hooks/useApplications";
import { JobCard } from "../../components/jobs/JobCard";
import { JobDetailModal } from "../../components/jobs/JobDetailModal";
import { ApplicationModal } from "../../components/applications/ApplicationModal";
import { Button, Input, Select, Card, CardContent, useToast } from "../../components/ui";
import { UserRole, JobStatus, type Job } from "../../types";
import { JOB_STATUSES } from "../../constants";

export const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("ACTIVE");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showJobDetailModal, setShowJobDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Memoize filters to prevent infinite loop
  const filters = useMemo(
    () => ({
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      page: 1,
      limit: 1000, // Large limit to ensure we see all jobs
    }),
    [searchTerm, statusFilter],
  );

  // Fetch jobs with filters
  const { jobs, loading, error, refetch } = useJobs(filters);

  const { createApplication, loading: applicationLoading } = useApplicationMutations();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as JobStatus | "");
  };

  const handleApplyToJob = (job: Job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetailModal(true);
  };

  const handleSubmitApplication = async (description: string, resume?: File) => {
    if (!selectedJob) return;

    const result = await createApplication(selectedJob.id, {
      description,
      resume,
    });

    if (result.success) {
      setShowApplicationModal(false);
      setSelectedJob(null);
      // Show success message
      success(result.message || "Application submitted successfully!");
    } else {
      // Show error message
      showError(result.message || "Failed to submit application");
    }
  };

  const handleCloseApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
  };

  const handleCloseJobDetailModal = () => {
    setShowJobDetailModal(false);
    setSelectedJob(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Briefcase className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Failed to load jobs</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Jobs</h1>
          <p className="text-gray-600 mt-1">Discover amazing job opportunities that match your skills</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="text-sm text-gray-500">{jobs?.length || 0} jobs available</div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search jobs by title, description..."
                value={searchTerm}
                onChange={handleSearch}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={handleStatusFilter}
                options={[
                  { value: "", label: "All Statuses" },
                  ...JOB_STATUSES.map((status) => ({
                    value: status.value,
                    label: status.label,
                  })),
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      {jobs && jobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onView={handleViewJob}
              onApply={user?.role === UserRole.SEEKER && job.status === JobStatus.ACTIVE ? handleApplyToJob : undefined}
              showActions={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter
              ? "Try adjusting your search criteria or filters."
              : "There are no job postings available at the moment."}
          </p>
          {(searchTerm || statusFilter) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Job Detail Modal */}
      <JobDetailModal
        isOpen={showJobDetailModal}
        onClose={handleCloseJobDetailModal}
        job={selectedJob}
        onApply={user?.role === UserRole.SEEKER ? handleApplyToJob : undefined}
        showApplyButton={user?.role === UserRole.SEEKER}
      />

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <ApplicationModal
          isOpen={showApplicationModal}
          job={selectedJob}
          onClose={handleCloseApplicationModal}
          onSubmit={handleSubmitApplication}
          isLoading={applicationLoading}
        />
      )}
    </div>
  );
};
