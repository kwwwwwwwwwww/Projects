# Social Media Sentiment Analysis
This project is a Social Media Sentiment Analysis application, created using React with Vite as the frontend framework and Django as the backend framework.

## Introduction
The ability to discern sentiments from social media content has become increasingly valuable. By tapping into hidden emotional awareness, individuals can unlock a deeper understanding of themselves and others, fostering empathy and compassion in relationships. This heightened emotional awareness not only strengthens personal connections but also enables individuals to navigate social dynamics with greater finesse and authenticity.

The Social Media Sentiment Analysis project aims to assist users in comprehending the sentiments expressed in social media posts or comments shared via URL (Uniform Resource Locator) links. The project is targeted at three major social media platforms: Twitter, Instagram, and Facebook. Specifically, the program focuses on Twitter hashtags, trends, and post links, Instagram post links, and Facebook post links.

The project integrates a deep learning model that leverages the BiLSTM (Bidirectional Long Short-Term Memory) algorithm, and includes two different models: one for sentiment analysis and another for emotion classification. The sentiment model predicts whether a post is positive, negative, or neutral, while the emotion model identifies emotions such as sadness, joy, love, anger, fear, and surprise.

The sentiment analysis system developed in this project achieved an impressive accuracy of 0.92, while the emotion classification model attained an accuracy of 0.93. To enhance user understanding, visualizations were generated, offering easy-to-interpret sentiment insights. This web platform not only empowers users to analyze and understand social media sentiments but also opens up numerous opportunities for individuals to cultivate their emotional intelligence.

## Features
- User authentication and authorization.
- Real-time sentiment analysis of social media posts.
- Visualizations of sentiment data.
- Admin panel for managing users, registering user/admin page, viewing analysis history and dashboard page.

## Technologies Used

### Frontend
- React (with Vite)
- CSS (separated into its own file)

### Backend
- Django
- Django Rest Framework
- SQLite (for the database)

## Setup Instructions

### Prerequisites

- Node.js (for the frontend)
  1. Download the latest Node.js from `https://nodejs.org/en/download/prebuilt-installer`
  2. After downloading, Search for `Edit the system enviroment variables`, click on `Enviroment variables` on bottom right, Under user's variable box, click on `path` and `edit`,     Click on `new` and insert the path: `C:\Program Files\nodejs\`

- Python version 3.11.9 (for the backend)
  1. Install Python 3.11 from Microsoft Store.

### Frontend Setup

1. Open Terminal in Visual Studio Code.

2. Navigate to the `frontend` directory:
   cd frontend

3. Install the dependencies:
   npm install

4. Start the development server:
   npm run dev

### Backend Setup

1. Open new Terminal in Visual Studio Code.

2. Navigate to the `backend` directory:
   cd backend

3. (skippable) If virtual environment is not created in backend folder, create a virtual environment:
   python -m venv venv

4. Activate the virtual environment:
   #### on windows
   venv\Scripts\activate
      - If unable to create virtual enviroment, do enter this line of code in terminal: `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process`
   #### on macOS/Linux
   source venv/bin/activate

5. Install the dependencies:
   pip install -r requirements.txt

6. Apply migrations:
   python manage.py migrate

7. Start the development server:
   python manage.py runserver 

## Running the Application
1. Start both frontend and backend servers by following the setup's intructions.

2. To access the web application, in Visual Studio Code, hold `ctrl` and left-click on the frontend server URL (usually url would be `http://localhost:5173`) to open it in your browser.

## Usage
1. Open your browser and navigate to the frontend development server (usually http://localhost:5173).

2. Log in or register as a new user.

3. Analyze social media posts by entering the content and viewing the sentiment results.

4. Access the admin panel (if you are an admin) to manage users,register user/admin, viewing analysis history and access to the dashboard page.

5. The admin username and password:
   - admin
   - kaiwen2002
