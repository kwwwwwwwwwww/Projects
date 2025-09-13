import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";
import { useUser } from "./UserContext";
import { jwtDecode } from "jwt-decode"; 

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();
  const name = method === "login" ? "Login" : "Register";
  const { login } = useUser();

  const logUserActivity = async (username, action) => {
    try {
      await axios.post('http://localhost:8000/api/recent-activity/', {
        username,
        action
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:8000' + route, { username, password });
      if (method === "login") {
        const accessToken = res.data.access;
        const refreshToken = res.data.refresh;

        localStorage.setItem(ACCESS_TOKEN, accessToken);
        localStorage.setItem(REFRESH_TOKEN, refreshToken);
        localStorage.setItem("username", username);

        const decodedToken = jwtDecode(accessToken);
        console.log("Decoded Token:", decodedToken);

        const userRole = decodedToken.is_staff ? 'admin' : 'user';
        localStorage.setItem("userRole", userRole);
        console.log("User role set in localStorage:", userRole); // Log the user role being set

        login({ username });

        await logUserActivity(username, 'login');

        if (decodedToken.is_staff) {
          navigate("/AdminHome");
        } else {
          navigate("/");
        }

        setMessage({ text: "Login successful", type: "success" });
      } else {

        setMessage({ text: "Registration successful. Please log in.", type: "success" });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "An error occurred";
      setMessage({ text: errorMessage === "No active account found with the given credentials" ? "Wrong password" : errorMessage, type: "error" });
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleReturnClick = () => {
    navigate("/login");
  };

  return (
    <div>
      <div className="form-background"></div>
      {message.text && (
        <div className={`message ${message.type} ${message.text ? 'show' : ''}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="form-container">
        <h1>{name}</h1>
        <input
          className="form-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          className="form-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {loading && <LoadingIndicator />}
        <button className="form-button" type="submit">
          {name}
        </button>
        {method === "login" && (
          <button className="form-button" type="button" onClick={handleRegisterClick}>
            Register
          </button>
        )}
        {method === "register" && (
          <button className="form-button" type="button" onClick={handleReturnClick}>
            Return
          </button>
        )}
      </form>
    </div>
  );
}

export default Form;
