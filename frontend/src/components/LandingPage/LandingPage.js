import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import styles from './LandingPage.module.css';

const LandingPage = ({ onStartChallenge }) => {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/challenges/`);
        setChallenges(response.data);

        // Load completed challenges from localStorage
        const completed = JSON.parse(localStorage.getItem('completedChallenges') || '[]');
        setCompletedChallenges(new Set(completed));

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading challenges...</div>
      </div>
    );
  }

  const completedCount = completedChallenges.size;
  const totalCount = challenges.length;

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Range Tutor</h1>
        <p className={styles.subtitle}>Master the concept of Range in Data Visualization</p>
      </div>

      <div className={styles.content}>
        <section className={styles.conceptSection}>
          <h2>What is Range?</h2>
          <p className={styles.definition}>
            In data visualization and mathematics, the <strong>range</strong> is the set of all possible output values,
            which are typically shown on the <strong>Y-axis</strong> of a graph.
          </p>

          <div className={styles.examples}>
            <div className={styles.exampleCard}>
              <h3>Range = All Y-values</h3>
              <p>The range includes every value from the minimum to the maximum on the Y-axis.</p>
            </div>

            <div className={styles.exampleCard}>
              <h3>Visual Representation</h3>
              <p>Think of the range as a vertical band covering all data points from top to bottom.</p>
            </div>

            <div className={styles.exampleCard}>
              <h3>Interactive Learning</h3>
              <p>Drag points to adjust their Y-values and see how the range changes in real-time!</p>
            </div>
          </div>
        </section>

        <section className={styles.progressSection}>
          <h2>Your Progress</h2>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          <p className={styles.progressText}>
            {completedCount} of {totalCount} challenges completed
          </p>
        </section>

        <section className={styles.challengesSection}>
          <h2>Available Challenges</h2>
          <div className={styles.challengeGrid}>
            {challenges.map((challenge, index) => {
              const isCompleted = completedChallenges.has(challenge.id);

              return (
                <div
                  key={challenge.id}
                  className={`${styles.challengeCard} ${isCompleted ? styles.completed : ''}`}
                >
                  <div className={styles.challengeNumber}>Challenge {index + 1}</div>
                  {isCompleted && <div className={styles.completedBadge}>✓ Completed</div>}
                  <h3>{challenge.title}</h3>
                  <p className={styles.challengeDescription}>
                    {challenge.instruction_text}
                  </p>
                  <button
                    className={styles.startButton}
                    onClick={() => onStartChallenge(challenge.id)}
                  >
                    {isCompleted ? 'Try Again' : 'Start Challenge'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
