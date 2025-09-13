import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ACCESS_TOKEN } from '../constants';
import {jwtDecode} from 'jwt-decode';
import Sidebar from '../components/Sidebar';
import '../styles/admin.css';

const Admin = () => {
  const [usernames, setUsernames] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerType, setRegisterType] = useState("user");
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
          throw new Error("No access token found");
        }

        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        const now = Math.floor(Date.now() / 1000);
        if (decodedToken.exp < now) {
          throw new Error("Token is expired");
        }

        const response = await axios.get('http://127.0.0.1:8000/api/users/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsernames(response.data);
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    };

    fetchUsernames();
  }, []);

  const handleSelectUser = (username) => {
    setSelectedUsers((prevSelectedUsers) => ({
      ...prevSelectedUsers,
      [username]: !prevSelectedUsers[username],
    }));
  };

  const handleDeleteSelectedUsers = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      alert("No access token found");
      return;
    }

    const usersToDelete = Object.keys(selectedUsers).filter((username) => selectedUsers[username]);
    try {
      await axios.delete('http://127.0.0.1:8000/api/delete_users/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { users: usersToDelete },
      });

      setUsernames(usernames.filter((username) => !selectedUsers[username]));
      setSelectedUsers({});
      setMessage({ text: "Users deleted successfully", type: "success" }); 
      setTimeout(() => setMessage({ text: "", type: "" }), 2000);

    } catch (error) {
      console.error('Error deleting users:', error);
    }
  };

  const handleRegisterTypeChange = (e) => {
    setRegisterType(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      alert("No access token found");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', {
        ...newUser,
        is_staff: registerType === "staff",
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsernames([...usernames, response.data.username]);
      setNewUser({ username: "", email: "", password: "" });
      setIsRegistering(false);
      setError("");
      setMessage({ text: "User registered successfully", type: "success" }); // Success message
      setTimeout(() => setMessage({ text: "", type: "" }), 2000);
    } catch (error) {
      setError("Error registering user: " + error.response.data.error);
      console.error('Error registering user:', error);
    }
  };

  return (
    <Sidebar>
      <div className="admin-page">
        <div className="admin-container">
          <h1>Admin User Management</h1>
          <div className={`admin-content ${isRegistering ? 'slide-left' : 'slide-right'}`}>
            <div className="user-list">
              <h2>Registered Users</h2>
              <ul>
                {usernames.map((username, index) => (
                  <li key={index}>
                    <input
                      type="checkbox"
                      checked={!!selectedUsers[username]}
                      onChange={() => handleSelectUser(username)}
                    />
                    {username}
                  </li>
                ))}
              </ul>
                <button className="admin-cancel-button" onClick={handleDeleteSelectedUsers}>Delete Selected Users</button>
                <button className="admin-toregister-button" onClick={() => setIsRegistering(true)}>Register New User</button>
            </div>
            <div className="register-container">
              <h2>Register {registerType === "user" ? "User" : "Staff"}</h2>
              <form onSubmit={handleRegisterSubmit}>
                <label>
                  Register as:
                  <select value={registerType} onChange={handleRegisterTypeChange}>
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                  </select>
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  required
                />
                {registerType === "staff" && (
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                  />
                )}
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  required
                />
                {error && <p className="error">{error}</p>}
                  <button type="submit" className="admin-register-button">Register</button>
                  <button type="button" className="admin-cancel-button" onClick={() => setIsRegistering(false)}>Cancel</button>
              </form>
            </div>
          </div>
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
};

export default Admin;
