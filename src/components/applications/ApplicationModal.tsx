import React, { useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Modal, Button, TextArea } from "../ui";
import { validateFile, formatFileSize } from "../../utils";
import type { Job } from "../../types";

interface ApplicationModalProps {
  isOpen: boolean;
  job: Job;
  onClose: () => void;
  onSubmit: (description: string, resume?: File) => Promise<void>;
  isLoading?: boolean;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  job,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [description, setDescription] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    description?: string;
    resume?: string;
  }>({});
  const [isDragOver, setIsDragOver] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!description.trim()) {
      newErrors.description = "Please tell us why you're interested in this position";
    } else if (description.trim().length < 10) {
      newErrors.description = "Please provide at least 10 characters";
    } else if (description.trim().length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    if (resume) {
      const fileValidation = validateFile(resume, "RESUME");
      if (!fileValidation.isValid) {
        newErrors.resume = fileValidation.message;
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

    try {
      await onSubmit(description.trim(), resume || undefined);
    } catch (error) {
      console.error("Failed to submit application:", error);
    }
  };

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file, "RESUME");
    if (!validation.isValid) {
      setErrors((prev) => ({ ...prev, resume: validation.message }));
      return;
    }

    setResume(file);
    setErrors((prev) => ({ ...prev, resume: undefined }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveFile = () => {
    setResume(null);
    setErrors((prev) => ({ ...prev, resume: undefined }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setDescription("");
      setResume(null);
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Apply for ${job.title}`}
      size="lg"
      closeOnOverlayClick={!isLoading}
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">{job.title}</h3>
          <p className="text-sm text-gray-600 mb-1">Company: {job.employerName}</p>
          {job.salary && (
            <p className="text-sm text-gray-600">
              Salary:{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(job.salary)}
            </p>
          )}
        </div>

        {/* Cover Letter / Description */}
        <div>
          <TextArea
            label="Why are you interested in this position?"
            placeholder="Tell us about your experience, skills, and why you're a great fit for this role..."
            value={description}
            onChange={handleDescriptionChange}
            error={errors.description}
            rows={6}
            required
            fullWidth
            disabled={isLoading}
            helperText={`${description.length}/1000 characters`}
          />
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resume (Optional)</label>

          {!resume ? (
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
                ${errors.resume ? "border-red-300 bg-red-50" : ""}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />

              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{resume.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(resume.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isLoading}
                leftIcon={<X className="h-4 w-4" />}
              >
                Remove
              </Button>
            </div>
          )}

          {errors.resume && <p className="text-sm text-red-600 mt-1">{errors.resume}</p>}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
