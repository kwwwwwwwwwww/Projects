import React, { useRef, useState } from 'react';
import axios from 'axios';
import '../styles/LoadingSpinner.css';
import '../styles/TwitterTrend.css';
import '../styles/Visualization.css';
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
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const TwitterTrend = () => {
    const [trend, setTrend] = useState('');
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(false);
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
    const sentimentChartRef = useRef(null)

    const handleSearch = async (e) => {
        e.preventDefault();
        setTweets([]);
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('access');
            const response = await axios.post(
                'http://localhost:8000/api/scrape_trends/',
                { trend },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            const tweetsData = response.data;
            const analyzedTweets = await Promise.all(tweetsData.map(async tweet => {
                const sentimentResponse = await axios.post(
                    'http://localhost:8000/api/predict_sentiment/',
                    { text: tweet.tweet }
                );
                const sentimentResult = sentimentResponse.data;

                const emotionResponse = await axios.post(
                    'http://localhost:8000/api/predict_emotion/',
                    { text: tweet.tweet }
                );
                const emotionResult = emotionResponse.data;

                return {
                    ...tweet,
                    sentiment: sentimentResult.label,
                    sentimentScore: sentimentResult.score.toFixed(2),
                    emotion: emotionResult.emotion,
                    emotionProbability: emotionResult.probability.toFixed(2),
                };
            }));

            setTweets(analyzedTweets);

            calculateCounts(analyzedTweets);

            await axios.post(
                'http://localhost:8000/api/twitter-trend-history/',
                {
                    username: user.username,
                    trend: trend,
                    results: JSON.stringify(analyzedTweets)
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
        } catch (error) {
            console.error('Error fetching tweets or predicting sentiment and emotion:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setTrend('');
        setTweets([]);
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
    };

    const handleToggleVisualization = () => {
        setShowVisualization(!showVisualization);
    };

    const calculateCounts = (tweets) => {
        const emotions = { sadness: 0, joy: 0, love: 0, anger: 0, fear: 0, surprise: 0 };
        const sentiments = { Positive: 0, Neutral: 0, Negative: 0 };

        tweets.forEach(tweet => {
            if (tweet.emotion in emotions) {
                emotions[tweet.emotion]++;
            }
            if (tweet.sentiment in sentiments) {
                sentiments[tweet.sentiment]++;
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
                label: 'Sentiment Percentage',
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
        <div className="container">
            <h2>Twitter Trend</h2>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={trend}
                    onChange={(e) => setTrend(e.target.value)}
                    placeholder="Enter trends"
                    required
                />
                <button type="submit" className="twittertrend-button" disabled={loading}>
                    {loading ? 'Loading...' : 'Get Trends'}
                </button>
                <button type="button" className="twittertrend-reset-button" onClick={handleReset}>Reset</button>
                <button type="button" className="twittertrend-visualization-button" onClick={handleToggleVisualization}>
                    {showVisualization ? 'Back' : 'Get Visualization'}
                </button>
            </form>
            <div className="content-container">
                <div className={`trendresults-container ${showVisualization ? 'slide-left' : 'slide-right'}`}>
                    {loading && (
                        <div className="spinner-container">
                            <div className="spinner">
                                <div className="spinner-circle"></div>
                            </div>
                        </div>
                    )}
                    {!loading && tweets.length === 0 && (
                        <p>No trends searched</p>
                    )}
                    {tweets.length > 0 && (
                        <ul>
                            {tweets.map((tweet, index) => (
                                <li key={index}>
                                    <p>Username: {tweet.username}</p>
                                    <p>Tweet: {tweet.tweet}</p>
                                    <p>Sentiment: {tweet.sentiment} (Confidence Score: {tweet.sentimentScore})</p>
                                    <p>Emotion: {tweet.emotion} (Confidence Score: {tweet.emotionProbability})</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className={`trend-pie-chart-container ${showVisualization ? 'slide-left' : 'slide-right'}`}>
                    <h2>Pie Chart</h2>
                    <Pie
                        data={sentimentChartData}
                        ref={sentimentChartRef}
                    />
                </div>
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

export default TwitterTrend;
