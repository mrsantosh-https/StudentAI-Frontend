import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function MyResumes() {
  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const fetchResumes = async () => {
    const response = await api.get("/resumes");
    setResumes(response.data);
    
    
  };

  const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this resume?")) {
    return;
  }

  await api.delete(`/resumes/${id}`);

  toast.success("Resume deleted successfully");
  fetchResumes();
};

  useEffect(() => {
    fetchResumes();
  }, []);
  const filteredResumes = resumes
  .filter((resume) =>
    resume.title?.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => {
    if (sort === "latest") {
      return new Date(b.created_at) - new Date(a.created_at);
    }

    return new Date(a.created_at) - new Date(b.created_at);
  });
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          <h2 className="fw-bold">📋 My Resumes</h2>
          <div className="row mt-4 mb-3">
  <div className="col-md-8">
    <input
      type="text"
      className="form-control"
      placeholder="Search resume by title..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  <div className="col-md-4">
    <select
      className="form-select"
      value={sort}
      onChange={(e) => setSort(e.target.value)}
    >
      <option value="latest">Latest First</option>
      <option value="oldest">Oldest First</option>
    </select>
  </div>
</div>
          <p className="text-muted">View your saved resumes.</p>

          <div className="row mt-4">
            {filteredResumes.map((resume) => (
              <div className="col-lg-4 col-md-6 mb-4" key={resume.id}>
                <div className="card border-0 shadow-sm p-4 h-100">
                  <h5>{resume.title}</h5>
                  <p className="text-muted">{resume.email}</p>
                  <p>{resume.skills}</p>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/view-resume/${resume.id}`)}
                    >
                    View
                    </button>
                    <button
                    className="btn btn-warning btn-sm mt-2"
                    onClick={() => navigate(`/edit-resume/${resume.id}`)}
                    >
                    ✏️ Edit
                    </button>
                  <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => handleDelete(resume.id)}
                    >
                    Delete
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}