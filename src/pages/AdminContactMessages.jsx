import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import toast from "react-hot-toast";

import "../styles/AdminContactMessages.css";

import {
  FaEnvelope,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaSync,
} from "react-icons/fa";


export default function AdminContactMessages() {

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updating, setUpdating] = useState(false);


  // =====================================
  // FETCH MESSAGES
  // =====================================

  const fetchMessages = useCallback(async () => {

    try {

      setLoading(true);

      const response = await api.get(
        "/admin/contact-messages"
      );

      const responseData = response.data?.data;

      setMessages(
        Array.isArray(responseData)
          ? responseData
          : responseData?.data || []
      );

    } catch (error) {

      console.error(
        "Fetch contact messages error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Unable to load contact messages."
      );

    } finally {

      setLoading(false);

    }

  }, []);


  // =====================================
  // LOAD DATA
  // =====================================

  useEffect(() => {

    const timer = setTimeout(() => {
      fetchMessages();
    }, 0);

    return () => clearTimeout(timer);

  }, [fetchMessages]);


  // =====================================
  // UPDATE STATUS
  // =====================================

  const updateStatus = async (id, status) => {

    try {

      setUpdating(true);

      const response = await api.patch(
        `/admin/contact-messages/${id}/status`,
        {
          status,
        }
      );


      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          message.id === id
            ? {
                ...message,
                status,
              }
            : message
        )
      );


      setSelectedMessage((previousMessage) => {

        if (
          previousMessage &&
          previousMessage.id === id
        ) {
          return {
            ...previousMessage,
            status,
          };
        }

        return previousMessage;

      });


      toast.success(
        response.data?.message ||
        "Message status updated successfully."
      );

    } catch (error) {

      console.error(
        "Update status error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Unable to update message."
      );

    } finally {

      setUpdating(false);

    }

  };


  // =====================================
  // DELETE MESSAGE
  // =====================================

  const deleteMessage = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) {
      return;
    }


    try {

      const response = await api.delete(
        `/admin/contact-messages/${id}`
      );


      setMessages((previousMessages) =>
        previousMessages.filter(
          (message) =>
            message.id !== id
        )
      );


      if (
        selectedMessage &&
        selectedMessage.id === id
      ) {
        setSelectedMessage(null);
      }


      toast.success(
        response.data?.message ||
        "Message deleted successfully."
      );

    } catch (error) {

      console.error(
        "Delete error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Unable to delete message."
      );

    }

  };


  // =====================================
  // STATUS CLASS
  // =====================================

  const getStatusClass = (status) => {

    if (status === "read") {
      return "status-read";
    }

    if (status === "resolved") {
      return "status-resolved";
    }

    return "status-new";

  };


  // =====================================
  // COUNT STATUS
  // =====================================

  const newMessages = messages.filter(
    (message) => message.status === "new"
  ).length;


  const readMessages = messages.filter(
    (message) => message.status === "read"
  ).length;


  const resolvedMessages = messages.filter(
    (message) =>
      message.status === "resolved"
  ).length;


  // =====================================
  // UI
  // =====================================

  return (

    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <Sidebar />


      {/* MAIN */}

      <main className="dashboard-main">

        {/* TOPBAR */}

        <Topbar />


        {/* CONTENT */}

        <div className="dashboard-content">

          <div className="admin-contact-page">


            {/* HEADER */}

            <div className="admin-contact-header">

              <div>

                <span className="admin-contact-badge">
                  ADMIN PANEL
                </span>

                <h1>
                  Contact Messages
                </h1>

                <p>
                  Manage feedback, support requests and
                  messages from StudentAI users.
                </p>

              </div>


              <button
                type="button"
                className="refresh-btn"
                onClick={fetchMessages}
                disabled={loading}
              >

                <FaSync />

                {loading
                  ? "Loading..."
                  : "Refresh"}

              </button>

            </div>


            {/* STATS */}

            <div className="admin-contact-stats">


              <div className="contact-stat-card">

                <div className="stat-icon stat-total">
                  <FaEnvelope />
                </div>

                <div>

                  <span>Total Messages</span>

                  <h3>
                    {messages.length}
                  </h3>

                </div>

              </div>


              <div className="contact-stat-card">

                <div className="stat-icon stat-new">
                  <FaClock />
                </div>

                <div>

                  <span>New Messages</span>

                  <h3>
                    {newMessages}
                  </h3>

                </div>

              </div>


              <div className="contact-stat-card">

                <div className="stat-icon stat-read">
                  <FaEye />
                </div>

                <div>

                  <span>Read Messages</span>

                  <h3>
                    {readMessages}
                  </h3>

                </div>

              </div>


              <div className="contact-stat-card">

                <div className="stat-icon stat-resolved">
                  <FaCheckCircle />
                </div>

                <div>

                  <span>Resolved</span>

                  <h3>
                    {resolvedMessages}
                  </h3>

                </div>

              </div>

            </div>


            {/* LOADING */}

            {loading ? (

              <div className="admin-contact-loading">

                <div className="admin-loader"></div>

                <p>
                  Loading contact messages...
                </p>

              </div>

            ) : messages.length === 0 ? (

              /* EMPTY STATE */

              <div className="admin-empty-state">

                <FaEnvelope />

                <h3>
                  No Messages Yet
                </h3>

                <p>
                  Contact messages from users will
                  appear here.
                </p>

              </div>

            ) : (

              /* TABLE */

              <div className="admin-contact-table-card">

                <div className="admin-table-header">

                  <div>

                    <h3>
                      All Messages
                    </h3>

                    <p>
                      Messages received from the
                      StudentAI contact page.
                    </p>

                  </div>

                </div>


                <div className="table-responsive">

                  <table className="admin-contact-table">

                    <thead>

                      <tr>

                        <th>User</th>

                        <th>Email</th>

                        <th>Subject</th>

                        <th>Status</th>

                        <th>Date</th>

                        <th>Actions</th>

                      </tr>

                    </thead>


                    <tbody>

                      {messages.map((message) => (

                        <tr key={message.id}>


                          {/* USER */}

                          <td>

                            <div className="message-user">

                              <div className="user-avatar">

                                <FaUser />

                              </div>

                              <span>
                                {message.name}
                              </span>

                            </div>

                          </td>


                          {/* EMAIL */}

                          <td>
                            {message.email}
                          </td>


                          {/* SUBJECT */}

                          <td>

                            <span className="message-subject">

                              {message.subject}

                            </span>

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={`message-status ${getStatusClass(
                                message.status
                              )}`}
                            >

                              {message.status}

                            </span>

                          </td>


                          {/* DATE */}

                          <td>

                            {message.created_at
                              ? new Date(
                                  message.created_at
                                ).toLocaleDateString()
                              : "-"}

                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div className="message-actions">


                              <button
                                type="button"
                                className="action-view"
                                title="View Message"
                                onClick={() =>
                                  setSelectedMessage(
                                    message
                                  )
                                }
                              >

                                <FaEye />

                              </button>


                              <button
                                type="button"
                                className="action-delete"
                                title="Delete Message"
                                onClick={() =>
                                  deleteMessage(
                                    message.id
                                  )
                                }
                              >

                                <FaTrash />

                              </button>


                            </div>

                          </td>


                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            )}


          </div>

        </div>

      </main>


      {/* MESSAGE MODAL */}

      {selectedMessage && (

        <div
          className="admin-message-modal-overlay"
          onClick={() =>
            setSelectedMessage(null)
          }
        >

          <div
            className="admin-message-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="message-modal-header">

              <div>

                <span>
                  MESSAGE DETAILS
                </span>

                <h3>
                  {selectedMessage.subject}
                </h3>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setSelectedMessage(null)
                }
              >

                ×

              </button>

            </div>


            {/* DETAILS */}

            <div className="message-details">


              <div className="message-detail-row">

                <span>Name</span>

                <strong>
                  {selectedMessage.name}
                </strong>

              </div>


              <div className="message-detail-row">

                <span>Email</span>

                <strong>
                  {selectedMessage.email}
                </strong>

              </div>


              <div className="message-detail-row">

                <span>Status</span>

                <strong
                  className={`message-status ${getStatusClass(
                    selectedMessage.status
                  )}`}
                >

                  {selectedMessage.status}

                </strong>

              </div>


              {/* MESSAGE */}

              <div className="message-content">

                <h5>
                  Message
                </h5>

                <p>
                  {selectedMessage.message}
                </p>

              </div>


              {/* STATUS BUTTONS */}

              <div className="message-status-actions">


                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    updateStatus(
                      selectedMessage.id,
                      "read"
                    )
                  }
                >

                  Mark as Read

                </button>


                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    updateStatus(
                      selectedMessage.id,
                      "resolved"
                    )
                  }
                >

                  Mark Resolved

                </button>


              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}