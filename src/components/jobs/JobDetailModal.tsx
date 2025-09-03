import React from "react";
import { MapPin, DollarSign, Calendar, Briefcase, User, Building } from "lucide-react";
import { Modal, Button } from "../ui";
import { getStatusConfig, dateUtils } from "../../utils";
import type { Job } from "../../types";

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onApply?: (job: Job) => void;
  showApplyButton?: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  isOpen,
  onClose,
  job,
  onApply,
  showApplyButton = false,
}) => {
  if (!job) return null;

  const statusConfig = getStatusConfig(job.status);

  // Format salary
  const formattedSalary = job.salary
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(job.salary)
    : "Salary not specified";

  // Format location
  const formatLocation = () => {
    if (!job.jobLocation) return "Remote";
    const { city, street, alley } = job.jobLocation;
    return [city, street, alley].filter(Boolean).join(", ");
  };

  const handleApply = () => {
    if (onApply) {
      onApply(job);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Job Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
              <div className="flex items-center space-x-2 text-gray-600">
                <Building className="h-4 w-4" />
                <span>by {job.employerName}</span>
              </div>
            </div>
            <span
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${statusConfig.color}
              `}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Salary */}
            <div className="flex items-center space-x-2 text-gray-700">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="font-medium">{formattedSalary}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-gray-700">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{formatLocation()}</p>
              </div>
            </div>

            {/* Posted Date */}
            <div className="flex items-center space-x-2 text-gray-700">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Posted</p>
                <p className="font-medium">{dateUtils.formatRelative(job.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
            Job Description
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Job ID:</span>
              <span className="ml-2 font-medium">#{job.id}</span>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <span className="ml-2 font-medium">{dateUtils.format(job.updatedAt)}</span>
            </div>
            {job._count?.applications !== undefined && (
              <div>
                <span className="text-gray-500">Applications:</span>
                <span className="ml-2 font-medium">
                  {job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {showApplyButton && job.status === "ACTIVE" && (
            <Button onClick={handleApply}>
              Apply Now
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
