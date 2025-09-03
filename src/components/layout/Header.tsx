import React from "react";
import { User, Briefcase, FileText, Shield, LogOut, Home, Users } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui";
import { UserRole } from "../../types";
import { APP_NAME } from "../../constants";

type TabType = "jobs" | "my-jobs" | "applications" | "employer-applications" | "admin";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const navigationItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: UserRole[];
  }> = [
    {
      id: "jobs",
      label: "Jobs",
      icon: Briefcase,
      roles: [UserRole.ADMIN, UserRole.EMPLOYER, UserRole.SEEKER],
    },
    {
      id: "my-jobs",
      label: "My Jobs",
      icon: Briefcase,
      roles: [UserRole.EMPLOYER],
    },
    {
      id: "applications",
      label: "My Applications",
      icon: FileText,
      roles: [UserRole.SEEKER],
    },
    {
      id: "employer-applications",
      label: "Job Applications",
      icon: Users,
      roles: [UserRole.EMPLOYER],
    },
    {
      id: "admin",
      label: "Admin Panel",
      icon: Shield,
      roles: [UserRole.ADMIN],
    },
  ];

  const filteredNavItems = navigationItems.filter((item) => user?.role && item.roles.includes(user.role));

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return "Administrator";
      case UserRole.EMPLOYER:
        return "Employer";
      case UserRole.SEEKER:
        return "Job Seeker";
      default:
        return role;
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">{APP_NAME}</h1>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-4">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* User Role Badge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.role ? getRoleDisplayName(user.role) : "User"}
              </span>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
              className="text-gray-600 hover:text-gray-900"
            >
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <nav className="flex space-x-2 overflow-x-auto">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-200 ${
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
