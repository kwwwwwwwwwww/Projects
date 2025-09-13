import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import { useUser } from '../components/UserContext';
import '../styles/admin(history).css';
import Sidebar from '../components/Sidebar';

const AdminHistory = () => {
    const [commentHistory, setCommentHistory] = useState([]);
    const [hashtagHistory, setHashtagHistory] = useState([]);
    const [trendHistory, setTrendHistory] = useState([]);
    const [instagramHistory, setInstagramHistory] = useState([]);
    const [facebookHistory, setFacebookHistory] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);
    const [error, setError] = useState(null);
    const [selectedHistory, setSelectedHistory] = useState('comments');
    const [selectedItems, setSelectedItems] = useState([]);
    const { user } = useUser();

    const fetchHistory = async () => {
        try {
            if (user) {
                const accessToken = localStorage.getItem('access');
                if (!accessToken) {
                    throw new Error('No access token found');
                }

                const headers = { Authorization: `Bearer ${accessToken}` };

                const commentResponse = await axios.get(
                    `http://localhost:8000/api/twitter-comment-history/${user.is_staff ? '' : `?username=${user.username}`}`, 
                    { headers }
                );
                setCommentHistory(commentResponse.data);

                const hashtagResponse = await axios.get(
                    `http://localhost:8000/api/twitter-hashtag-history/${user.is_staff ? '' : `?username=${user.username}`}`, 
                    { headers }
                );
                setHashtagHistory(hashtagResponse.data);

                const trendResponse = await axios.get(
                    `http://localhost:8000/api/twitter-trend-history/${user.is_staff ? '' : `?username=${user.username}`}`, 
                    { headers }
                );
                setTrendHistory(trendResponse.data);

                const instaResponse = await axios.get(
                    `http://localhost:8000/api/instagram-history/${user.is_staff ? '' : `?username=${user.username}`}`, 
                    { headers }
                );
                setInstagramHistory(instaResponse.data);

                const facebookResponse = await axios.get(
                    `http://localhost:8000/api/facebook-history/${user.is_staff ? '' : `?username=${user.username}`}`, 
                    { headers }
                );
                setFacebookHistory(facebookResponse.data);
            }
        } catch (err) {
            setError('Failed to fetch history data. Please try again.');
            console.error('Fetch History Error:', err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const toggleExpand = (itemId) => {
        setExpandedItem(expandedItem === itemId ? null : itemId);
    };

    const handleHistoryChange = (event) => {
        setSelectedHistory(event.target.value);
    };

    const handleCheckboxChange = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    const handleDelete = async () => {
        const accessToken = localStorage.getItem('access');
        if (!accessToken) {
            setError('No access token found');
            return;
        }

        const headers = { Authorization: `Bearer ${accessToken}` };
        try {
            await axios.delete(`http://localhost:8000/api/delete-history/`, {
                headers,
                data: { ids: selectedItems }
            });
            fetchHistory();
            setSelectedItems([]);
        } catch (err) {
            setError('Failed to delete selected items. Please try again.');
            console.error('Delete History Error:', err);
        }
    };

    const renderResults = (results) => {
        const parsedResults = JSON.parse(results);
        if (Object.keys(parsedResults).length === 0) {
            return <p>No Results</p>;
        }
        return <pre>{JSON.stringify(parsedResults, null, 2)}</pre>;
    };

    const formatTimestamp = (timestamp) => {
        return moment(timestamp).tz("Asia/Kuala_Lumpur").format('HH:mm:ss DD-MM-YYYY');
    };

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <Sidebar>
            <div className='history-container'>
                <div className="history-header">
                    <h1>Admin History</h1>
                    <button onClick={handleDelete} className="delete-button">Delete Selected</button>
                    <select onChange={handleHistoryChange} value={selectedHistory}>
                        <option value="comments">Twitter Comment History</option>
                        <option value="hashtags">Twitter Hashtag History</option>
                        <option value="trends">Twitter Trend History</option>
                        <option value="instagram">Instagram History</option>
                        <option value="facebook">Facebook History</option>
                    </select>
                </div>

                {selectedHistory === 'comments' && (
                    <>
                        <h2>Twitter Comment History</h2>
                        {Array.isArray(commentHistory) && commentHistory.length > 0 ? (
                            <ul>
                                {commentHistory.map((item) => (
                                    <li key={item.id} className="history-item">
                                        <div className="history-item-content">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleCheckboxChange(item.id)}
                                            />
                                            <p>
                                                {item.username}: {item.url} at {formatTimestamp(item.timestamp)}
                                            </p>
                                            <button onClick={() => toggleExpand(item.id)} className="toggle-button">Toggle Results</button>
                                        </div>
                                        {expandedItem === item.id && (
                                            <div className="results-container">
                                                <h3>Results:</h3>
                                                {renderResults(item.results)}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No comment history found.</p>
                        )}
                    </>
                )}

                {selectedHistory === 'hashtags' && (
                    <>
                        <h2>Twitter Hashtag History</h2>
                        {Array.isArray(hashtagHistory) && hashtagHistory.length > 0 ? (
                            <ul>
                                {hashtagHistory.map((item) => (
                                    <li key={item.id} className="history-item">
                                        <div className="history-item-content">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleCheckboxChange(item.id)}
                                            />
                                            <p>
                                                {item.username}: #{item.hashtag} at {formatTimestamp(item.timestamp)}
                                            </p>
                                            <button onClick={() => toggleExpand(item.id)} className="toggle-button">Toggle Results</button>
                                        </div>
                                        {expandedItem === item.id && (
                                            <div className="results-container">
                                                <h3>Results:</h3>
                                                {renderResults(item.results)}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hashtag history found.</p>
                        )}
                    </>
                )}

                {selectedHistory === 'trends' && (
                    <>
                        <h2>Twitter Trend History</h2>
                        {Array.isArray(trendHistory) && trendHistory.length > 0 ? (
                            <ul>
                                {trendHistory.map((item) => (
                                    <li key={item.id} className="history-item">
                                        <div className="history-item-content">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleCheckboxChange(item.id)}
                                            />
                                            <p>
                                                {item.username}: {item.trend} at {formatTimestamp(item.timestamp)}
                                            </p>
                                            <button onClick={() => toggleExpand(item.id)} className="toggle-button">Toggle Results</button>
                                        </div>
                                        {expandedItem === item.id && (
                                            <div className="results-container">
                                                <h3>Results:</h3>
                                                {renderResults(item.results)}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No trend history found.</p>
                        )}
                    </>
                )}

                {selectedHistory === 'instagram' && (
                    <>
                        <h2>Instagram History</h2>
                        {Array.isArray(instagramHistory) && instagramHistory.length > 0 ? (
                            <ul>
                                {instagramHistory.map((item) => (
                                    <li key={item.id} className="history-item">
                                        <div className="history-item-content">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleCheckboxChange(item.id)}
                                            />
                                            <p>
                                                {item.username}: {item.url} at {formatTimestamp(item.timestamp)}
                                            </p>
                                            <button onClick={() => toggleExpand(item.id)} className="toggle-button">Toggle Results</button>
                                        </div>
                                        {expandedItem === item.id && (
                                            <div className="results-container">
                                                <h3>Results:</h3>
                                                {renderResults(item.results)}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No instagram history found.</p>
                        )}
                    </>
                )}

                {selectedHistory === 'facebook' && (
                    <>
                        <h2>Facebook History</h2>
                        {Array.isArray(facebookHistory) && facebookHistory.length > 0 ? (
                            <ul>
                                {facebookHistory.map((item) => (
                                    <li key={item.id} className="history-item">
                                        <div className="history-item-content">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleCheckboxChange(item.id)}
                                            />
                                            <p>
                                                {item.username}: {item.url} at {formatTimestamp(item.timestamp)}
                                            </p>
                                            <button onClick={() => toggleExpand(item.id)} className="toggle-button">Toggle Results</button>
                                        </div>
                                        {expandedItem === item.id && (
                                            <div className="results-container">
                                                <h3>Results:</h3>
                                                {renderResults(item.results)}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No facebook history found.</p>
                        )}
                    </>
                )}
            </div>
        </Sidebar>
    );
};

export default AdminHistory;
