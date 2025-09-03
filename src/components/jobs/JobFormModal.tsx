import React, { useState, useEffect } from "react";
import { Briefcase, DollarSign, MapPin, FileText } from "lucide-react";
import { Modal, Button, Input, TextArea, Select } from "../ui";
import { validateJobTitle, validateJobDescription, validateSalary } from "../../utils";
import type { Job, CreateJobData, UpdateJobData } from "../../types";

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobData | UpdateJobData) => Promise<{ success: boolean; message?: string }>;
  job?: Job | null; // If provided, we're editing; otherwise creating
  isLoading?: boolean;
}

export const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  job = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    salary: "",
    city: "",
    street: "",
    alley: "",
  });

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    salary?: string;
    city?: string;
    street?: string;
    alley?: string;
  }>({});

  const isEditMode = !!job;

  // Initialize form data when job prop changes
  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        salary: job.salary?.toString() || "",
        city: job.jobLocation?.city || "",
        street: job.jobLocation?.street || "",
        alley: job.jobLocation?.alley || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        salary: "",
        city: "",
        street: "",
        alley: "",
      });
    }
    setErrors({});
  }, [job]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Job title must be at least 3 characters";
    } else if (formData.title.trim().length > 100) {
      newErrors.title = "Job title must be less than 100 characters";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Job description must be at least 10 characters";
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = "Job description must be less than 2000 characters";
    }

    // Salary validation (optional)
    if (formData.salary && formData.salary.trim()) {
      const salaryNum = parseInt(formData.salary, 10);
      if (isNaN(salaryNum) || salaryNum < 0) {
        newErrors.salary = "Salary must be a valid positive number";
      } else if (salaryNum > 10000000) {
        newErrors.salary = "Salary must be less than 10,000,000";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: CreateJobData | UpdateJobData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      salary: formData.salary ? parseInt(formData.salary, 10) : undefined,
      city: formData.city.trim() || undefined,
      street: formData.street.trim() || undefined,
      alley: formData.alley.trim() || undefined,
    };

    try {
      const result = await onSubmit(submitData);
      if (result.success) {
        handleClose();
      }
    } catch (error) {
      console.error("Failed to submit job:", error);
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let value = e.target.value;

      // Special handling for salary field - only allow integers
      if (field === "salary" && value) {
        // Remove any non-digit characters
        value = value.replace(/[^\d]/g, "");
      }

      setFormData({ ...formData, [field]: value });
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        title: "",
        description: "",
        salary: "",
        city: "",
        street: "",
        alley: "",
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? `Edit Job: ${job?.title}` : "Post New Job"}
      size="lg"
      closeOnOverlayClick={!isLoading}
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title */}
        <Input
          label="Job Title"
          placeholder="e.g., Senior React Developer, Marketing Manager..."
          value={formData.title}
          onChange={handleInputChange("title")}
          error={errors.title}
          leftIcon={<Briefcase className="h-4 w-4" />}
          required
          fullWidth
          disabled={isLoading}
          helperText="Enter a clear, descriptive job title"
        />

        {/* Job Description */}
        <TextArea
          label="Job Description"
          placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity great..."
          value={formData.description}
          onChange={handleInputChange("description")}
          error={errors.description}
          rows={8}
          required
          fullWidth
          disabled={isLoading}
          helperText={`${formData.description.length}/2000 characters`}
        />

        {/* Salary */}
        <Input
          label="Salary (Optional)"
          type="text"
          placeholder="e.g., 50000"
          value={formData.salary}
          onChange={handleInputChange("salary")}
          error={errors.salary}
          leftIcon={<DollarSign className="h-4 w-4" />}
          fullWidth
          disabled={isLoading}
          helperText="Annual salary in USD (whole numbers only)"
        />

        {/* Location Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4" />
            <span>Job Location (Optional)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              placeholder="New York"
              value={formData.city}
              onChange={handleInputChange("city")}
              error={errors.city}
              fullWidth
              disabled={isLoading}
            />

            <Input
              label="Street"
              placeholder="5th Avenue"
              value={formData.street}
              onChange={handleInputChange("street")}
              error={errors.street}
              fullWidth
              disabled={isLoading}
            />

            <Input
              label="Alley"
              placeholder="Suite 100"
              value={formData.alley}
              onChange={handleInputChange("alley")}
              error={errors.alley}
              fullWidth
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update Job" : "Post Job"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
