import React, { useState, useMemo } from "react";
import { Shield, Briefcase, FileText, Users, RefreshCw, Check, X, Eye, AlertCircle } from "lucide-react";
import { useAdminJobs } from "../../hooks/useJobs";
import { useAllApplications, useApplicationMutations } from "../../hooks/useApplications";
import { useJobMutations } from "../../hooks/useJobs";
import { JobCard } from "../../components/jobs/JobCard";
import { JobDetailModal } from "../../components/jobs/JobDetailModal";
import { ApplicationCard } from "../../components/applications/ApplicationCard";
import { Button, Card, CardContent, Select, useToast } from "../../components/ui";
import { getStatusConfig, dateUtils } from "../../utils";
import { getApiUrl } from "../../constants/env";
import type { Job, JobStatus, ApplicationStatus } from "../../types";

type AdminTab = "jobs" | "applications";

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("jobs");
  const [jobStatusFilter, setJobStatusFilter] = useState<JobStatus | "ALL">("ALL");
  const [appStatusFilter, setAppStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetailModal, setShowJobDetailModal] = useState(false);
  const { success, error: showError } = useToast();

  // Jobs data with proper memoization
  const jobFilters = useMemo(() => {
    if (jobStatusFilter === "ALL") return undefined;
    return { status: jobStatusFilter, page: 1, limit: 50 };
  }, [jobStatusFilter]);

  const { jobs, loading: jobsLoading, error: jobsError, refetch: refetchJobs } = useAdminJobs(jobFilters);
  const { updateJobStatus } = useJobMutations();

  // Applications data
  const { applications, loading: appsLoading, error: appsError, refetch: refetchApplications } = useAllApplications();
  const { updateApplicationStatus } = useApplicationMutations();

  // Filter applications
  const filteredApplications = applications
    ? appStatusFilter === "ALL"
      ? applications
      : applications.filter((app: any) => app.status === appStatusFilter)
    : [];

  const getJobStats = () => {
    if (!jobs) return { total: 0, active: 0, pending: 0, inactive: 0 };
    return {
      total: jobs.length,
      active: jobs.filter((job) => job.status === "ACTIVE").length,
      pending: jobs.filter((job) => job.status === "PENDING").length,
      inactive: jobs.filter((job) => job.status === "INACTIVE").length,
    };
  };

  const getAppStats = () => {
    if (!applications) return { total: 0, pending: 0, accepted: 0, rejected: 0 };
    return {
      total: applications.length,
      pending: applications.filter((app: any) => app.status === "PENDING").length,
      accepted: applications.filter((app: any) => app.status === "ACCEPTED").length,
      rejected: applications.filter((app: any) => app.status === "REJECTED").length,
    };
  };

  const jobStats = getJobStats();
  const appStats = getAppStats();

  const handleJobStatusUpdate = async (jobId: number, status: JobStatus) => {
    const result = await updateJobStatus(jobId, status);
    if (result.success) {
      refetchJobs();
      success(result.message || "Job status updated successfully!");
    } else {
      showError(result.message || "Failed to update job status");
    }
  };

  const handleApplicationStatusUpdate = async (applicationId: number, status: ApplicationStatus) => {
    const result = await updateApplicationStatus(applicationId, status);
    if (result.success) {
      refetchApplications();
      success("Application status updated successfully!");
    } else {
      showError(result.message || "Failed to update application status");
    }
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetailModal(true);
  };

  const handleCloseJobDetailModal = () => {
    setShowJobDetailModal(false);
    setSelectedJob(null);
  };

  const handleDownloadResume = (application: any) => {
    if (application.resumePath) {
      const resumeUrl = getApiUrl(application.resumePath);
      window.open(resumeUrl, "_blank");
    }
  };

  const AdminJobCard: React.FC<{ job: Job }> = ({ job }) => {
    const statusConfig = getStatusConfig(job.status);

    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">{job.title}</h3>
              <p className="text-sm text-gray-600 mt-1">by {job.employerName}</p>
            </div>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>

          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{job.description}</p>

          <div className="text-sm text-gray-500 mb-3">
            <p>Posted: {dateUtils.formatRelative(job.createdAt)}</p>
            {job._count?.applications !== undefined && <p>Applications: {job._count.applications}</p>}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">ID: #{job.id}</span>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewJob(job)}
                leftIcon={<Eye className="h-3 w-3" />}
                className="text-xs px-2 py-1 h-6"
              >
                View
              </Button>
              {job.status === "PENDING" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleJobStatusUpdate(job.id, "INACTIVE")}
                    leftIcon={<X className="h-3 w-3" />}
                    className="text-xs px-2 py-1 h-6 text-red-600 hover:text-red-700"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleJobStatusUpdate(job.id, "ACTIVE")}
                    leftIcon={<Check className="h-3 w-3" />}
                    className="text-xs px-2 py-1 h-6 text-green-600 hover:text-green-700"
                  >
                    Approve
                  </Button>
                </>
              )}
              {job.status === "ACTIVE" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleJobStatusUpdate(job.id, "INACTIVE")}
                  leftIcon={<X className="h-3 w-3" />}
                  className="text-xs px-2 py-1 h-6 text-red-600 hover:text-red-700"
                >
                  Deactivate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderJobsTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{jobStats.total}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{jobStats.pending}</p>
              </div>
              <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">{jobStats.active}</p>
              </div>
              <div className="h-3 w-3 bg-green-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Inactive Jobs</p>
                <p className="text-2xl font-bold text-gray-600">{jobStats.inactive}</p>
              </div>
              <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:w-48">
          <Select
            placeholder="Filter by status"
            value={jobStatusFilter}
            onChange={(e) => setJobStatusFilter(e.target.value as JobStatus | "ALL")}
            options={[
              { value: "ALL", label: "All Jobs" },
              { value: "PENDING", label: "Pending" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
          />
        </div>
        <Button onClick={refetchJobs} variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </Button>
      </div>

      {/* Jobs Grid */}
      {jobsLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      ) : jobsError ? (
        <div className="text-center py-12">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{jobsError}</p>
          <Button onClick={refetchJobs} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <AdminJobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">
            {jobStatusFilter === "ALL"
              ? "No jobs have been posted yet."
              : `No ${jobStatusFilter.toLowerCase()} jobs found.`}
          </p>
        </div>
      )}
    </div>
  );

  const renderApplicationsTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{appStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{appStats.pending}</p>
              </div>
              <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{appStats.accepted}</p>
              </div>
              <div className="h-3 w-3 bg-green-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{appStats.rejected}</p>
              </div>
              <div className="h-3 w-3 bg-red-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:w-48">
          <Select
            placeholder="Filter by status"
            value={appStatusFilter}
            onChange={(e) => setAppStatusFilter(e.target.value as ApplicationStatus | "ALL")}
            options={[
              { value: "ALL", label: "All Applications" },
              { value: "PENDING", label: "Pending" },
              { value: "ACCEPTED", label: "Accepted" },
              { value: "REJECTED", label: "Rejected" },
            ]}
          />
        </div>
        <Button onClick={refetchApplications} variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </Button>
      </div>

      {/* Applications Grid */}
      {appsLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      ) : appsError ? (
        <div className="text-center py-12">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{appsError}</p>
          <Button onClick={refetchApplications} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      ) : filteredApplications && filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application: any) => (
            <ApplicationCard
              key={application.id}
              application={{
                id: application.id,
                description: application.description,
                resumePath: application.resumePath,
                resumeType: application.resumeType,
                originalFileName: application.originalFileName,
                status: application.status,
                userId: application.userId,
                jobId: application.jobId,
                createdAt: application.createdAt,
                updatedAt: application.updatedAt,
                job: {
                  id: application.job?.id || application.jobId,
                  title: application.job?.title || "Unknown Job",
                },
              }}
              onDownloadResume={handleDownloadResume}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600">
            {appStatusFilter === "ALL"
              ? "No applications have been submitted yet."
              : `No ${appStatusFilter.toLowerCase()} applications found.`}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage jobs and applications</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
              ${
                activeTab === "jobs"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Jobs ({jobStats.total})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
              ${
                activeTab === "applications"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Applications ({appStats.total})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "jobs" ? renderJobsTab() : renderApplicationsTab()}

      {/* Job Detail Modal */}
      <JobDetailModal
        isOpen={showJobDetailModal}
        onClose={handleCloseJobDetailModal}
        job={selectedJob}
        showApplyButton={false}
      />
    </div>
  );
};
