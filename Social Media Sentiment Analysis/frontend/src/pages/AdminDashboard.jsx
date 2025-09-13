import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import RecentActivities from './RecentActivities';
import '../styles/admin(dashboard).css';

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    user_count: 0,
    comment_count: 0,
    hashtag_count: 0,
    trend_count: 0,
    instagram_count: 0,
    facebook_count: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) {
          throw new Error("No access token found");
        }

        const response = await axios.get('http://127.0.0.1:8000/api/get_counts/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCounts(response.data);
      } catch (error) {
        console.error('Error fetching counts:', error);
        setError('Failed to fetch counts. Please try again.');
      }
    };

    fetchCounts();
  }, []);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <Sidebar>
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-statistics">
          <div className="statistic-item">
            <h2>Registered Users</h2>
            <p>{counts.user_count}</p>
          </div>
          <div className="statistic-item">
            <h2>Twitter Comment Inputs</h2>
            <p>{counts.comment_count}</p>
          </div>
          <div className="statistic-item">
            <h2>Twitter Hashtag Inputs</h2>
            <p>{counts.hashtag_count}</p>
          </div>
          <div className="statistic-item">
            <h2>Twitter Trend Inputs</h2>
            <p>{counts.trend_count}</p>
          </div>
          <div className="statistic-item">
            <h2>Instagram URL Inputs</h2>
            <p>{counts.instagram_count}</p>
          </div>
          <div className="statistic-item">
            <h2>Facebook URL Inputs</h2>
            <p>{counts.facebook_count}</p>
          </div>
        </div>
        <RecentActivities />
      </div>
    </Sidebar>
  );
};

export default AdminDashboard;
