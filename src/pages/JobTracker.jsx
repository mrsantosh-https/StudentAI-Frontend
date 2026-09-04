import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "../styles/jobTracker.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "Applied",
    location: "",
    job_link: "",
    applied_date: "",
    notes: "",
  });

  /*
  |--------------------------------------------------------------------------
  | Fetch Jobs
  |--------------------------------------------------------------------------
  */

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs");

      const data = response.data;

      if (Array.isArray(data)) {
        setJobs(data);
      } else if (Array.isArray(data?.jobs)) {
        setJobs(data.jobs);
      } else if (Array.isArray(data?.data)) {
        setJobs(data.data);
      } else {
        setJobs([]);
        console.warn("Unexpected jobs API response:", data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);

      setJobs([]);

      if (error.response?.status === 401) {
        toast.error("Please login again.");
      } else {
        toast.error("Failed to load jobs");
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      try {
        const response = await api.get("/jobs");

        if (cancelled) return;

        const data = response.data;

        if (Array.isArray(data)) {
          setJobs(data);
        } else if (Array.isArray(data?.jobs)) {
          setJobs(data.jobs);
        } else if (Array.isArray(data?.data)) {
          setJobs(data.data);
        } else {
          setJobs([]);
          console.warn("Unexpected jobs API response:", data);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to fetch jobs:", error);
        setJobs([]);

        if (error.response?.status === 401) {
          toast.error("Please login again.");
        } else {
          toast.error("Failed to load jobs");
        }
      }
    };

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Reset Form
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {
    setFormData({
      company: "",
      role: "",
      status: "Applied",
      location: "",
      job_link: "",
      applied_date: "",
      notes: "",
    });

    setEditId(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Form Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Add / Update Job
  |--------------------------------------------------------------------------
  */

  const handleAddJob = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/jobs/${editId}`, formData);

        toast.success("Job updated successfully");
      } else {
        await api.post("/jobs", formData);

        toast.success("Job added successfully");
      }

      resetForm();
      setShowForm(false);

      await fetchJobs();
    } catch (error) {
      console.error("Save job error:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save job";

      toast.error(message);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Edit Job
  |--------------------------------------------------------------------------
  */

  const handleEdit = (job) => {
    setEditId(job.id);
    setShowForm(true);

    setFormData({
      company: job.company || "",
      role: job.role || "",
      status: job.status || "Applied",
      location: job.location || "",
      job_link: job.job_link || "",
      applied_date: job.applied_date || "",
      notes: job.notes || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Job
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Delete Job?",
        text: "This job application will be deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      await api.delete(`/jobs/${id}`);

      toast.success("Job deleted successfully");

      await fetchJobs();
    } catch (error) {
      console.error("Delete job error:", error);

      const message =
        error.response?.data?.message ||
        "Failed to delete job";

      toast.error(message);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Status Badge
  |--------------------------------------------------------------------------
  */

  const getStatusClass = (status) => {
    switch (status) {
      case "Applied":
        return "bg-primary";

      case "Interview":
        return "bg-warning text-dark";

      case "Offer":
        return "bg-success";

      case "Rejected":
        return "bg-danger";

      default:
        return "bg-secondary";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Search + Filter
  |--------------------------------------------------------------------------
  */

  const filteredJobs = jobs.filter((job) => {
    const company = String(job?.company || "").toLowerCase();
    const role = String(job?.role || "").toLowerCase();
    const searchText = search.toLowerCase();

    const matchesSearch =
      company.includes(searchText) ||
      role.includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      job?.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const totalJobs = jobs.length;

  const appliedJobs = jobs.filter(
    (job) => job?.status === "Applied"
  ).length;

  const interviewJobs = jobs.filter(
    (job) => job?.status === "Interview"
  ).length;

  const offerJobs = jobs.filter(
    (job) => job?.status === "Offer"
  ).length;

  const rejectedJobs = jobs.filter(
    (job) => job?.status === "Rejected"
  ).length;

  /*
  |--------------------------------------------------------------------------
  | Rates
  |--------------------------------------------------------------------------
  */

  const interviewRate =
    totalJobs > 0
      ? Math.round((interviewJobs / totalJobs) * 100)
      : 0;

  const offerRate =
    totalJobs > 0
      ? Math.round((offerJobs / totalJobs) * 100)
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Recent Jobs
  |--------------------------------------------------------------------------
  */

  const recentJobs = jobs.slice(0, 5);

  /*
  |--------------------------------------------------------------------------
  | Chart
  |--------------------------------------------------------------------------
  */

  const chartData = [
    {
      name: "Applied",
      value: appliedJobs,
    },
    {
      name: "Interview",
      value: interviewJobs,
    },
    {
      name: "Offer",
      value: offerJobs,
    },
    {
      name: "Rejected",
      value: rejectedJobs,
    },
  ];

  const COLORS = [
    "#2563eb",
    "#f59e0b",
    "#16a34a",
    "#ef4444",
  ];

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">

          {/* PAGE HEADER */}
          <h2 className="fw-bold">
            💼 Job Tracker
          </h2>

          <p className="text-muted">
            Track your job applications.
          </p>

          {/* STAT CARDS */}
          <div className="row g-3 mt-3 mb-4">

            <div className="col-lg-6 col-md-6">
              <div className="job-stat-card total-card">
                <span className="icon">💼</span>

                <h6>Total Jobs</h6>

                <h2>{totalJobs}</h2>
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              <div className="job-stat-card applied-card">
                <span className="icon">📩</span>

                <h6>Applied</h6>

                <h2>{appliedJobs}</h2>
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              <div className="job-stat-card interview-card">
                <span className="icon">🎤</span>

                <h6>Interview</h6>

                <h2>{interviewJobs}</h2>
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              <div className="job-stat-card offer-card">
                <span className="icon">🏆</span>

                <h6>Offers</h6>

                <h2>{offerJobs}</h2>
              </div>
            </div>

          </div>

          {/* ANALYTICS */}
          <div className="card border-0 shadow p-4 mb-4">

            <h4 className="fw-bold mb-3">
              📊 Job Status Analytics
            </h4>

            <div
              style={{
                width: "100%",
                height: "300px",
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[index]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* RATES */}
          <div className="row g-3 mb-4">

            <div className="col-md-6">
              <div className="card border-0 shadow p-4">

                <h6 className="text-muted">
                  🎤 Interview Rate
                </h6>

                <h2>
                  {interviewRate}%
                </h2>

                <div className="progress mt-2">

                  <div
                    className="progress-bar"
                    style={{
                      width: `${interviewRate}%`,
                    }}
                  />

                </div>

              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow p-4">

                <h6 className="text-muted">
                  🏆 Offer Rate
                </h6>

                <h2>
                  {offerRate}%
                </h2>

                <div className="progress mt-2">

                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${offerRate}%`,
                    }}
                  />

                </div>

              </div>
            </div>

          </div>

          {/* RECENT APPLICATIONS */}
          <div className="card border-0 shadow p-4 mb-4">

            <h4 className="fw-bold mb-3">
              🕒 Recent Applications
            </h4>

            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (

                <div
                  className="activity-item"
                  key={job.id}
                >
                  <span>💼</span>

                  <div>

                    <h6>
                      {job.company || "Unknown Company"}{" "}
                      -{" "}
                      {job.role || "Unknown Role"}
                    </h6>

                    <p>
                      {job.status || "No status"} •{" "}
                      {job.applied_date || "No date"}
                    </p>

                  </div>
                </div>

              ))
            ) : (
              <p className="text-muted">
                No recent applications yet.
              </p>
            )}

          </div>

          {/* SEARCH + FILTER */}
          <div className="card border-0 shadow p-4 mb-4">

            <div className="row g-3">

              <div className="col-md-8">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by company or role..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

              <div className="col-md-4">

                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Applied">
                    Applied
                  </option>

                  <option value="Interview">
                    Interview
                  </option>

                  <option value="Offer">
                    Offer
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>
                </select>

              </div>

            </div>

          </div>

          {/* ADD JOB BUTTON */}
          <div className="d-flex justify-content-end mb-3">

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (showForm) {
                  resetForm();
                }

                setShowForm((previous) => !previous);
              }}
            >
              {showForm
                ? "❌ Close Form"
                : "➕ Add New Job"}
            </button>

          </div>

          {/* JOB FORM */}
          {showForm && (
            <div className="card border-0 shadow p-4 mb-4">

              <h4>
                {editId
                  ? "Edit Job Application"
                  : "Add Job Application"}
              </h4>

              <form
                onSubmit={handleAddJob}
                className="row g-3 mt-2"
              >

                {/* COMPANY */}
                <div className="col-md-6">

                  <input
                    type="text"
                    name="company"
                    className="form-control"
                    placeholder="Company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* ROLE */}
                <div className="col-md-6">

                  <input
                    type="text"
                    name="role"
                    className="form-control"
                    placeholder="Role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* STATUS */}
                <div className="col-md-4">

                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Applied">
                      Applied
                    </option>

                    <option value="Interview">
                      Interview
                    </option>

                    <option value="Offer">
                      Offer
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>
                  </select>

                </div>

                {/* LOCATION */}
                <div className="col-md-4">

                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                  />

                </div>

                {/* DATE */}
                <div className="col-md-4">

                  <input
                    type="date"
                    name="applied_date"
                    className="form-control"
                    value={formData.applied_date}
                    onChange={handleChange}
                  />

                </div>

                {/* JOB LINK */}
                <div className="col-md-12">

                  <input
                    type="url"
                    name="job_link"
                    className="form-control"
                    placeholder="Job Link"
                    value={formData.job_link}
                    onChange={handleChange}
                  />

                </div>

                {/* NOTES */}
                <div className="col-md-12">

                  <textarea
                    name="notes"
                    className="form-control"
                    rows="3"
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={handleChange}
                  />

                </div>

                {/* SUBMIT */}
                <div className="col-md-12">

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editId
                      ? "Update Job"
                      : "➕ Add Job"}
                  </button>

                </div>

              </form>

            </div>
          )}

          {/* APPLICATION TABLE */}
          <div className="card border-0 shadow p-4 mt-4">

            <h4>
              My Applications
            </h4>

            <div className="table-responsive mt-3">

              <table className="table align-middle">

                <thead>

                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredJobs.map((job) => (

                    <tr key={job.id}>

                      <td>
                        {job.company || "-"}
                      </td>

                      <td>
                        {job.role || "-"}
                      </td>

                      <td>

                        <span
                          className={`badge ${getStatusClass(
                            job.status
                          )}`}
                        >
                          {job.status || "Unknown"}
                        </span>

                      </td>

                      <td>
                        {job.location || "-"}
                      </td>

                      <td>
                        {job.applied_date || "-"}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="btn btn-sm btn-warning me-2"
                          onClick={() =>
                            handleEdit(job)
                          }
                          title="Edit Job"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDelete(job.id)
                          }
                          title="Delete Job"
                        >
                          🗑️
                        </button>

                      </td>

                    </tr>

                  ))}

                  {filteredJobs.length === 0 && (

                    <tr>

                      <td
                        colSpan="6"
                        className="text-center text-muted"
                      >
                        No job applications found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}