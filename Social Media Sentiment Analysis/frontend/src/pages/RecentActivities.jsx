import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/RecentActivities.css';
import { ACCESS_TOKEN } from '../constants';

const RecentActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(''); 

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const accessToken = localStorage.getItem(ACCESS_TOKEN);
                const response = await axios.get('http://localhost:8000/api/recent-activity/', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setActivities(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch recent activities');
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
    };

    const filteredActivities = selectedUser
        ? activities.filter(activity => activity.user === selectedUser)
        : activities;

    const uniqueUsers = [...new Set(activities.map(activity => activity.user))];

    return (
        <div className="recent-activities-container">
            <div className="recent-activities-header">
                <h2>Recent Activities</h2>
                <select value={selectedUser} onChange={handleUserChange}>
                    <option value="">All Users</option>
                    {uniqueUsers.map((user, index) => (
                        <option key={index} value={user}>{user}</option>
                    ))}
                </select>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && filteredActivities.length === 0 && <p>No recent activities</p>}
            {!loading && !error && filteredActivities.length > 0 && (
                <ul>
                    {filteredActivities.map((activity, index) => (
                        <li key={index} style={{ backgroundColor: activity.action === 'login' ? '#d4edda' : activity.action === 'logout' ? '#f8d7da' : '#f9f9f9', color: activity.action === 'login' ? '#155724' : activity.action === 'logout' ? '#721c24' : '#333' }}>
                            <p><strong>{activity.user}</strong>: {activity.action} at {new Date(activity.timestamp).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RecentActivities;
