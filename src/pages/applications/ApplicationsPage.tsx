import React, { useEffect, useState } from "react";
import { FileText, AlertCircle, RefreshCw } from "lucide-react";
import { ApplicationCard } from "../../components/applications/ApplicationCard";
import { Button } from "../../components/ui";
import { useUserApplications } from "../../hooks/useApplications";
import { getApiUrl } from "../../constants/env";
import type { ApplicationStatus } from "../../types";

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
  job: {
    id: number;
    title: string;
  };
}

export const ApplicationsPage: React.FC = () => {
  const { applications, loading, error, refetch } = useUserApplications();
  const [filteredApplications, setFilteredApplications] = useState<ApplicationData[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");

  // Transform API data to match our component interface
  const transformApplications = (apiApplications: unknown[]): ApplicationData[] => {
    return (
      apiApplications?.map((appData) => {
        const app = appData as any; // Type assertion for API data
        return {
          id: app.id,
          description: app.description,
          resumePath: app.resumePath,
          resumeType: app.resumeType,
          originalFileName: app.originalFileName,
          status: app.status as ApplicationStatus,
          userId: app.userId,
          jobId: app.jobId,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          job: {
            id: app.job?.id || app.jobId,
            title: app.job?.title || "Unknown Job",
          },
        };
      }) || []
    );
  };

  useEffect(() => {
    if (applications) {
      const transformed = transformApplications(applications);
      setFilteredApplications(
        statusFilter === "ALL" ? transformed : transformed.filter((app) => app.status === statusFilter),
      );
    }
  }, [applications, statusFilter]);

  const handleViewApplication = (application: ApplicationData) => {
    // For now, just log - could implement modal or navigation
    console.log("Viewing application:", application);
  };

  const handleDownloadResume = (application: ApplicationData) => {
    if (application.resumePath) {
      const resumeUrl = getApiUrl(application.resumePath);
      window.open(resumeUrl, "_blank");
    }
  };

  const getStatusCounts = () => {
    const transformed = transformApplications(applications || []);
    return {
      total: transformed.length,
      pending: transformed.filter((app) => app.status === "PENDING").length,
      accepted: transformed.filter((app) => app.status === "ACCEPTED").length,
      rejected: transformed.filter((app) => app.status === "REJECTED").length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        </div>

        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
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
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <Button onClick={refetch} variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.accepted}</p>
            </div>
            <div className="h-3 w-3 bg-green-400 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
            </div>
            <div className="h-3 w-3 bg-red-400 rounded-full"></div>
          </div>
        </div>
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
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === "ALL" ? "No applications yet" : `No ${statusFilter.toLowerCase()} applications`}
          </h3>
          <p className="text-gray-600">
            {statusFilter === "ALL"
              ? "Start applying to jobs to see your applications here."
              : `You don't have any ${statusFilter.toLowerCase()} applications at the moment.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onView={handleViewApplication}
              onDownloadResume={handleDownloadResume}
            />
          ))}
        </div>
      )}
    </div>
  );
};
