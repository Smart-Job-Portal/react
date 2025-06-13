import React, { useState, useEffect, createContext, useContext } from "react";
import { User, Briefcase, FileText, Shield, LogOut, Plus, Edit, Trash2, Eye, Check, X, Send } from "lucide-react";

const API_BASE_URL = "http://localhost:3000";

const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          id: payload.sub,
          role: payload.role,
          exp: payload.exp,
        });
      } catch (error) {
        localStorage.removeItem("token");
        setToken(null);
      }
    }
  }, [token]);

  const login = (newToken) => {
    console.log("[+] token : " + newToken);
    localStorage.setItem("token", newToken);
    setToken(newToken);
    try {
      const payload = JSON.parse(atob(newToken.split(".")[1]));
      setUser({
        id: payload.sub,
        role: payload.role,
        exp: payload.exp,
      });
    } catch (error) {
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    let headers = options.headers || {};

    // If the body is FormData, don't set Content-Type (browser will do it)
    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
      headers = {
        "Content-Type": "application/json",
        ...headers,
      };
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  auth: {
    register: (data) =>
      api.request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data),
      }),
    login: (data) =>
      api.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data),
      }),
    forgotPassword: (email) =>
      api.request("/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email }),
      }),
    resendVerification: (email) =>
      api.request("/auth/resend-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email }),
      }),
  },

  jobs: {
    getAll: () => api.request("/jobs"),
    getById: (id) => api.request(`/jobs/${id}`),
    getUserJobs: () => api.request("/jobs/my-jobs"),
    create: (data) =>
      api.request("/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data),
      }),
    update: (id, data) =>
      api.request(`/jobs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id) => api.request(`/jobs/${id}`, { method: "DELETE" }),
    getAllAdmin: (status) => api.request(`/admin/jobs?status=${status}`),
    updateAdmin: (id, data) =>
      api.request(`/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data),
      }),
  },

  applications: {
    create: (jobId, data) => {
      const formData = new FormData();
      formData.append("description", data.description);
      return api.request(`/applications/jobs/${jobId}`, {
        method: "POST",
        headers: {},
        body: formData,
      });
    },
    getAll: () => api.request("/applications"),
    getForJob: (jobId) => api.request(`/applications/jobs/${jobId}`),
    getById: (id) => api.request(`/applications/${id}`),
    getUserApplications: () => api.request("/applications/my-applications"),
    update: (id, data) =>
      api.request(`/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data),
      }),
  },
};

const LoginForm = ({ onToggle }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.auth.login(formData);
      login(response.accessToken);
    } catch (error) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign In</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => onToggle("register")} className="text-blue-600 hover:text-blue-700 text-sm">
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

const RegisterForm = ({ onToggle }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "SEEKER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.auth.register(formData);
      setSuccess(true);
    } catch (error) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">Please check your email to verify your account.</p>
          <button
            onClick={() => onToggle("login")}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign Up</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="SEEKER">Job Seeker</option>
              <option value="EMPLOYER">Employer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => onToggle("login")} className="text-green-600 hover:text-green-700 text-sm">
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">Job Portal</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab("jobs")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "jobs" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Briefcase className="w-4 h-4 inline mr-1" />
                Jobs
              </button>
              {user?.role === "SEEKER" && (
                <button
                  onClick={() => setActiveTab("applications")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "applications" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-1" />
                  My Applications
                </button>
              )}
              {user?.role === "EMPLOYER" && (
                <button
                  onClick={() => setActiveTab("my-jobs")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "my-jobs" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  My Jobs
                </button>
              )}
              {user?.role === "ADMIN" && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "admin" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-1" />
                  Admin
                </button>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              <User className="w-4 h-4 inline mr-1" />
              {user?.role}
            </span>
            <button onClick={logout} className="text-gray-500 hover:text-gray-700">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const JobCard = ({ job, onApply, showActions, onEdit, onDelete, onView }) => {
  const { title, description, salary, status, jobLocation } = job;

  // Format salary with commas
  const formattedSalary = salary?.toLocaleString() + " تومان";

  // Compose location string
  const location = jobLocation ? `${jobLocation.city}، ${jobLocation.street}، ${jobLocation.alley}` : "مکان نامشخص";

  // Status badge color
  const statusColor =
    status === "ACTIVE"
      ? "bg-green-100 text-green-800"
      : status === "PENDING"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-gray-100 text-gray-800";

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col gap-3"
      style={{ border: "1px solid #e0e0e0" }}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <span className={`px-3 py-1 text-xs rounded-full font-semibold ${statusColor}`}>
          {status === "ACTIVE" ? "فعال" : status === "PENDING" ? "در انتظار" : "غیرفعال"}
        </span>
      </div>
      <div className="text-gray-700 text-base mb-2">{description}</div>
      <div className="flex justify-between items-center mt-2">
        <span className="font-medium text-blue-700 text-base">حقوق: {formattedSalary}</span>
        <span className="text-gray-500 text-sm flex items-center gap-1">
          <span role="img" aria-label="location">
            📍
          </span>
          {location}
        </span>
      </div>
      <div className="flex justify-end items-center gap-2 mt-2">
        {onView && (
          <button onClick={() => onView(job)} className="text-blue-600 hover:text-blue-700">
            <Eye className="w-4 h-4" />
          </button>
        )}
        {showActions && (
          <>
            <button onClick={() => onEdit(job)} className="text-blue-600 hover:text-blue-700">
              <Edit className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(job.id)} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
        {onApply && (
          <button
            onClick={() => onApply(job)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
};

const JobsTab = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationText, setApplicationText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.jobs.getAll();
      setJobs(data.data);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const formData = new FormData();
      formData.append("description", applicationText);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }
      await api.request(`/applications/jobs/${selectedJob.id}`, {
        method: "POST",
        body: formData,
      });
      setShowApplicationModal(false);
      setApplicationText("");
      setResumeFile(null);
      alert("Application submitted successfully!");
    } catch (error) {
      if (error.message && error.message.includes("409")) {
        alert("You have already applied to this job.");
      } else {
        alert("Failed to submit application");
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Available Jobs</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onApply={
              user?.role === "SEEKER"
                ? (job) => {
                    setSelectedJob(job);
                    setShowApplicationModal(true);
                  }
                : null
            }
          />
        ))}
      </div>

      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Apply for {selectedJob?.title}</h3>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              placeholder="Tell us why you're a good fit for this position..."
              value={applicationText}
              onChange={(e) => setApplicationText(e.target.value)}
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Resume (PDF, JPG, JPEG, PNG):
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="block w-full text-sm text-gray-700"
              />
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button onClick={handleApply} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MyJobsTab = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [selectedJobApplications, setSelectedJobApplications] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.jobs.getUserJobs();
      setJobs(data.data);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobApplications = async (jobId) => {
    try {
      const data = await api.applications.getForJob(jobId);
      setApplications(data.data);
      setSelectedJobApplications(jobId);
    } catch (error) {
      console.error("Failed to load applications:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await api.jobs.update(editingJob.id, formData);
      } else {
        await api.jobs.create(formData);
      }
      setShowCreateModal(false);
      setEditingJob(null);
      setFormData({ title: "", description: "" });
      loadJobs();
    } catch (error) {
      alert("Failed to save job");
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({ title: job.title, description: job.description });
    setShowCreateModal(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await api.jobs.delete(jobId);
        loadJobs();
      } catch (error) {
        alert("Failed to delete job");
      }
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await api.applications.update(applicationId, { status });
      loadJobApplications(selectedJobApplications);
    } catch (error) {
      alert("Failed to update application status");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading your jobs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Jobs</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            showActions={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={(job) => loadJobApplications(job.id)}
          />
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingJob ? "Edit Job" : "Create New Job"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingJob(null);
                    setFormData({ title: "", description: "" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  {editingJob ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedJobApplications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Job Applications</h3>
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{app.applicantName}</h4>
                      <p className="text-sm text-gray-600">{app.applicantEmail}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        app.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : app.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{app.description}</p>
                  {app.status === "PENDING" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateApplicationStatus(app.id, "ACCEPTED")}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 inline mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app.id, "REJECTED")}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        <X className="w-4 h-4 inline mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedJobApplications(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ApplicationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.applications.getUserApplications();
      setApplications(data.data || []);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading your applications...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>

      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{app.job?.title || "Unknown Job"}</h3>
              </div>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  app.status === "ACCEPTED"
                    ? "bg-green-100 text-green-800"
                    : app.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {app.status}
              </span>
            </div>
            <p className="text-gray-700">{app.description}</p>
            {app.originalFileName && <div className="mt-2 text-sm text-gray-500">Resume: {app.originalFileName}</div>}
          </div>
        ))}
        {applications.length === 0 && (
          <div className="text-center py-8 text-gray-500">No applications found. Start applying to jobs!</div>
        )}
      </div>
    </div>
  );
};

const AdminTab = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState("jobs");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  useEffect(() => {
    if (activeAdminTab === "jobs") {
      loadAdminJobs();
    } else {
      loadAllApplications();
    }
  }, [activeAdminTab, statusFilter]);

  const loadAdminJobs = async () => {
    try {
      const data = await api.jobs.getAllAdmin(statusFilter);
      setJobs(data.data);
    } catch (error) {
      console.error("Failed to load admin jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllApplications = async () => {
    try {
      const data = await api.applications.getAll();
      setApplications(data);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId, status) => {
    try {
      await api.jobs.updateAdmin(jobId, { status });
      loadAdminJobs();
    } catch (error) {
      alert("Failed to update job status");
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await api.applications.update(applicationId, { status });
      loadAllApplications();
    } catch (error) {
      alert("Failed to update application status");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading admin data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveAdminTab("jobs")}
            className={`px-4 py-2 rounded-md ${
              activeAdminTab === "jobs" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Jobs Management
          </button>
          <button
            onClick={() => setActiveAdminTab("applications")}
            className={`px-4 py-2 rounded-md ${
              activeAdminTab === "applications"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Applications
          </button>
        </div>
      </div>

      {activeAdminTab === "jobs" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      job.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : job.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">By: {job.employerName}</span>
                  <div className="flex space-x-2">
                    {job.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => updateJobStatus(job.id, "ACTIVE")}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                        >
                          <Check className="w-3 h-3 inline mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => updateJobStatus(job.id, "INACTIVE")}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                        >
                          <X className="w-3 h-3 inline mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === "applications" && (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{app.jobTitle}</h3>
                  <p className="text-sm text-gray-600">
                    Applicant: {app.applicantName} ({app.applicantEmail})
                  </p>
                  <p className="text-sm text-gray-600">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    app.status === "ACCEPTED"
                      ? "bg-green-100 text-green-800"
                      : app.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {app.status}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{app.description}</p>
              {app.status === "PENDING" && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateApplicationStatus(app.id, "ACCEPTED")}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 inline mr-1" />
                    Accept
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(app.id, "REJECTED")}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {applications.length === 0 && <div className="text-center py-8 text-gray-500">No applications found.</div>}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "EMPLOYER") {
      setActiveTab("my-jobs");
    } else if (user?.role === "ADMIN") {
      setActiveTab("admin");
    }
  }, [user]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "jobs":
        return <JobsTab />;
      case "my-jobs":
        return <MyJobsTab />;
      case "applications":
        return <ApplicationsTab />;
      case "admin":
        return <AdminTab />;
      default:
        return <JobsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderActiveTab()}</main>
    </div>
  );
};

const App = () => {
  const [authMode, setAuthMode] = useState("login");
  const { user } = useAuth();

  if (!user) {
    return authMode === "login" ? <LoginForm onToggle={setAuthMode} /> : <RegisterForm onToggle={setAuthMode} />;
  }

  return <Dashboard />;
};

export default function JobPortal() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
