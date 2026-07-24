import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Saved user parse error:", error);
      localStorage.removeItem("user");
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem("token"))
  );

  const [loading, setLoading] = useState(true);

  const setUser = useCallback((userData) => {
    setUserState(userData);

    if (userData) {
      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("user");
      setIsAuthenticated(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUserState(null);
      setIsAuthenticated(false);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);

      api.defaults.headers.common.Authorization =
        `Bearer ${token}`;

      const response = await api.get("/profile", {
        headers: {
          Accept: "application/json",
        },
      });

      const userData =
        response.data?.user ??
        response.data?.data ??
        response.data;

      setUserState(userData);
      setIsAuthenticated(true);

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      return userData;
    } catch (error) {
      console.error(
        "Profile fetch error:",
        error.response?.data || error
      );

      setUserState(null);
      setIsAuthenticated(false);

      localStorage.removeItem("user");

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        delete api.defaults.headers.common.Authorization;
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginUser = useCallback(
    ({ token, user: userData }) => {
      localStorage.setItem("token", token);

      api.defaults.headers.common.Authorization =
        `Bearer ${token}`;

      setUser(userData);
      setIsAuthenticated(true);
    },
    [setUser]
  );

  const logoutUser = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete api.defaults.headers.common.Authorization;

    setUserState(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      api.defaults.headers.common.Authorization =
        `Bearer ${token}`;

      fetchUser();
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, [fetchUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        loginUser,
        logoutUser,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUser must be used inside UserProvider"
    );
  }

  return context;
}