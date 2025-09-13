import React, { useState } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import api from "../api";

function SentencePage() {
    const [inputText, setInputText] = useState('');
    const [analysisResults, setAnalysisResults] = useState([]);

    const handleSubmit = async () => {
        try {
            setAnalysisResults([]);

            const sentimentResponse = await api.post('/api/predict_sentiment/', { text: inputText });
            const sentimentResult = sentimentResponse.data;

            const emotionResponse = await api.post('/api/predict_emotion/', { text: inputText });
            const emotionResult = emotionResponse.data;

            setAnalysisResults(prevResults => [
                ...prevResults,
                { type: 'Sentiment', ...sentimentResult },
                { type: 'Emotion', ...emotionResult }
            ]);

        } catch (error) {
            console.error('Error:', error);
            setAnalysisResults([{ type: 'Error', label: 'Error', score: 'N/A', probability: 'N/A' }]); 
        }
    };

    const handleReset = () => {
        setInputText('');
        setAnalysisResults([]); 
    };

    return (
        <div>
            <h1 style={{ textAlign: 'center', fontSize: '3rem', marginTop: '50px' }}>Sentence Analysis</h1>
            <p style={{ textAlign: 'center' }}>Use sentiment and emotion analysis to quickly detect feelings and pain points.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>                
                <textarea
                    id="analysisInput"
                    placeholder="Type your sentence here"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    style={{ width: '300px', height: '50px', marginRight: '10px' }}
                ></textarea>
                <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginTop: '20px', marginBottom: '20px' }}>
                    {analysisResults.length > 0 &&
                        analysisResults.map((item, index) => (
                            <div key={index}>
                                <p>{item.type} - Predicted: {item.label || item.emotion}</p>
                                <p>Confidence Score: {item.score ? item.score.toFixed(2) : item.probability.toFixed(2)}</p>
                            </div>
                        ))}
                    {analysisResults.length === 0 && <p>No results to display</p>}
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Stack spacing={2} direction="row">
                    <Button variant="outlined" onClick={handleSubmit}>Submit</Button>
                    <Button variant="outlined" onClick={handleReset}>Reset</Button>
                </Stack>
            </div>
        </div>
    );
}

export default SentencePage;
