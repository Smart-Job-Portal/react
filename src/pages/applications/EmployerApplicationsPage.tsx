import React, { useState, useMemo } from "react";
import { FileText, AlertCircle, RefreshCw, Users, Download, Check, X } from "lucide-react";
import { useEmployerApplications, useApplicationMutations } from "../../hooks/useApplications";
import { ApplicationCard } from "../../components/applications/ApplicationCard";
import { Button, Card, CardContent, Select, useToast } from "../../components/ui";
import { getApiUrl } from "../../constants/env";
import { dateUtils, getStatusConfig } from "../../utils";
import type { ApplicationStatus } from "../../types";

interface EmployerApplication {
  id: number;
  description: string;
  resumePath?: string;
  resumeType?: string;
  originalFileName?: string;
  status: ApplicationStatus;
  userId: number;
  jobId: number;
  createdAt?: string;
  updatedAt?: string;
  job: {
    id: number;
    title: string;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const EmployerApplicationsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 20;

  const { success, error: showError } = useToast();

  // Fetch applications with pagination
  const filters = useMemo(() => ({ page: currentPage, limit: pageLimit }), [currentPage, pageLimit]);
  const { applications, loading, error, refetch } = useEmployerApplications(filters);
  const { updateApplicationStatus, loading: updateLoading } = useApplicationMutations();

  // Transform applications to match our component interface
  const transformedApplications: EmployerApplication[] = (applications || []).map((app: any) => ({
    id: app.id,
    description: app.description,
    resumePath: app.resumePath,
    resumeType: app.resumeType,
    originalFileName: app.originalFileName,
    status: app.status,
    userId: app.userId || app.user?.id,
    jobId: app.jobId || app.job?.id,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    job: {
      id: app.job?.id || app.jobId,
      title: app.job?.title || "Unknown Job",
    },
    user: {
      id: app.user?.id || app.userId,
      firstName: app.user?.firstName || "Unknown",
      lastName: app.user?.lastName || "User",
      email: app.user?.email || "No email",
    },
  }));

  // Filter applications by status
  const filteredApplications = transformedApplications.filter((app) =>
    statusFilter === "ALL" ? true : app.status === statusFilter
  );

  const getStatusCounts = () => {
    return {
      total: transformedApplications.length,
      pending: transformedApplications.filter((app) => app.status === "PENDING").length,
      accepted: transformedApplications.filter((app) => app.status === "ACCEPTED").length,
      rejected: transformedApplications.filter((app) => app.status === "REJECTED").length,
    };
  };

  const statusCounts = getStatusCounts();

  const handleStatusUpdate = async (applicationId: number, newStatus: ApplicationStatus) => {
    const result = await updateApplicationStatus(applicationId, newStatus);
    if (result.success) {
      refetch();
      success("Application status updated successfully!");
    } else {
      showError(result.message || "Failed to update application status");
    }
  };

  const handleDownloadResume = (application: EmployerApplication) => {
    if (application.resumePath) {
      const resumeUrl = getApiUrl(application.resumePath);
      window.open(resumeUrl, "_blank");
    }
  };

  const EmployerApplicationCard: React.FC<{ application: EmployerApplication }> = ({ application }) => {
    const statusConfig = getStatusConfig(application.status);

    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          {/* Header with Applicant Info and Status */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {application.user.firstName} {application.user.lastName}
              </h3>
              <p className="text-sm text-gray-600">{application.user.email}</p>
              <p className="text-sm font-medium text-blue-600 mt-1">Applied for: {application.job.title}</p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Cover Letter:</h4>
            <p className="text-gray-700 text-sm leading-relaxed">{application.description}</p>
          </div>

          {/* Resume and Date Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            {application.originalFileName ? (
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="truncate max-w-48">{application.originalFileName}</span>
              </div>
            ) : (
              <span>No resume attached</span>
            )}

            {application.createdAt && (
              <span className="flex items-center space-x-1">
                <span>Applied {dateUtils.formatRelative(application.createdAt)}</span>
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex space-x-2">
              {application.resumePath && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadResume(application)}
                  leftIcon={<Download className="h-4 w-4" />}
                  className="text-sm"
                >
                  Download Resume
                </Button>
              )}
            </div>

            {application.status === "PENDING" && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(application.id, "REJECTED")}
                  leftIcon={<X className="h-4 w-4" />}
                  className="text-sm text-red-600 border-red-600 hover:bg-red-50"
                  disabled={updateLoading}
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(application.id, "ACCEPTED")}
                  leftIcon={<Check className="h-4 w-4" />}
                  className="text-sm text-green-600 border-green-600 hover:bg-green-50"
                  disabled={updateLoading}
                >
                  Accept
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
        </div>

        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
          <p className="text-gray-600 mt-1">Manage applications received for your job postings</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.accepted}</p>
              </div>
              <div className="h-3 w-3 bg-green-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
              </div>
              <div className="h-3 w-3 bg-red-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "ALL", label: "All Applications", count: statusCounts.total },
            { key: "PENDING", label: "Pending", count: statusCounts.pending },
            { key: "ACCEPTED", label: "Accepted", count: statusCounts.accepted },
            { key: "REJECTED", label: "Rejected", count: statusCounts.rejected },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key as ApplicationStatus | "ALL")}
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

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === "ALL"
              ? "No applications received yet"
              : `No ${statusFilter.toLowerCase()} applications`
            }
          </h3>
          <p className="text-gray-600">
            {statusFilter === "ALL"
              ? "When job seekers apply to your jobs, their applications will appear here."
              : `You don't have any ${statusFilter.toLowerCase()} applications at the moment.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <EmployerApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
};
