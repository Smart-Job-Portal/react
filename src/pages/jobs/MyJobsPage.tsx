import React, { useState } from "react";
import { Plus, Briefcase, AlertCircle, RefreshCw, Users } from "lucide-react";
import { JobCard } from "../../components/jobs/JobCard";
import { JobFormModal } from "../../components/jobs/JobFormModal";
import { JobApplicationsModal } from "../../components/jobs/JobApplicationsModal";
import { JobDetailModal } from "../../components/jobs/JobDetailModal";
import { Button, useToast } from "../../components/ui";
import { useUserJobs, useJobMutations } from "../../hooks/useJobs";
import type { Job, JobStatus, CreateJobData, UpdateJobData } from "../../types";

export const MyJobsPage: React.FC = () => {
  const { jobs, loading, error, refetch } = useUserJobs();
  const { createJob, updateJob, deleteJob } = useJobMutations();
  const { success, error: showError } = useToast();
  const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">("ALL");

  // Modal states
  const [showJobFormModal, setShowJobFormModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showJobDetailModal, setShowJobDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredJobs = jobs ? (statusFilter === "ALL" ? jobs : jobs.filter((job) => job.status === statusFilter)) : [];

  const getStatusCounts = () => {
    if (!jobs) return { total: 0, active: 0, pending: 0, inactive: 0 };

    return {
      total: jobs.length,
      active: jobs.filter((job) => job.status === "ACTIVE").length,
      pending: jobs.filter((job) => job.status === "PENDING").length,
      inactive: jobs.filter((job) => job.status === "INACTIVE").length,
    };
  };

  const statusCounts = getStatusCounts();

  const handleCreateJob = () => {
    setSelectedJob(null);
    setIsEditing(false);
    setShowJobFormModal(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsEditing(true);
    setShowJobFormModal(true);
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetailModal(true);
  };

  const handleViewApplications = (job: Job) => {
    setSelectedJob(job);
    setShowApplicationsModal(true);
  };

  const handleDeleteJob = async (jobId: number) => {
    if (window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      const result = await deleteJob(jobId);
      if (result.success) {
        refetch();
        success(result.message || "Job deleted successfully!");
      } else {
        showError(result.message || "Failed to delete job");
      }
    }
  };

  const handleJobFormSubmit = async (data: CreateJobData | UpdateJobData) => {
    try {
      let result;
      if (isEditing && selectedJob) {
        result = await updateJob(selectedJob.id, data as UpdateJobData);
      } else {
        result = await createJob(data as CreateJobData);
      }

      if (result.success) {
        refetch();
        setShowJobFormModal(false);
        success(result.message || (isEditing ? "Job updated successfully!" : "Job created successfully!"));
      } else {
        showError(result.message || "Failed to save job");
      }

      return result;
    } catch (error) {
      console.error("Error submitting job:", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  };

  const handleCloseModals = () => {
    setShowJobFormModal(false);
    setShowApplicationsModal(false);
    setShowJobDetailModal(false);
    setSelectedJob(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        </div>

        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        </div>

        <div className="text-center py-12">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <div className="flex space-x-3">
          <Button onClick={refetch} variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
          <Button onClick={handleCreateJob} leftIcon={<Plus className="h-4 w-4" />}>
            Post New Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
            </div>
            <div className="h-3 w-3 bg-green-400 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            </div>
            <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{statusCounts.inactive}</p>
            </div>
            <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "ALL", label: "All Jobs", count: statusCounts.total },
            { key: "ACTIVE", label: "Active", count: statusCounts.active },
            { key: "PENDING", label: "Pending", count: statusCounts.pending },
            { key: "INACTIVE", label: "Inactive", count: statusCounts.inactive },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key as JobStatus | "ALL")}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                ${
                  statusFilter === key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {label} ({count})
            </button>
          ))}
        </nav>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === "ALL" ? "No jobs posted yet" : `No ${statusFilter.toLowerCase()} jobs`}
          </h3>
          <p className="text-gray-600 mb-4">
            {statusFilter === "ALL"
              ? "Start by posting your first job to attract candidates."
              : `You don't have any ${statusFilter.toLowerCase()} jobs at the moment.`}
          </p>
          {statusFilter === "ALL" && (
            <Button onClick={handleCreateJob} leftIcon={<Plus className="h-4 w-4" />}>
              Post Your First Job
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="relative">
              <JobCard
                job={job}
                onView={handleViewJob}
                onEdit={handleEditJob}
                onDelete={handleDeleteJob}
                showActions={true}
              />
              {/* Applications Count Badge */}
              {job._count?.applications !== undefined && job._count.applications > 0 && (
                <button
                  onClick={() => handleViewApplications(job)}
                  className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  title="View applications"
                >
                  <Users className="h-3 w-3" />
                  <span>{job._count.applications}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <JobFormModal
        isOpen={showJobFormModal}
        onClose={handleCloseModals}
        onSubmit={handleJobFormSubmit}
        job={isEditing ? selectedJob : null}
        isLoading={false}
      />

      <JobApplicationsModal isOpen={showApplicationsModal} onClose={handleCloseModals} job={selectedJob} />

      <JobDetailModal
        isOpen={showJobDetailModal}
        onClose={handleCloseModals}
        job={selectedJob}
        showApplyButton={false}
      />
    </div>
  );
};
