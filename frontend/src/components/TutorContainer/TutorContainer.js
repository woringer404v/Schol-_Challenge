import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import InteractiveBubbleChart from '../InteractiveBubbleChart/InteractiveBubbleChart';
import styles from './TutorContainer.module.css';

const TutorContainer = ({ challengeId, onBackToMenu }) => {
  const [challengeData, setChallengeData] = useState(null);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showRangeAnimation, setShowRangeAnimation] = useState(false);

  // Fetch challenge data on mount
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/challenge/${challengeId}/`);
        setChallengeData(response.data);

        // Transform initial_data to currentPoints format
        const points = response.data.initial_data.map(point => ({
          label: point.label,
          x: point.initial_x,
          y: point.initial_y,
          z: point.initial_z,
        }));
        setCurrentPoints(points);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError('Failed to load challenge. Please ensure the backend is running.');
        setIsLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId]);

  // Handle point movement from drag interaction
  const handlePointMove = (label, newX, newY) => {
    setCurrentPoints(prevPoints =>
      prevPoints.map(point =>
        point.label === label
          ? { ...point, x: newX, y: newY }
          : point
      )
    );
  };

  // Handle submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}/api/challenge/${challengeId}/submit/`, {
        submitted_data: currentPoints,
      });

      setFeedback({
        correct: response.data.correct,
        message: response.data.feedback,
      });

      // If correct, mark challenge as completed
      if (response.data.correct) {
        const completed = JSON.parse(localStorage.getItem('completedChallenges') || '[]');
        if (!completed.includes(challengeId)) {
          completed.push(challengeId);
          localStorage.setItem('completedChallenges', JSON.stringify(completed));
        }
      }

      setIsSubmitting(false);
    } catch (err) {
      console.error('Error submitting challenge:', err);
      setFeedback({
        correct: false,
        message: 'Failed to submit. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (challengeData && challengeData.initial_data) {
      const points = challengeData.initial_data.map(point => ({
        label: point.label,
        x: point.initial_x,
        y: point.initial_y,
        z: point.initial_z,
      }));
      setCurrentPoints(points);
      setFeedback(null);
    }
  };

  // Handle hint toggle
  const handleHintToggle = () => {
    setShowHint(!showHint);
    if (!showHint) {
      // Trigger range animation when showing hint
      setShowRangeAnimation(true);
      // Reset animation after it completes (2 seconds)
      setTimeout(() => setShowRangeAnimation(false), 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading challenge...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={onBackToMenu}>
        ← Back to Challenges
      </button>

      {/* Challenge Instructions */}
      <div className={styles.instructionPanel}>
        <h2 className={styles.challengeTitle}>{challengeData?.title}</h2>
        <p className={styles.instructionText}>{challengeData?.instruction_text}</p>
        <button
          className={styles.hintButton}
          onClick={handleHintToggle}
        >
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </button>
        <div className={styles.hintContainer}>
          {showHint && (
            <div className={styles.hint}>
              <strong>Hint:</strong> Drag the bubbles to adjust their positions.
              Only the Y-axis values (Total System Length) affect the range.
            </div>
          )}
        </div>
      </div>

      {/* Interactive Chart */}
      <div className={styles.chartContainer}>
        <InteractiveBubbleChart
          points={currentPoints}
          onPointMove={handlePointMove}
          showRangeAnimation={showRangeAnimation}
          rangeMin={challengeData?.rule_value_a}
          rangeMax={challengeData?.rule_value_b}
          ruleOperator={challengeData?.rule_operator}
        />
      </div>

      {/* Controls */}
      <div className={styles.controlPanel}>
        <button
          className={`${styles.button} ${styles.submitButton}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </button>
        <button
          className={`${styles.button} ${styles.resetButton}`}
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Reset
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`${styles.feedback} ${
            feedback.correct ? styles.feedbackCorrect : styles.feedbackIncorrect
          }`}
        >
          <h3>{feedback.correct ? '✓ Correct!' : '✗ Not Quite'}</h3>
          <p>{feedback.message}</p>
        </div>
      )}
    </div>
  );
};

export default TutorContainer;
