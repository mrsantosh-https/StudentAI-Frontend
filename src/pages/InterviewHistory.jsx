import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "../styles/interviewhistory.css";

export default function InterviewHistory() {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ==============================
     FETCH INTERVIEW HISTORY
  ============================== */

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          "/interview-history"
        );

        console.log(
          "Interview history:",
          response.data
        );

        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        setHistories(data);
      } catch (error) {
        console.error(
          "Fetch interview history error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Interview history load failed"
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  /* ==============================
     DELETE INTERVIEW
  ============================== */

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Interview?",
      text: "This action cannot be undone.",
      icon: "warning",

      showCancelButton: true,

      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",

      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",

      reverseButtons: true,

      background: "#ffffff",
      color: "#111827",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await api.delete(
        `/interview-history/${id}`
      );

      /*
       * API ko dobara call karne ki zarurat nahi.
       * Deleted interview ko state se hata denge.
       */

      setHistories((previousHistories) =>
        previousHistories.filter(
          (item) => item.id !== id
        )
      );

      toast.success(
        "Interview deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete interview error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  /* ==============================
     JSX
  ============================== */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          <h2 className="fw-bold">
            📜 Interview History
          </h2>

          <p className="text-muted">
            Your saved interview practice records.
          </p>

          {/* Loading */}

          {loading && (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              />

              <p className="text-muted mt-3">
                Loading interview history...
              </p>
            </div>
          )}

          {/* Empty */}

          {!loading &&
            histories.length === 0 && (
              <div className="card border-0 shadow p-4 mt-4 text-center">
                <h5>
                  No Interview History
                </h5>

                <p className="text-muted mb-0">
                  Your completed interview
                  practice will appear here.
                </p>
              </div>
            )}

          {/* History */}

          {!loading &&
            histories.map((item) => (
              <div
                className="card border-0 shadow p-4 mt-4"
                key={item.id}
              >
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <h5 className="mb-0">
                    {item.role ||
                      "Interview Practice"}
                  </h5>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      handleDelete(item.id)
                    }
                  >
                    🗑 Delete
                  </button>
                </div>

                <p>
                  <strong>
                    Score:
                  </strong>{" "}
                  {item.score ?? "N/A"}
                </p>

                <p>
                  <strong>
                    Question:
                  </strong>{" "}
                  {item.question || "N/A"}
                </p>

                <p>
                  <strong>
                    Your Answer:
                  </strong>{" "}
                  {item.answer || "N/A"}
                </p>

                <hr />

                <div
                  style={{
                    whiteSpace: "pre-line",
                  }}
                >
                  {item.feedback ||
                    "No feedback available."}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}