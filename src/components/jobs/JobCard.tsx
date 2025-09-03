import React from "react";
import { MapPin, DollarSign, Calendar, Eye, Edit, Trash2, Users } from "lucide-react";
import { Card, CardContent, Button } from "../ui";
import { getStatusConfig, dateUtils } from "../../utils";
import type { Job, UserRole } from "../../types";

interface JobCardProps {
  job: Job;
  onApply?: (job: Job) => void;
  onEdit?: (job: Job) => void;
  onDelete?: (jobId: number) => void;
  onView?: (job: Job) => void;
  showActions?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply, onEdit, onDelete, onView, showActions = false }) => {
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

  return (
    <Card hover className="h-full">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
            <p className="text-sm text-gray-600 mt-1">by {job.employerName}</p>
          </div>

          {/* Status Badge */}
          <span
            className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${statusConfig.color}
          `}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-1">{job.description}</p>

        {/* Job Details */}
        <div className="space-y-2 mb-4">
          {/* Salary */}
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-medium">{formattedSalary}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-blue-600" />
            <span>{formatLocation()}</span>
          </div>

          {/* Posted Date */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-purple-600" />
            <span>Posted {dateUtils.formatRelative(job.createdAt)}</span>
          </div>

          {/* Application Count (if available) */}
          {job._count?.applications !== undefined && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 text-orange-600" />
              <span>
                {job._count.applications} application{job._count.applications !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {/* View Details */}
            {onView && (
              <Button variant="ghost" size="sm" onClick={() => onView(job)} leftIcon={<Eye className="h-4 w-4" />}>
                View
              </Button>
            )}

            {/* Edit Job (for employers/admins) */}
            {showActions && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(job)}
                leftIcon={<Edit className="h-4 w-4" />}
                className="text-blue-600 hover:text-blue-700"
              >
                Edit
              </Button>
            )}

            {/* Delete Job (for employers/admins) */}
            {showActions && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(job.id)}
                leftIcon={<Trash2 className="h-4 w-4" />}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            )}
          </div>

          {/* Apply Button */}
          {onApply && (
            <Button onClick={() => onApply(job)} size="sm" className="ml-auto">
              Apply Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
