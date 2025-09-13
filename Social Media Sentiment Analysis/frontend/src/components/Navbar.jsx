import React, { useState, useEffect } from 'react';
import Logo from '../assets/SA.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ReorderIcon from '@mui/icons-material/Reorder';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import '../styles/Navbar.css';
import '../styles/Sidebar.css';
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import axios from 'axios';

function stringToColor(string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

function stringAvatar(name) {
  let initials;
  if (name.includes(' ')) {
    initials = `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`;
  } else {
    initials = name[0];
  }

  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: initials,
  };
}

function Navbar() {
  const [openLinks, setOpenLinks] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState(""); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedUserRole = localStorage.getItem("userRole"); 
    console.log("Stored user role:", storedUserRole); 
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedUserRole) {
      setUserRole(storedUserRole);
      console.log("User role set to:", storedUserRole); 
    }
    if (location.pathname === "/twitter-hashtag") {
      setIsSidebarOpen(true);
    }
  }, [location.pathname]);

  const toggleNavbar = () => {
    setOpenLinks(!openLinks);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  const handleLogout = async () => {
    await logUserActivity(username, 'logout');
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem("username");
    localStorage.removeItem("userRole"); 
    navigate("/login");
  };

  const homePath = userRole === 'admin' ? "/adminhome" : "/";
  console.log("homePath set to:", homePath); 

  const isHome = location.pathname === homePath;
  const isSentence = location.pathname === "/sentence";
  const isTwitterHash = location.pathname === "/twitter-hashtag";
  const isTwitterTrend = location.pathname === "/twitter-trend";
  const isTwitterComment = location.pathname === "/twitter-comment";
  const isInstagramComment = location.pathname === "/instaComments";
  const isFacebookComment = location.pathname === "/FacebookComment";

  return (
    <div className="navbar">
      <div className="leftSide" id={openLinks ? "open" : "close"}>
        <img src={Logo} alt="Logo" />
        <div className="hiddenLinks">
          {isHome && (
            <>
              <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
            </>
          )}
          {isSentence && (
            <>
              <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </Fab>
              <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
            </>
          )}
          {isTwitterHash && (
            <>
              <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </ Fab>
              <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
            </>
          )}
          {isTwitterTrend && (
          <>
            <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </ Fab>
            <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
          </>
        )}
        {isTwitterComment && (
          <>
            <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </ Fab>
            <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
          </>
        )}
        {isInstagramComment && (
          <>
            <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </ Fab>
            <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
          </>
        )}
        {isFacebookComment && (
          <>
            <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </ Fab>
            <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
          </>
        )}
        </div>
      </div>
      <div className="rightSide">
        {isHome && (
          <>
            <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
          </>
        )}
        {isSentence && (
          <>
            <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </ Fab>
            <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
          </>
        )}
        {isTwitterHash && (
          <>
            <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </ Fab>
            <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
          </>
        )}
        {isTwitterTrend && (
          <>
            <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </ Fab>
            <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
          </>
        )}
        {isTwitterComment && (
          <>
            <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </ Fab>
            <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
          </>
        )}
        {isInstagramComment && (
          <>
            <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </ Fab>
            <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
          </>
        )}
        {isFacebookComment && (
          <>
            <Fab variant="extended" size="medium" color="primary" component={Link} to={homePath}> Home </ Fab>
            <Fab variant="extended" size="medium" color="primary" onClick={handleLogout} component={Link} to="/Login"> Logout </ Fab>
          </>
        )}
        <button onClick={toggleNavbar}>
          <ReorderIcon />
        </button>
        <Stack direction="row" spacing={2} marginLeft={'15px'}>
          <Avatar {...stringAvatar(username)} />
        </Stack>
      </div>
    </div>
  );
}

export default Navbar;
