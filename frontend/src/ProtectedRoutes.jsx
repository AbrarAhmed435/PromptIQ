import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "./api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "./constants";
import { useEffect, useState } from "react";

function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  const refreshAccessToken = async () => {
    try {
      const refresh = localStorage.getItem(REFRESH_TOKEN);
      const res = await api.post("/api/token/refresh/", { refresh });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      setIsAuthorized(false);
    }
  };

  const auth = async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN);
    if (!refresh) return setIsAuthorized(false);

    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) return setIsAuthorized(false);

    const tokenDecoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (tokenDecoded.exp < now) {
      await refreshAccessToken();
    } else {
      setIsAuthorized(true);
    }
  };

  if (isAuthorized === null) {
    return <div>Loading .....</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
