import React, { useState } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Home() {

    const navigate = useNavigate();

    const toSentencePage = async () => {
        navigate("/sentence");
    };
    
    const toTwitterHashtagPage = () => {
        navigate("/twitter-hashtag");
    };

    const toTwitterTrendsPage = () => {
        navigate("/twitter-trend");
    };

    const toTwitterCommentsPage = () => {
        navigate("/twitter-comment");
    };

    const toInstagramPage = () => {
        navigate("/instaComments");
    };

    const toFacebookPage = () => {
        navigate("/FacebookComment");
    };
    return (
        <div>
            <h1 style={{ textAlign: 'center', fontSize: '3rem', marginTop: '50px' }}>Sentiment Analysis</h1>
            <p style={{ textAlign: 'center', marginTop: '50px' }}>This website is dedicated to sentiment analysis. Please select from the following options: sentences or URL.</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '70px' }}>
                <Stack spacing={2} direction="row">
                    <Button variant="outlined" onClick={toSentencePage}>Sentence</Button>
                    <Button variant="outlined" onClick={toTwitterHashtagPage}>TwitterHashtag</Button>
                    <Button variant="outlined" onClick={toTwitterTrendsPage}>TwitterTrend</Button>
                    <Button variant="outlined" onClick={toTwitterCommentsPage}>TwitterComment</Button>
                    <Button variant="outlined" onClick={toInstagramPage}>Instagram</Button>
                    <Button variant="outlined" onClick={toFacebookPage}>Facebook</Button>
                </Stack>
            </div>
        </div>
    );
}

export default Home;
