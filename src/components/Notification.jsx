import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { FaBell, FaCheck } from "react-icons/fa";

import { toast } from "react-hot-toast";

import { API_URL } from "../services/api";

export default function Notification() {
  const notificationRef = useRef(null);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const token = localStorage.getItem("token");

  /*
  |--------------------------------------------------------------------------
  | Fetch Notifications
  |--------------------------------------------------------------------------
  */

  const loadNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationLoading(false);
      return;
    }

    try {
      setNotificationLoading(true);

      const response = await fetch(
        `${API_URL}/notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch notifications"
        );
      }

      const list = Array.isArray(
        data.notifications
      )
        ? data.notifications
        : [];

      setNotifications(list);

      const count =
        data.unread_count !== undefined
          ? Number(data.unread_count) || 0
          : list.filter(
              (notification) =>
                notification.is_read === false
            ).length;

      setUnreadCount(count);
    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );
    } finally {
      setNotificationLoading(false);
    }
  }, [token]);

  /*
  |--------------------------------------------------------------------------
  | Initial Notification Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (!cancelled) {
        loadNotifications();
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [loadNotifications]);

  /*
  |--------------------------------------------------------------------------
  | Refresh Notifications Every 30 Seconds
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [token, loadNotifications]);

  /*
  |--------------------------------------------------------------------------
  | Outside Click
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Mark One Notification As Read
  |--------------------------------------------------------------------------
  */

  const markAsRead = async (id) => {
    const selectedNotification =
      notifications.find(
        (item) => item.id === id
      );

    if (
      !selectedNotification ||
      selectedNotification.is_read
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/notifications/read/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notification as read"
        );
      }

      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    is_read: true,
                  }
                : item
          )
      );

      setUnreadCount(
        (previousCount) =>
          Math.max(
            previousCount - 1,
            0
          )
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to mark notification as read."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Mark All Notifications As Read
  |--------------------------------------------------------------------------
  */

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/notifications/read-all`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark all notifications as read"
        );
      }

      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
            (item) => ({
              ...item,
              is_read: true,
            })
          )
      );

      setUnreadCount(0);

      toast.success(
        "All notifications marked as read"
      );
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to mark notifications as read."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Notification
  |--------------------------------------------------------------------------
  */

  const deleteNotification = async (id) => {
    const deletedNotification =
      notifications.find(
        (item) => item.id === id
      );

    try {
      const response = await fetch(
        `${API_URL}/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete notification"
        );
      }

      setNotifications(
        (previousNotifications) =>
          previousNotifications.filter(
            (item) => item.id !== id
          )
      );

      if (
        deletedNotification &&
        !deletedNotification.is_read
      ) {
        setUnreadCount(
          (previousCount) =>
            Math.max(
              previousCount - 1,
              0
            )
        );
      }

      toast.success(
        "Notification deleted"
      );
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to delete notification."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Format Notification Time
  |--------------------------------------------------------------------------
  */

  const formatNotificationTime = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | JSX
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="notification-wrapper"
      ref={notificationRef}
    >
      {/* Notification Button */}

      <button
        type="button"
        className="notification-btn"
        onClick={() =>
          setShowNotifications(
            (previousValue) =>
              !previousValue
          )
        }
        title="Notifications"
      >
        <FaBell />

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}

      {showNotifications && (
        <div className="notification-dropdown">

          {/* Header */}

          <div className="notification-header">
            <div>
              <h5>
                Notifications
              </h5>

              <small>
                {unreadCount} unread
              </small>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-btn"
                onClick={markAllAsRead}
              >
                <FaCheck />

                <span>
                  Mark all
                </span>
              </button>
            )}
          </div>

          {/* Notification List */}

          <div className="notification-list">
            {notificationLoading ? (
              <div className="no-notification">
                <p>
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notification">
                <p>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <div
                    key={
                      notification.id
                    }
                    className={`notification-item ${
                      !notification.is_read
                        ? "unread"
                        : ""
                    }`}
                    onClick={() =>
                      markAsRead(
                        notification.id
                      )
                    }
                  >
                    {/* Title */}

                    <strong>
                      {notification.title ||
                        "Notification"}
                    </strong>

                    {/* Message */}

                    <p>
                      {notification.message ||
                        ""}
                    </p>

                    {/* Time */}

                    <small>
                      {formatNotificationTime(
                        notification.created_at
                      )}
                    </small>

                    {/* Delete */}

                    <button
                      type="button"
                      className="notification-delete"
                      title="Delete notification"
                      onClick={(event) => {
                        event.stopPropagation();

                        deleteNotification(
                          notification.id
                        );
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}