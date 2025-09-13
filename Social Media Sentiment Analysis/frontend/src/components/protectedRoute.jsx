import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children, adminPage }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    auth().catch(() => {
      setIsAuthorized(false);
    });
  }, []);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    try {
      const response = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });
      if (response.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        await auth(); 
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setIsAuthorized(false);
    }
  };

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded Token:", decoded); 
      const tokenExpiration = decoded.exp;
      const now = Math.floor(Date.now() / 1000);

      if (tokenExpiration < now) {
        await refreshToken();
      } else {
        setIsAuthorized(true);
        setIsAdmin(decoded.is_staff); 
        console.log("Is Admin:", decoded.is_staff); 
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      setIsAuthorized(false);
    }
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (isAuthorized && adminPage) {
    if (!isAdmin) {
      return <div>Restricted Page</div>;
    }
  }

  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
