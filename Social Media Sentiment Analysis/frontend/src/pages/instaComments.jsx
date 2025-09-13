import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { InstagramEmbed } from 'react-social-media-embed';
import { useUser } from '../components/UserContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import '../styles/Instagram.css';
import '../styles/Visualization.css'; 
import '../styles/LoadingSpinner.css'; 
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Instagram = () => {
    const [postUrl, setPostUrl] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useUser();
    const [showVisualization, setShowVisualization] = useState(false);
    const [emotionCounts, setEmotionCounts] = useState({
        sadness: 0,
        joy: 0,
        love: 0,
        anger: 0,
        fear: 0,
        surprise: 0
    });
    const [sentimentCounts, setSentimentCounts] = useState({
        Positive: 0,
        Neutral: 0,
        Negative: 0
    });
    const [filteredSentiment, setFilteredSentiment] = useState('');
    const sentimentChartRef = useRef(null);

    const handleInputChange = (e) => {
        const url = e.target.value;
        setPostUrl(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setComments([]);
        setFilteredSentiment('');

        try {
            const accessToken = localStorage.getItem('access');
            const response = await axios.post(
                'http://localhost:8000/api/scrape_instacomments/', 
                { post_url: postUrl },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            const commentsData = response.data;
            console.log('API Response:', commentsData);

            const analyzedComments = await Promise.all(commentsData.map(async comment => {
                const sentimentResponse = await axios.post(
                    'http://localhost:8000/api/predict_sentiment/',
                    { text: comment.comment }
                );
                const sentimentResult = sentimentResponse.data;

                const emotionResponse = await axios.post(
                    'http://localhost:8000/api/predict_emotion/',
                    { text: comment.comment }
                );
                const emotionResult = emotionResponse.data;

                return {
                    ...comment,
                    sentiment: sentimentResult.label,
                    sentimentScore: sentimentResult.score.toFixed(2),
                    emotion: emotionResult.emotion,
                    emotionProbability: emotionResult.probability.toFixed(2),
                };
            }));

            setComments(analyzedComments);
            console.log('Analyzed Comments:', analyzedComments);
            calculateCounts(analyzedComments);

            await axios.post(
                'http://localhost:8000/api/instagram-history/',
                {
                    username: user.username,
                    url: postUrl,
                    results: JSON.stringify(analyzedComments)
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('Unauthorized access. Please log in again.');
            } else {
                setError('Error fetching comments');
            }
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setPostUrl('');
        setComments([]);
        setError('');
        setShowVisualization(false);
        setEmotionCounts({
            sadness: 0,
            joy: 0,
            love: 0,
            anger: 0,
            fear: 0,
            surprise: 0
        });
        setSentimentCounts({
            Positive: 0,
            Neutral: 0,
            Negative: 0
        });
        setFilteredSentiment('');
    };

    const handleToggleVisualization = () => {
        setShowVisualization(!showVisualization);
    };

    const handlePieChartClick = (event) => {
        const elements = sentimentChartRef.current.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
        if (elements.length > 0) {
            const index = elements[0].index;
            const sentiment = sentimentChartRef.current.data.labels[index];
            setFilteredSentiment(sentiment);
        }
    };

    const handleFilterReset = () => {
        setFilteredSentiment('');
    };

    const calculateCounts = (comments) => {
        const emotions = { sadness: 0, joy: 0, love: 0, anger: 0, fear: 0, surprise: 0 };
        const sentiments = { Positive: 0, Neutral: 0, Negative: 0 };

        comments.forEach(comment => {
            if (comment.emotion in emotions) {
                emotions[comment.emotion]++;
            }
            if (comment.sentiment in sentiments) {
                sentiments[comment.sentiment]++;
            }
        });

        setEmotionCounts(emotions);
        setSentimentCounts(sentiments);
    };

    const emotionChartData = {
        labels: Object.keys(emotionCounts),
        datasets: [
            {
                label: 'Emotion Count',
                data: Object.values(emotionCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const sentimentChartData = {
        labels: Object.keys(sentimentCounts),
        datasets: [
            {
                label: 'Sentiment count',
                data: Object.values(sentimentCounts).every(count => count === 0) ? [1, 1, 1] : Object.values(sentimentCounts),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className='container'>
            <h2>Scrape Instagram Comments</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Enter Instagram post URL" 
                    value={postUrl} 
                    onChange={handleInputChange} 
                    required
                />
                <button type="submit" className="instagram-button" disabled={loading}>
                    {loading ? 'Scraping...' : 'Submit'}
                </button>
                <button type="button" className="instagram-reset-button" onClick={handleReset}>Reset</button>
                <button type="button" className="instagram-visualization-button" onClick={handleToggleVisualization}>
                    {showVisualization ? 'Back' : 'Get Visualization'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className={`instagram-comments-container ${showVisualization ? 'slide-left' : 'slide-right'}`}>
                <div className="instagram-container">
                    <h2>Embedded Instagram Post:</h2>
                    {postUrl ? (
                        <InstagramEmbed url={postUrl} width={328} height={400} />
                    ) : (
                        <p>No post to display</p>
                    )}
                </div>
                <div className="pie-chart-container">
                    <h2>Pie Chart</h2>
                    <Pie 
                        data={sentimentChartData} 
                        onClick={handlePieChartClick}
                        ref={sentimentChartRef}
                    />
                </div>
            </div>
            <div className={`insta-comments-container ${showVisualization ? 'slide-left' : 'slide-right'}`}>
                <div className="comments-header">
                    <h2>Comments</h2>
                    {filteredSentiment && (
                        <button onClick={handleFilterReset} className="filter-reset-button">
                            Reset Filter
                        </button>
                    )}
                </div>
                {loading ? (
                    <div className="spinner-container">
                        <div className="spinner">
                            <div className="spinner-circle"></div>
                        </div>
                    </div>
                ) : comments.length > 0 ? (
                    <ul>
                        {comments
                            .filter(comment => !filteredSentiment || comment.sentiment === filteredSentiment)
                            .map((comment, index) => (
                                <li key={index}>
                                    <strong>{comment.username}:</strong> {comment.comment}
                                    <p>Sentiment: {comment.sentiment} (Confidence Score: {comment.sentimentScore})</p>
                                    <p>Emotion: {comment.emotion} (Confidence Score: {comment.emotionProbability})</p>
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p>No comments to display</p>
                )}
            </div>
            <div className={`visualization-container ${showVisualization ? 'show' : 'hide'}`}>
                <h2>Visualization</h2>
                <div className="counts-container">
                    <div className="emotion-counts">
                        {Object.entries(emotionCounts).map(([emotion, count]) => (
                            <div key={emotion} className="count-box">
                                {emotion}: {count}
                            </div>
                        ))}
                    </div>
                    <div className="sentiment-counts">
                        {Object.entries(sentimentCounts).map(([sentiment, count]) => (
                            <div key={sentiment} className="count-box">
                                {sentiment}: {count}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="charts-container">
                    <div className="bar-chart-container">
                        <Bar data={emotionChartData} />
                    </div>
                    <div className="bar-chart-container">
                        <Bar data={sentimentChartData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Instagram;
