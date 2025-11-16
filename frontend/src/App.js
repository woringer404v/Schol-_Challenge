import { useState } from 'react';
import axios from 'axios';
import LandingPage from './components/LandingPage/LandingPage';
import TutorContainer from './components/TutorContainer/TutorContainer';
import { useTheme } from './context/ThemeContext';
import './App.css';

// Configure axios base URL
axios.defaults.baseURL = 'http://127.0.0.1:8000';

function App() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'challenge'
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);

  const handleStartChallenge = (challengeId) => {
    setSelectedChallengeId(challengeId);
    setCurrentView('challenge');
  };

  const handleBackToMenu = () => {
    setCurrentView('landing');
    setSelectedChallengeId(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        {currentView === 'landing' && (
          <>
            <h1>Range Tutor</h1>
            <p>Learn data visualization concepts interactively</p>
          </>
        )}
      </header>
      <main className="App-main">
        {currentView === 'landing' ? (
          <LandingPage onStartChallenge={handleStartChallenge} />
        ) : (
          <TutorContainer
            challengeId={selectedChallengeId}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </main>
    </div>
  );
}

export default App;
