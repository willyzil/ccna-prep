import React, { useState, useEffect } from 'react';

export default function EnhancedQuiz({ domainId, questions: allQuestions, onBack }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    let filtered;
    if (domainId === 'all') {
      filtered = [...allQuestions];
    } else {
      filtered = allQuestions.filter(q => q.domain === domainId);
    }
    // Shuffle
    filtered = filtered.sort(() => Math.random() - 0.5);
    setQuizQuestions(filtered);
  }, [domainId, allQuestions]);

  const showFeedback = (message, type) => {
    setFeedback({ show: true, message, type });
    setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 2000);
  };

  const handleAnswer = (answerIdx) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIdx);
    setShowExplanation(true);
    const isCorrect = answerIdx === quizQuestions[currentQ].correct;
    
    // Calculate points based on streak and correctness
    let pointsEarned = isCorrect ? 10 + (streak * 2) : 0;
    if (isCorrect) {
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak);
        }
        return newStreak;
      });
      setPoints(prev => prev + pointsEarned);
      showFeedback(`Great! +${pointsEarned} points!`, 'success');
    } else {
      setStreak(0);
      showFeedback('Incorrect. Keep trying!', 'error');
    }

    setAnswers(prev => [...prev, {
      question: quizQuestions[currentQ].question,
      selected: answerIdx,
      correct: quizQuestions[currentQ].correct,
      isCorrect
    }]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 < quizQuestions.length) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
      // Award badges based on performance
      const percentage = (score / quizQuestions.length) * 100;
      const newBadges = [];
      
      if (percentage >= 90) {
        newBadges.push({ id: 'perfect', name: 'Perfect Score', icon: '🏆' });
      }
      if (percentage >= 80) {
        newBadges.push({ id: 'excellent', name: 'Excellent', icon: '⭐' });
      }
      if (streak >= 5) {
        newBadges.push({ id: 'streak', name: 'Streak Master', icon: '🔥' });
      }
      
      if (newBadges.length > 0) {
        setBadges(prev => [...prev, ...newBadges]);
        showFeedback(`Earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`, 'success');
      }
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
    setIsComplete(false);
    setStreak(0);
    setMaxStreak(0);
    setPoints(0);
    setFeedback({ show: false, message: '', type: '' });
  };

  if (quizQuestions.length === 0) {
    return (
      <div className="content-header">
        <h1>Loading quiz...</h1>
      </div>
    );
  }

  if (isComplete) {
    const passed = (score / quizQuestions.length) >= 0.72;
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    return (
      <div className="quiz-container">
        <div className="results-card">
          <h1>Quiz Complete!</h1>
          
          {/* Score display with visual feedback */}
          <div className={`score-circle ${passed ? 'pass' : 'fail'}`}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{percentage}%</div>
            <div className="score-label">{passed ? 'PASSED' : 'NEEDS REVIEW'}</div>
            <div className="score-stats">
              <div>Points: {points}</div>
              <div>Best Streak: {maxStreak}</div>
            </div>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {passed ? 'Great job! You have a solid understanding of this domain.' : 'Review the topics you missed and try again.'}
          </p>
          
          {/* Badges earned */}
          {badges.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Badges Earned</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {badges.map((badge, index) => (
                  <div key={index} className="badge" style={{ 
                    padding: '8px 12px', 
                    borderRadius: '20px', 
                    backgroundColor: 'var(--primary)', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>{badge.icon}</span>
                    <span>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="results-stats">
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{score}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--error)' }}>{quizQuestions.length - score}</div>
              <div className="stat-label">Incorrect</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{quizQuestions.length}</div>
              <div className="stat-label">Total Questions</div>
            </div>
          </div>
          
          <h3 style={{ margin: '32px 0 16px', color: 'var(--text-primary)' }}>Question Review</h3>
          {answers.map((ans, idx) => (
            <div key={idx} className="info-card" style={{ marginBottom: '12px', borderLeftColor: ans.isCorrect ? 'var(--success)' : 'var(--error)' }}>
              <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '8px' }}>
                {idx + 1}. {ans.question}
              </p>
              <p style={{ fontSize: '0.85rem', color: ans.isCorrect ? 'var(--success)' : 'var(--error)' }}>
                Your answer: {ans.selected !== undefined ? String.fromCharCode(65 + ans.selected) : 'N/A'}
                {!ans.isCorrect && ` | Correct: ${String.fromCharCode(65 + ans.correct)}`}
              </p>
            </div>
          ))}
          
          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleRestart}>Try Again</button>
            <button className="btn btn-secondary" onClick={onBack}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const q = quizQuestions[currentQ];
  const progressPercent = ((currentQ + 1) / quizQuestions.length) * 100;
  const currentStreak = streak;

  return (
    <div className="quiz-container">
      {/* Feedback Notification */}
      {feedback.show && (
        <div className={`feedback-notification ${feedback.type}`}>
          <span style={{ marginRight: '8px' }}>{feedback.message}</span>
        </div>
      )}
      
      <div className="quiz-header">
        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px' }}>← Exit</button>
        
        {/* Progress bar and streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {currentQ + 1} / {quizQuestions.length}
          </span>
        </div>
        
        {/* Points and Streak display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="streak-display" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: 'var(--accent)',
            color: 'white'
          }}>
            <span>🔥</span>
            <span>{currentStreak}</span>
          </div>
          <div className="points-display" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary)',
            color: 'white'
          }}>
            <span>⭐</span>
            <span>{points}</span>
          </div>
        </div>
      </div>

      <div className="question-card">
        <div className="q-number">
          Question {currentQ + 1} of {quizQuestions.length} — {q.topic}
        </div>
        <div className="q-text">{q.question}</div>

        {q.options.map((option, idx) => {
          let className = 'answer-option';
          if (showExplanation) {
            className += ' disabled';
            if (idx === q.correct) className += ' correct';
            else if (idx === selectedAnswer && idx !== q.correct) className += ' incorrect';
          } else if (idx === selectedAnswer) {
            className += ' selected';
          }

          return (
            <button
              key={idx}
              className={className}
              onClick={() => handleAnswer(idx)}
              disabled={showExplanation}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: `2px solid ${
                  showExplanation && idx === q.correct ? 'var(--success)' :
                  showExplanation && idx === selectedAnswer && idx !== q.correct ? 'var(--error)' :
                  'var(--border)'
                }`,
                marginRight: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: showExplanation && idx === q.correct ? 'var(--success)' :
                       showExplanation && idx === selectedAnswer && idx !== q.correct ? 'var(--error)' :
                       'var(--text-muted)'
              }}>
                {String.fromCharCode(65 + idx)}
              </span>
              {option}
              {showExplanation && idx === q.correct && <span style={{ float: 'right', color: 'var(--success)' }}>✓</span>}
              {showExplanation && idx === selectedAnswer && idx !== q.correct && <span style={{ float: 'right', color: 'var(--error)' }}>✗</span>}
            </button>
          );
        })}

        {showExplanation && (
          <div className="explanation">
            <h4>Explanation</h4>
            <p>{q.explanation}</p>
          </div>
        )}
      </div>

      <div className="quiz-actions">
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Score: {score}/{currentQ + (showExplanation ? 1 : 0)} | 
          Points: {points} | 
          Current Streak: {streak}
        </div>
        {showExplanation && (
          <button className="btn btn-primary" onClick={handleNext}>
            {currentQ + 1 >= quizQuestions.length ? 'See Results' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}