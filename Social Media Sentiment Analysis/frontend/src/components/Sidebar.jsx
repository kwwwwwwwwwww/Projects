import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';
import ReorderIcon from '@mui/icons-material/Reorder';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import axios from 'axios';

const Sidebar = ({ children }) => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

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
    const username = localStorage.getItem('username');
    if (username) {
      await logUserActivity(username, 'logout');
    }
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <main className={show ? 'space-toggle' : null}>
      <header className={`header ${show ? 'space-toggle' : null}`}>
        {/* Removed header-toggle from header */}
      </header>

      <aside className={`sidebar ${show ? 'show' : null}`}>
        <nav className='nav'>
          <div className='header-toggle' onClick={() => setShow(!show)}>
            {show ? <CloseIcon /> : <ReorderIcon />}
          </div>
          <div>
            <div className='nav-list'>
              <NavLink to='/AdminHome' className='nav-link'>
                <HomeIcon className='nav-link-icon' />
                <span className='nav-link-name'>Homepage</span>
              </NavLink>
              <NavLink to='/admin' className='nav-link'>
                <PersonIcon className='nav-link-icon'/>
                <span className='nav-link-name'>Users</span>
              </NavLink>
              <NavLink to='/AdminHistory' className='nav-link'>
                <HistoryIcon className='nav-link-icon'/>
                <span className='nav-link-name'>History</span>
              </NavLink>
              <NavLink to='/AdminDashboard' className='nav-link'>
                <BarChartIcon className='nav-link-icon'/>
                <span className='nav-link-name'>Dashboard</span>
              </NavLink>
            </div>
          </div>
          <NavLink to='#' onClick={handleLogout} className='nav-link'>
            <LogoutIcon className='nav-link-icon'/>
            <span className='nav-link-name'>Logout</span>
          </NavLink>
        </nav>
      </aside>

      <div className='content'>
        {children}
      </div>
    </main>
  );
};

export default Sidebar;
