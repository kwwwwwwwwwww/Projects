import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FacebookEmbed } from 'react-social-media-embed';
import '../styles/facebook.css';
import '../styles/LoadingSpinner.css'; 
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

const FacebookComment = () => {
  const [url, setUrl] = useState('');
  const [comments, setComments] = useState([]);
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
  const [filteredSentiment, setFilteredSentiment] = useState('');
  const sentimentChartRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setComments([]); 
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

    try {
      const accessToken = localStorage.getItem('access');
      const response = await axios.post(
        'http://localhost:8000/api/scrape_facebookcomments/', 
        { url },
        {
          headers: {
              Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const fetchedComments = response.data;

      const analyzedComments = await Promise.all(fetchedComments.map(async (comment) => {
        const sentimentResponse = await axios.post(
          'http://localhost:8000/api/predict_sentiment/',
          { text: comment.comment },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        const emotionResponse = await axios.post(
          'http://localhost:8000/api/predict_emotion/',
          { text: comment.comment },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        const analyzedReplies = await Promise.all(comment.replies.map(async (reply) => {
          const replySentimentResponse = await axios.post(
            'http://localhost:8000/api/predict_sentiment/',
            { text: reply.text },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );

          const replyEmotionResponse = await axios.post(
            'http://localhost:8000/api/predict_emotion/',
            { text: reply.text },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );

          return {
            ...reply,
            sentiment: replySentimentResponse.data.label,
            sentimentScore: replySentimentResponse.data.score,
            emotion: replyEmotionResponse.data.emotion,
            emotionProbability: replyEmotionResponse.data.probability
          };
        }));

        return {
          ...comment,
          sentiment: sentimentResponse.data.label,
          sentimentScore: sentimentResponse.data.score,
          emotion: emotionResponse.data.emotion,
          emotionProbability: emotionResponse.data.probability,
          replies: analyzedReplies
        };
      }));

      setComments(analyzedComments);
      calculateCounts(analyzedComments);

      await axios.post(
        'http://localhost:8000/api/facebook-history/',
        {
            username: user.username,
            url: url,
            results: JSON.stringify(analyzedComments)
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
      );

    } catch (error) {
      console.error('Error fetching comments:', error);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setUrl('');
    setComments([]);
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
      comment.replies.forEach(reply => {
        if (reply.emotion in emotions) {
          emotions[reply.emotion]++;
        }
        if (reply.sentiment in sentiments) {
          sentiments[reply.sentiment]++;
        }
      });
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
      <h2>Facebook Comment Scraper</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Facebook Post URL"
          required
        />
        <button type="submit" className="facebook-button" disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Comments'}
        </button>
        <button type="button" className="facebook-reset-button" onClick={handleReset}>Reset</button>
        <button type="button" className="facebook-visualization-button" onClick={handleToggleVisualization}>
          {showVisualization ? 'Back' : 'Get Visualization'}
        </button>
      </form>
      <div className={`facebook-comments-container ${showVisualization ? 'slide-left' : 'slide-right'}`}>
        <div className="facebook-container">
          <h2>Embedded Facebook Post:</h2>
          {url ? (
            <FacebookEmbed url={url} width={500} />
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
      <div className={`fb-comments-container ${showVisualization ? 'slide-left' : 'slide-right'}`}>
        <div className="comments-header">
          <h2>Comments:</h2>
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
                  <p><strong>{comment.name}:</strong> {comment.comment} {comment.emojis.join(' ')}</p>
                  <p>Sentiment: {comment.sentiment} (Confidence Score: {typeof comment.sentimentScore === 'number' ? comment.sentimentScore.toFixed(2) : 'N/A'})</p>
                  <p>Emotion: {comment.emotion} (Confidence Score: {typeof comment.emotionProbability === 'number' ? comment.emotionProbability.toFixed(2) : 'N/A'})</p>
                  {comment.replies.length > 0 && (
                    <div style={{ marginLeft: '20px' }}>
                      <h4>Replies:</h4>
                      {comment.replies.map((reply, replyIndex) => (
                        <div key={replyIndex} style={{ marginBottom: '10px' }}>
                          <p><strong>{reply.name}:</strong> {reply.text} {reply.emojis.join(' ')}</p>
                          <p>Sentiment: {reply.sentiment} (Confidence Score: {typeof reply.sentimentScore === 'number' ? reply.sentimentScore.toFixed(2) : 'N/A'})</p>
                          <p>Emotion: {reply.emotion} (Confidence Score: {typeof reply.emotionProbability === 'number' ? reply.emotionProbability.toFixed(2) : 'N/A'})</p>
                        </div>
                      ))}
                    </div>
                  )}
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
            <Bar 
              data={sentimentChartData} 
              onClick={handlePieChartClick} 
              ref={sentimentChartRef} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookComment;
