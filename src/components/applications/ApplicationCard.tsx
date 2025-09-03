import React from "react";
import { FileText, Calendar, Eye, Download } from "lucide-react";
import { Card, CardContent, Button } from "../ui";
import { getStatusConfig, dateUtils } from "../../utils";
import { ENV } from "../../constants/env";
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

interface ApplicationCardProps {
  application: ApplicationData;
  onView?: (application: ApplicationData) => void;
  onDownloadResume?: (application: ApplicationData) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onView, onDownloadResume }) => {
  const statusConfig = getStatusConfig(application.status);

  const handleDownloadResume = () => {
    if (application.resumePath && onDownloadResume) {
      onDownloadResume(application);
    } else if (application.resumePath) {
      // Fallback to direct download
      const resumeUrl = `${ENV.API_BASE_URL}/${application.resumePath}`;
      window.open(resumeUrl, "_blank");
    }
  };

  return (
    <Card hover className="h-full">
      <CardContent className="p-4">
        {/* Header with Job Title and Status */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{application.job.title}</h3>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{application.description}</p>

        {/* Resume and Date in one row */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          {application.originalFileName ? (
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="truncate max-w-32">{application.originalFileName}</span>
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
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">ID: #{application.id}</span>
          <div className="flex space-x-2">
            {application.resumePath && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadResume}
                leftIcon={<Download className="h-3 w-3" />}
                className="text-xs px-2 py-1 h-6"
              >
                Resume
              </Button>
            )}
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(application)}
                leftIcon={<Eye className="h-3 w-3" />}
                className="text-xs px-2 py-1 h-6"
              >
                Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
