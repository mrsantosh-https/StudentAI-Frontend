import { useCallback, useEffect, useState } from "react";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaEye,
  FaTrash,
  FaSearch,
  FaSyncAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import { API_URL } from "../services/api";
import "../styles/AdminFeedback.css";

const EMPTY_ANALYTICS = {
  total_feedback: 0,
  total_likes: 0,
  total_dislikes: 0,
  like_percentage: 0,
  dislike_percentage: 0,
};

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);

  const [search, setSearch] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* =========================================================
     TOKEN
  ========================================================= */

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("access_token")
    );
  };

  /* =========================================================
     FETCH FEEDBACK
  ========================================================= */

  const fetchFeedback = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const token = getToken();

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const params = new URLSearchParams();

        params.set("page", page);

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (feedbackFilter) {
          params.set("feedback", feedbackFilter);
        }

        if (date) {
          params.set("date", date);
        }

        const url = `${API_URL}/admin/feedback?${params.toString()}`;

        console.log("Fetching Admin Feedback:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        console.log("Admin Feedback API Response:", data);

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to fetch feedback."
          );
        }

        setAnalytics(data?.analytics || EMPTY_ANALYTICS);

        const pagination = data?.feedback;

        setFeedback(
          Array.isArray(pagination?.data)
            ? pagination.data
            : []
        );

        setCurrentPage(
          Number(pagination?.current_page || page)
        );

        setLastPage(
          Number(pagination?.last_page || 1)
        );

        setTotal(
          Number(pagination?.total || 0)
        );
      } catch (error) {
        console.error("Admin feedback error:", error);

        if (
          error?.message !==
          "Authentication token not found."
        ) {
          Swal.fire({
            icon: "error",
            title: "Unable to load feedback",
            text:
              error?.message ||
              "Something went wrong while loading feedback.",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [search, feedbackFilter, date]
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;

      await fetchFeedback(1);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchFeedback]);

  /* =========================================================
     APPLY FILTER
  ========================================================= */

  const handleFilter = () => {
    setCurrentPage(1);
    fetchFeedback(1);
  };

  /* =========================================================
     CLEAR FILTER
  ========================================================= */

  const clearFilters = async () => {
    setSearch("");
    setFeedbackFilter("");
    setDate("");
    setCurrentPage(1);

    /*
     State update asynchronous hota hai,
     isliye directly old fetchFeedback call nahi karenge.
    */

    const token = getToken();

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "Authentication token not found.",
      });

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/feedback?page=1`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to clear filters."
        );
      }

      setAnalytics(
        data?.analytics || EMPTY_ANALYTICS
      );

      setFeedback(
        Array.isArray(data?.feedback?.data)
          ? data.feedback.data
          : []
      );

      setCurrentPage(
        Number(data?.feedback?.current_page || 1)
      );

      setLastPage(
        Number(data?.feedback?.last_page || 1)
      );

      setTotal(
        Number(data?.feedback?.total || 0)
      );
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.message ||
          "Failed to clear filters.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > lastPage ||
      loading
    ) {
      return;
    }

    setCurrentPage(page);
    fetchFeedback(page);
  };

  /* =========================================================
     VIEW FEEDBACK
  ========================================================= */

  const handleView = async (id) => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_URL}/admin/feedback/${id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to get feedback."
        );
      }

      setSelectedFeedback(
        data?.feedback || null
      );

      setShowModal(true);
    } catch (error) {
      console.error(
        "View feedback error:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.message ||
          "Unable to view feedback.",
      });
    }
  };

  /* =========================================================
     DELETE FEEDBACK
  ========================================================= */

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Feedback?",
      text:
        "This will remove the like/dislike feedback from this AI response.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeleting(id);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_URL}/admin/feedback/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete feedback."
        );
      }

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text:
          data?.message ||
          "Feedback deleted successfully.",
        timer: 1400,
        showConfirmButton: false,
      });

      await fetchFeedback(currentPage);
    } catch (error) {
      console.error(
        "Delete feedback error:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.message ||
          "Failed to delete feedback.",
      });
    } finally {
      setDeleting(null);
    }
  };

  /* =========================================================
     FEEDBACK TYPE
  ========================================================= */

  const getFeedbackType = (item) => {
    if (item?.liked) {
      return {
        label: "Like",
        className: "feedback-like",
        icon: <FaThumbsUp />,
      };
    }

    if (item?.disliked) {
      return {
        label: "Dislike",
        className: "feedback-dislike",
        icon: <FaThumbsDown />,
      };
    }

    return {
      label: "Unknown",
      className: "feedback-unknown",
      icon: null,
    };
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const renderPagination = () => {
    if (lastPage <= 1) {
      return null;
    }

    const pages = [];

    for (let page = 1; page <= lastPage; page++) {
      pages.push(
        <button
          key={page}
          type="button"
          className={
            page === currentPage
              ? "pagination-btn active"
              : "pagination-btn"
          }
          onClick={() =>
            handlePageChange(page)
          }
          disabled={loading}
        >
          {page}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          type="button"
          className="pagination-btn"
          disabled={
            currentPage === 1 || loading
          }
          onClick={() =>
            handlePageChange(
              currentPage - 1
            )
          }
        >
          Previous
        </button>

        {pages}

        <button
          type="button"
          className="pagination-btn"
          disabled={
            currentPage === lastPage ||
            loading
          }
          onClick={() =>
            handlePageChange(
              currentPage + 1
            )
          }
        >
          Next
        </button>
      </div>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="dashboard-content">
          <div className="admin-feedback-page">

            {/* HEADER */}

            <div className="admin-feedback-header">
              <div>
                <span className="feedback-page-label">
                  ADMIN PANEL
                </span>

                <h1>AI Feedback</h1>

                <p>
                  Monitor user feedback on AI
                  responses.
                </p>
              </div>

              <button
                type="button"
                className="refresh-btn"
                onClick={() =>
                  fetchFeedback(
                    currentPage
                  )
                }
                disabled={loading}
              >
                <FaSyncAlt
                  className={
                    loading
                      ? "refresh-icon spinning"
                      : "refresh-icon"
                  }
                />

                {loading
                  ? "Loading..."
                  : "Refresh"}
              </button>
            </div>

            {/* ANALYTICS */}

            <div className="feedback-analytics">

              <div className="analytics-card">
                <div className="analytics-icon total">
                  💬
                </div>

                <div>
                  <span>
                    Total Feedback
                  </span>

                  <strong>
                    {analytics.total_feedback}
                  </strong>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon like">
                  <FaThumbsUp />
                </div>

                <div>
                  <span>
                    Total Likes
                  </span>

                  <strong>
                    {analytics.total_likes}
                  </strong>

                  <small>
                    {analytics.like_percentage}%
                  </small>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon dislike">
                  <FaThumbsDown />
                </div>

                <div>
                  <span>
                    Total Dislikes
                  </span>

                  <strong>
                    {analytics.total_dislikes}
                  </strong>

                  <small>
                    {analytics.dislike_percentage}%
                  </small>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon ratio">
                  📊
                </div>

                <div>
                  <span>
                    Like Ratio
                  </span>

                  <strong>
                    {analytics.like_percentage}%
                  </strong>

                  <small>
                    vs{" "}
                    {
                      analytics.dislike_percentage
                    }%
                  </small>
                </div>
              </div>

            </div>

            {/* FILTERS */}

            <div className="feedback-filters">

              <div className="search-box">
                <FaSearch />

                <input
                  type="text"
                  placeholder="Search question, answer, name or email..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      handleFilter();
                    }
                  }}
                />
              </div>

              <select
                value={feedbackFilter}
                onChange={(e) =>
                  setFeedbackFilter(
                    e.target.value
                  )
                }
              >
                <option value="">
                  All Feedback
                </option>

                <option value="like">
                  Likes
                </option>

                <option value="dislike">
                  Dislikes
                </option>
              </select>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
              />

              <button
                type="button"
                className="filter-btn"
                onClick={handleFilter}
                disabled={loading}
              >
                Apply
              </button>

              <button
                type="button"
                className="clear-filter-btn"
                onClick={clearFilters}
                disabled={loading}
              >
                Clear
              </button>

            </div>

            {/* RESULT INFO */}

            <div className="feedback-result-info">
              <span>
                Showing{" "}
                <strong>
                  {feedback.length}
                </strong>{" "}
                of{" "}
                <strong>{total}</strong>{" "}
                feedback
              </span>
            </div>

            {/* TABLE */}

            <div className="feedback-table-wrapper">

              <table className="feedback-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Question</th>
                    <th>AI Answer</th>
                    <th>Feedback</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="feedback-loading"
                      >
                        <div className="table-loader">
                          <div className="feedback-spinner"></div>
                          <span>
                            Loading feedback...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : feedback.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="feedback-empty"
                      >
                        <div className="empty-feedback">
                          <div>
                            💬
                          </div>

                          <h3>
                            No feedback found
                          </h3>

                          <p>
                            There is no user
                            feedback matching
                            your filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    feedback.map((item) => {
                      const type =
                        getFeedbackType(
                          item
                        );

                      return (
                        <tr
                          key={item.id}
                        >

                          {/* USER */}

                          <td>
                            <div className="feedback-user">

                              <div className="user-avatar">
                                {(
                                  item
                                    .user
                                    ?.name ||
                                  "U"
                                )
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {item
                                    .user
                                    ?.name ||
                                    "Unknown User"}
                                </strong>

                                <span>
                                  {item
                                    .user
                                    ?.email ||
                                    "No email"}
                                </span>
                              </div>

                            </div>
                          </td>

                          {/* QUESTION */}

                          <td>
                            <div className="question-text">
                              {item.question ||
                                "No question"}
                            </div>
                          </td>

                          {/* ANSWER */}

                          <td>
                            <div className="answer-text">
                              {item.answer ||
                                "No answer"}
                            </div>
                          </td>

                          {/* FEEDBACK */}

                          <td>
                            <span
                              className={`feedback-badge ${type.className}`}
                            >
                              {type.icon}
                              {type.label}
                            </span>
                          </td>

                          {/* DATE */}

                          <td>
                            <span className="feedback-date">
                              {formatDate(
                                item.updated_at
                              )}
                            </span>
                          </td>

                          {/* ACTIONS */}

                          <td>
                            <div className="feedback-actions">

                              <button
                                type="button"
                                className="view-btn"
                                title="View feedback"
                                onClick={() =>
                                  handleView(
                                    item.id
                                  )
                                }
                              >
                                <FaEye />
                              </button>

                              <button
                                type="button"
                                className="delete-btn"
                                title="Delete feedback"
                                disabled={
                                  deleting ===
                                  item.id
                                }
                                onClick={() =>
                                  handleDelete(
                                    item.id
                                  )
                                }
                              >
                                <FaTrash />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}

            {renderPagination()}

            {/* MODAL */}

            {showModal &&
              selectedFeedback && (
                <div
                  className="feedback-modal-overlay"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  <div
                    className="feedback-modal"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    <div className="feedback-modal-header">
                      <div>
                        <span>
                          FEEDBACK
                        </span>

                        <h2>
                          Feedback Details
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowModal(
                            false
                          )
                        }
                      >
                        ×
                      </button>
                    </div>

                    <div className="feedback-modal-body">

                      {/* USER */}

                      <div className="modal-section">

                        <h3>User</h3>

                        <div className="modal-user">

                          <div className="user-avatar">
                            {(
                              selectedFeedback
                                .user
                                ?.name ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {selectedFeedback
                                .user
                                ?.name ||
                                "Unknown User"}
                            </strong>

                            <span>
                              {selectedFeedback
                                .user
                                ?.email ||
                                "No email"}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* FEEDBACK */}

                      <div className="modal-section">

                        <h3>
                          Feedback
                        </h3>

                        <span
                          className={`feedback-badge ${
                            getFeedbackType(
                              selectedFeedback
                            ).className
                          }`}
                        >
                          {
                            getFeedbackType(
                              selectedFeedback
                            ).icon
                          }

                          {
                            getFeedbackType(
                              selectedFeedback
                            ).label
                          }
                        </span>

                      </div>

                      {/* QUESTION */}

                      <div className="modal-section">

                        <h3>
                          Question
                        </h3>

                        <p>
                          {selectedFeedback.question ||
                            "No question"}
                        </p>

                      </div>

                      {/* ANSWER */}

                      <div className="modal-section">

                        <h3>
                          AI Answer
                        </h3>

                        <p className="modal-answer">
                          {selectedFeedback.answer ||
                            "No answer"}
                        </p>

                      </div>

                      {/* DATE */}

                      <div className="modal-section">

                        <h3>
                          Date
                        </h3>

                        <p>
                          {formatDate(
                            selectedFeedback.updated_at
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="feedback-modal-footer">

                      <button
                        type="button"
                        onClick={() =>
                          setShowModal(
                            false
                          )
                        }
                      >
                        Close
                      </button>

                    </div>

                  </div>
                </div>
              )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminFeedback;