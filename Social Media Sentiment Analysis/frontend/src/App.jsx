import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/protectedRoute";
import Navbar from "./components/Navbar";
import Sentence from "./pages/Sentence";
import TwitterHashtag from "./pages/twitter-hashtag";
import Sidebar from "./components/Sidebar";
import TwitterTrend from "./pages/twitter-trend";
import TwitterComments from "./pages/twitter-comment";
import InstagramComments from "./pages/instaComments";
import FacebookComment from "./pages/FacebookComment";
import Admin from "./pages/Admin";
import AdminHome from "./pages/AdminHome";
import AdminHistory from "./pages/AdminHistory";
import AdminDashboard from "./pages/AdminDashboard";
import './styles/Sidebar.css';

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navbar />
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sentence"
          element={
            <ProtectedRoute>
              <Navbar />
              <Sentence />
            </ProtectedRoute>
          }
        />
        <Route
          path="/twitter-hashtag"
          element={
            <ProtectedRoute>
              <Navbar />
              <TwitterHashtag />
            </ProtectedRoute>
          }
        />
        <Route
          path="/twitter-trend"
          element={
            <ProtectedRoute>
              <Navbar />
              <TwitterTrend />
            </ProtectedRoute>
          }
        />
        <Route
          path="/twitter-comment"
          element={
            <ProtectedRoute>
              <Navbar />
              <TwitterComments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instaComments"
          element={
            <ProtectedRoute>
              <Navbar />
              <InstagramComments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/FacebookComment"
          element={
            <ProtectedRoute>
              <Navbar />
              <FacebookComment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminPage={true}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AdminHome"
          element={
            <ProtectedRoute adminPage={true}>
              <Sidebar />
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AdminHistory"
          element={
            <ProtectedRoute adminPage={true}>
              <Sidebar />
              <AdminHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AdminDashboard"
          element={
            <ProtectedRoute adminPage={true}>
              <Sidebar />
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
