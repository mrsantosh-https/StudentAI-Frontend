import api from "./api";

/*
|--------------------------------------------------------------------------
| Error helper
|--------------------------------------------------------------------------
*/

function getAdminErrorMessage(error, fallbackMessage) {
  const validationErrors = error.response?.data?.errors;

  if (validationErrors) {
    return Object.values(validationErrors)
      .flat()
      .join(" ");
  }

  return (
    error.response?.data?.message ||
    error.message ||
    fallbackMessage
  );
}


/*
|--------------------------------------------------------------------------
| Get Login Activities
|--------------------------------------------------------------------------
*/

export async function getLoginActivities({
  page = 1,
  search = "",
  status = "",
  date = "",
} = {}) {
  try {
    const params = {
      page,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (status) {
      params.status = status;
    }

    if (date) {
      params.date = date;
    }

    const response = await api.get(
      "/admin/login-activities",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Login activities error:",
      error.response?.data || error
    );

    throw new Error(
      getAdminErrorMessage(
        error,
        "Failed to fetch login activities."
      ),
      {
        cause: error,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| Get Single Login Activity
|--------------------------------------------------------------------------
*/

export async function getLoginActivity(id) {
  try {
    if (!id) {
      throw new Error(
        "Login activity ID is required."
      );
    }

    const response = await api.get(
      `/admin/login-activities/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Login activity details error:",
      error.response?.data || error
    );

    throw new Error(
      getAdminErrorMessage(
        error,
        "Failed to fetch login activity."
      ),
      {
        cause: error,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| Get AI Usage Analytics
|--------------------------------------------------------------------------
*/

export async function getAIUsage({
  page = 1,
  search = "",
  tool = "",
  status = "",
} = {}) {
  try {
    const params = {
      page,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (tool) {
      params.tool = tool;
    }

    if (status) {
      params.status = status;
    }

    const response = await api.get(
      "/admin/ai-usage",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI usage analytics error:",
      error.response?.data || error
    );

    throw new Error(
      getAdminErrorMessage(
        error,
        "Failed to fetch AI usage analytics."
      ),
      {
        cause: error,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| Get Single AI Usage Activity
|--------------------------------------------------------------------------
*/

export async function getAIUsageActivity(id) {
  try {
    if (!id) {
      throw new Error(
        "AI usage activity ID is required."
      );
    }

    const response = await api.get(
      `/admin/ai-usage/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI usage activity details error:",
      error.response?.data || error
    );

    throw new Error(
      getAdminErrorMessage(
        error,
        "Failed to fetch AI usage activity."
      ),
      {
        cause: error,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| Admin Notifications
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Get Admin Notifications
|--------------------------------------------------------------------------
*/

export async function getAdminNotifications({
  page = 1,
  search = "",
  type = "",
  is_read = "",
  user_id = "",
} = {}) {
  try {
    const params = {
      page,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (type) {
      params.type = type;
    }

    if (is_read !== "") {
      params.is_read = is_read;
    }

    if (user_id) {
      params.user_id = user_id;
    }

    const response = await api.get(
      "/admin/notifications",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Admin notifications error:",
      error.response?.data || error
    );

    throw new Error(
      getAdminErrorMessage(
        error,
        "Failed to fetch admin notifications."
      ),
      {
        cause: error,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| Get Single Admin Notification
|--------------------------------------------------------------------------
*/

export async function getAdminNotification(id) {
  try {
    if (!id) {
      throw new Error(
        "Notification ID is required."
      );
    }

    const response = await api.get(
      `/admin/notifications/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Admin notification details error:",
      error.response?.data || error
    );

    throw new Error(
      getAdminErrorMessage(
        error,
        "Failed to fetch notification."
      ),
      {
        cause: error,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| Send Notification To User
|--------------------------------------------------------------------------
*/

export async function sendAdminNotification({
  user_id,
  title,
  message,
  type = "info",
} = {}) {
  try {
    if (!user_id) {
      throw new Error(
        "User ID is required."
      );
    }

    if (!title?.trim()) {
      throw new Error(
        "Notification title is required."
      );
    }

    if (!message?.trim()) {
      throw new Error(
        "Notification message is required."
      );
    }

    const response = await api.post(
      "/admin/notifications",
      {
        user_id,
        title: title.trim(),
        message: message.trim(),
        type,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Send admin notification error:",
      error.response?.data || error
    );

    throw new Error(
      getAdminErrorMessage(
        error,
        "Failed to send notification."
      ),
      {
        cause: error,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| Broadcast Notification
|--------------------------------------------------------------------------
*/

export async function broadcastAdminNotification({
  title,
  message,
  type = "info",
} = {}) {
  try {
    if (!title?.trim()) {
      throw new Error(
        "Notification title is required."
      );
    }

    if (!message?.trim()) {
      throw new Error(
        "Notification message is required."
      );
    }

    const response = await api.post(
      "/admin/notifications/broadcast",
      {
        title: title.trim(),
        message: message.trim(),
        type,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Broadcast notification error:",
      error.response?.data || error
    );

    throw new Error(
      getAdminErrorMessage(
        error,
        "Failed to broadcast notification."
      ),
      {
        cause: error,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| Mark Admin Notification As Read
|--------------------------------------------------------------------------
*/

export async function markAdminNotificationAsRead(id) {
  try {
    if (!id) {
      throw new Error(
        "Notification ID is required."
      );
    }

    const response = await api.patch(
      `/admin/notifications/${id}/read`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error.response?.data || error
    );

    throw new Error(
      getAdminErrorMessage(
        error,
        "Failed to mark notification as read."
      ),
      {
        cause: error,
      }
    );
  }
}


/*
|--------------------------------------------------------------------------
| Delete Admin Notification
|--------------------------------------------------------------------------
*/

export async function deleteAdminNotification(id) {
  try {
    if (!id) {
      throw new Error(
        "Notification ID is required."
      );
    }

    const response = await api.delete(
      `/admin/notifications/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete admin notification error:",
      error.response?.data || error
    );

    throw new Error(
      getAdminErrorMessage(
        error,
        "Failed to delete notification."
      ),
      {
        cause: error,
      }
    );
  }
}