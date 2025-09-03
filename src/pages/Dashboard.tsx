import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../components/layout/Header";
import { JobsPage } from "./jobs/JobsPage";
import { MyJobsPage } from "./jobs/MyJobsPage";
import { ApplicationsPage } from "./applications/ApplicationsPage";
import { EmployerApplicationsPage } from "./applications/EmployerApplicationsPage";
import { AdminPage } from "./admin/AdminPage";
import { UserRole } from "../types";

type TabType = "jobs" | "my-jobs" | "applications" | "employer-applications" | "admin";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("jobs");

  // Set default tab based on user role
  useEffect(() => {
    if (user?.role === UserRole.EMPLOYER) {
      setActiveTab("my-jobs");
    } else if (user?.role === UserRole.ADMIN) {
      setActiveTab("admin");
    } else {
      setActiveTab("jobs");
    }
  }, [user]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "jobs":
        return <JobsPage />;
      case "my-jobs":
        return <MyJobsPage />;
      case "applications":
        return <ApplicationsPage />;
      case "employer-applications":
        return <EmployerApplicationsPage />;
      case "admin":
        return <AdminPage />;
      default:
        return <JobsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderActiveTab()}</main>
    </div>
  );
};
