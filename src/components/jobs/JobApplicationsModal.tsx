import React, { useState, useEffect } from "react";
import { Users, Download, Check, X, Eye, Calendar, FileText } from "lucide-react";
import { Modal, Button, Card, CardContent, useToast } from "../ui";
import { useJobApplications, useApplicationMutations } from "../../hooks/useApplications";
import { getStatusConfig, dateUtils } from "../../utils";
import { getApiUrl } from "../../constants/env";
import type { Job, ApplicationStatus } from "../../types";

interface JobApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

interface ApplicationData {
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
  applicantName?: string;
  applicantEmail?: string;
}

export const JobApplicationsModal: React.FC<JobApplicationsModalProps> = ({ isOpen, onClose, job }) => {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const { applications, loading, error, refetch } = useJobApplications(job?.id || null);
  const { updateApplicationStatus, loading: updateLoading } = useApplicationMutations();
  const { success, error: showError } = useToast();

  // Transform and filter applications
  const transformedApplications: ApplicationData[] = (applications || []).map((app: any) => ({
    id: app.id,
    description: app.description,
    resumePath: app.resumePath,
    resumeType: app.resumeType,
    originalFileName: app.originalFileName,
    status: app.status,
    userId: app.userId,
    jobId: app.jobId,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    applicantName:
      app.user?.firstName && app.user?.lastName
        ? `${app.user.firstName} ${app.user.lastName}`
        : app.applicantName || "Unknown Applicant",
    applicantEmail: app.user?.email || app.applicantEmail || "No email provided",
  }));

  const filteredApplications =
    statusFilter === "ALL"
      ? transformedApplications
      : transformedApplications.filter((app) => app.status === statusFilter);

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

  const handleDownloadResume = (application: ApplicationData) => {
    if (application.resumePath) {
      const resumeUrl = getApiUrl(application.resumePath);
      window.open(resumeUrl, "_blank");
    }
  };

  const ApplicationCard: React.FC<{ application: ApplicationData }> = ({ application }) => {
    const statusConfig = getStatusConfig(application.status);

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{application.applicantName}</h4>
              <p className="text-sm text-gray-600">{application.applicantEmail}</p>
            </div>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm mb-3 line-clamp-3">{application.description}</p>

          {/* Resume and Date */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            {application.originalFileName ? (
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="truncate max-w-40">{application.originalFileName}</span>
              </div>
            ) : (
              <span>No resume attached</span>
            )}

            {application.createdAt && (
              <span className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{dateUtils.formatRelative(application.createdAt)}</span>
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex space-x-2">
              {application.resumePath && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadResume(application)}
                  leftIcon={<Download className="h-3 w-3" />}
                  className="text-xs px-2 py-1 h-7"
                >
                  Resume
                </Button>
              )}
            </div>

            {application.status === "PENDING" && (
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatusUpdate(application.id, "REJECTED")}
                  leftIcon={<X className="h-3 w-3" />}
                  className="text-xs px-2 py-1 h-7 text-red-600 hover:text-red-700"
                  disabled={updateLoading}
                >
                  Reject
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatusUpdate(application.id, "ACCEPTED")}
                  leftIcon={<Check className="h-3 w-3" />}
                  className="text-xs px-2 py-1 h-7 text-green-600 hover:text-green-700"
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

  if (!job) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Applications for ${job.title}`} size="xl">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts.accepted}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4">
            {[
              { key: "ALL", label: "All", count: statusCounts.total },
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
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === "ALL" ? "No applications yet" : `No ${statusFilter.toLowerCase()} applications`}
              </h3>
              <p className="text-gray-600">
                {statusFilter === "ALL"
                  ? "Job seekers haven't applied to this job yet."
                  : `No ${statusFilter.toLowerCase()} applications for this job.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
