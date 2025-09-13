import React, { useState } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import '../styles/Home.css'; 
import twitter from '../Images/twitter.png';
import instagram from '../Images/instagram.png';
import facebook from '../Images/facebook.png';

function Home() {
    const [showTwitterOptions, setShowTwitterOptions] = useState(false); // State to toggle Twitter options visibility

    const navigate = useNavigate();

    const toggleTwitterOptions = () => {
        setShowTwitterOptions(!showTwitterOptions);
    };

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

    const toInstagramCommentsPage = () => {
        navigate("/instaComments");
    };

    const toFacebookCommentsPage = () => {
        navigate("/FacebookComment");
    };

    return (
        <div className="home-container">
            <div className="left-side">
                <div className="left-side-content">
                    <h1>Sentiment Analysis</h1>
                    <p>This website is dedicated to sentiment analysis. Please select from the following options: sentences or URL.</p>
                </div>
            </div>
            <div className="right-side">
                <Stack spacing={2} direction="column" className="buttons-container">
                    <Button variant="outlined" className="nav-button" onClick={toSentencePage}>Sentence</Button>
                    <Button variant="outlined" className="nav-button twitter-button" onClick={toggleTwitterOptions}>
                        <img src={twitter} alt="Twitter" className="button-icon twitter-icon" /> Twitter
                    </Button>
                    <div className={`twitter-options ${showTwitterOptions ? 'show' : ''}`}>
                        <Button variant="outlined" className="nav-button sub-option" onClick={toTwitterHashtagPage}>TwitterHashtag</Button>
                        <Button variant="outlined" className="nav-button sub-option" onClick={toTwitterTrendsPage}>TwitterTrend</Button>
                        <Button variant="outlined" className="nav-button sub-option" onClick={toTwitterCommentsPage}>TwitterComment</Button>
                    </div>
                    <Button variant="outlined" className="nav-button instagram-button" onClick={toInstagramCommentsPage}>
                        <img src={instagram} alt="Instagram" className="button-icon instagram-icon" /> Instagram
                    </Button>
                    <Button variant="outlined" className="nav-button facebook-button" onClick={toFacebookCommentsPage}>
                        <img src={facebook} alt="Facebook" className="button-icon facebook-icon" /> Facebook
                    </Button>
                </Stack>
            </div>
        </div>
    );
}

export default Home;
