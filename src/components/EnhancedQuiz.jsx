import React, { useState, useEffect, useCallback, useRef } from 'react';

const TIMER_SECONDS = 60;

export default function EnhancedQuiz({ domainId, questions: allQuestions, onBack, mode = 'basic', bookmarks, onToggleBookmark }) {
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
  const [timerActive, setTimerActive] = useState(mode === 'timer');
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [reviewMode, setReviewMode] = useState(mode === 'review');
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [showHint, setShowHint] = useState(false);

  const timerRef = useRef(null);

  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const wrongAnswersRef = useRef([]);
  useEffect(() => {
    wrongAnswersRef.current = wrongAnswers;
  }, [wrongAnswers]);

  const resetQuiz = useCallback(() => {
    let filtered;
    if (domainId === 'all') {
      filtered = [...allQuestions];
    } else {
      filtered = allQuestions.filter(q => q.domain == domainId);
    }
    if (reviewMode && wrongAnswersRef.current.length > 0) {
      filtered = allQuestions.filter(q => wrongAnswersRef.current.some(wa => wa.question === q.question));
    }
    filtered = shuffleArray(filtered);
    setQuizQuestions(filtered);
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
    setTimeLeft(TIMER_SECONDS);
    setTimerRunning(false);
    setShowHint(false);
  }, [domainId, allQuestions, reviewMode]);

  useEffect(() => {
    resetQuiz();
  }, [resetQuiz]);

  // Timer — stable interval, no recreate on isComplete
  useEffect(() => {
    if (!timerActive || !timerRunning) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    if (timeLeft <= 0) { setIsComplete(true); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); timerRef.current = null; setIsComplete(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [timerActive, timerRunning]);

  const showFeedback = (message, type) => {
    setFeedback({ show: true, message, type });
    setTimeout(() => setFeedback({ show: false, message: '', type: '' }), 2000);
  };

  const handleAnswer = (answerIdx) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIdx);
    setShowExplanation(true);
    if (timerActive && !timerRunning) {
      setTimerRunning(true);
    }

    const q = quizQuestions[currentQ];
    if (!q) return;

    const isCorrect = answerIdx === q.correct;

    if (isCorrect) {
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        const pts = 10 + newStreak * 2;
        setPoints(p => p + pts);
        showFeedback(`Great! +${pts} points!`, 'success');
        return newStreak;
      });
      setScore(s => s + 1);
    } else {
      setStreak(0);
      showFeedback('Incorrect. Keep trying!', 'error');
    }

    setAnswers(prev => [...prev, {
      question: q.question,
      selected: answerIdx,
      correct: q.correct,
      isCorrect,
      domain: q.domain,
      topic: q.topic
    }]);

    setWrongAnswers(prev => isCorrect ? prev : [...prev, q]);
  };

  const handleNext = () => {
    if (currentQ + 1 < quizQuestions.length) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowHint(false);
      setTimeLeft(TIMER_SECONDS);
    } else {
      setIsComplete(true);
      const percentage = quizQuestions.length > 0 ? (score / quizQuestions.length) * 100 : 0;
      const newBadges = [];
      if (percentage >= 90) newBadges.push({ id: 'perfect', name: 'Perfect Score', icon: '🏆' });
      if (percentage >= 80) newBadges.push({ id: 'excellent', name: 'Excellent', icon: '⭐' });
      if (maxStreak >= 3) newBadges.push({ id: 'streak', name: 'Streak Master', icon: '🔥' });
      if (newBadges.length > 0) {
        setBadges(prev => [...prev, ...newBadges]);
        showFeedback(`Earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`, 'success');
      }
    }
  };

  const handleRestart = () => { resetQuiz(); };

  const toggleHint = () => { setShowHint(prev => !prev); };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '1' && e.key <= '4' && !showExplanation && !isComplete) {
        handleAnswer(parseInt(e.key) - 1);
      } else if ((e.key === 'Enter' || e.key === 'n') && showExplanation && !isComplete) {
        handleNext();
      } else if (e.key === 'h' || e.key === 'H') {
        toggleHint();
      } else if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showExplanation, isComplete]);

  if (quizQuestions.length === 0) {
    return (
      <div className="content-header">
        <h1>Loading quiz...</h1>
      </div>
    );
  }

  if (isComplete) {
    const passed = (score / quizQuestions.length) >= 0.72;
    const percentage = quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 0;

    return (
      <div className="quiz-container">
        {feedback.show && (
          <div className={`feedback-notification ${feedback.type}`}>
            <span style={{ marginRight: '8px' }}>{feedback.message}</span>
          </div>
        )}

        <div className="results-card">
          <h1>Quiz Complete!</h1>

          <div className={`score-circle ${passed ? 'pass' : 'fail'}`}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{percentage}%</div>
            <div className="score-label">{passed ? 'PASSED' : 'NEEDS REVIEW'}</div>
            <div className="score-stats">
              <div>⭐ Points: {points}</div>
              <div>🔥 Best Streak: {maxStreak}</div>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {passed ? 'Great job! You have a solid understanding of this domain.' : 'Review the topics you missed and try again.'}
          </p>

          {badges.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Badges Earned</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {badges.map((badge, index) => (
                  <div key={index} className="badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent)' }}>{points}</div>
              <div className="stat-label">Total Points</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{maxStreak}</div>
              <div className="stat-label">Best Streak</div>
            </div>
          </div>

          {wrongAnswers.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Wrong Answers ({wrongAnswers.length})</h3>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const wrongOnly = allQuestions.filter(q => wrongAnswers.some(wa => wa.question === q.question));
                  setQuizQuestions(shuffleArray(wrongOnly));
                  setReviewMode(true);
                  setCurrentQ(0);
                  setSelectedAnswer(null);
                  setShowExplanation(false);
                  setScore(0);
                  setAnswers([]);
                  setIsComplete(false);
                  setStreak(0);
                  setMaxStreak(0);
                  setPoints(0);
                  setBadges([]);
                  setWrongAnswers([]);
                }}
              >
                🔄 Study Wrong Answers ({wrongAnswers.length} questions)
              </button>
            </div>
          )}

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

          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleRestart}>Try Again</button>
            <button className="btn btn-secondary" onClick={onBack}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const q = quizQuestions[currentQ];
  const progressPercent = ((currentQ + 1) / quizQuestions.length) * 100;
  const isBookmarked = bookmarks && bookmarks[`${q.domain}-${q.topic}`];

  return (
    <div className="quiz-container">
      {feedback.show && (
        <div className={`feedback-notification ${feedback.type}`}>
          <span style={{ marginRight: '8px' }}>{feedback.message}</span>
        </div>
      )}

      {timerActive && (
        <div style={{
          textAlign: 'center',
          padding: '8px 16px',
          marginBottom: '12px',
          borderRadius: '8px',
          background: timeLeft <= 10 ? 'var(--error-light)' : timeLeft <= 30 ? 'var(--warning-light)' : 'var(--bg-card)',
          border: `1px solid ${timeLeft <= 10 ? 'var(--error)' : timeLeft <= 30 ? 'var(--warning)' : 'var(--border)'}`,
          color: timeLeft <= 10 ? 'var(--error)' : timeLeft <= 30 ? 'var(--warning)' : 'var(--text-primary)',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>
          ⏱ {timeLeft}s remaining
          {!timerRunning && <span style={{ fontSize: '0.75rem', marginLeft: '8px', color: 'var(--text-muted)' }}>(Answer to start timer)</span>}
        </div>
      )}

      <div className="quiz-header">
        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px' }}>← Exit</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {currentQ + 1} / {quizQuestions.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="streak-display" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 8px', borderRadius: '12px',
            background: 'var(--accent)', color: 'white'
          }}>
            <span>🔥</span>
            <span>{streak}</span>
          </div>
          <div className="points-display" style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 8px', borderRadius: '12px',
            background: 'var(--warning)', color: 'white'
          }}>
            <span>⭐</span>
            <span>{points}</span>
          </div>
        </div>
      </div>

      <div className="question-card">
        <div className="q-number" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Question {currentQ + 1} of {quizQuestions.length} — {q.topic}</span>
          <button
            className="btn btn-secondary"
            onClick={() => onToggleBookmark && onToggleBookmark(`${q.domain}-${q.topic}`)}
            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '6px' }}
          >
            {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
        </div>
        <div className="q-text">{q.question}</div>

        {showHint && (
          <div className="info-card" style={{ marginBottom: '12px', borderLeftColor: 'var(--warning)', background: 'var(--warning-light)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--warning)', margin: 0 }}>💡 Hint: {q.explanation.split('. ').slice(0, 1).join('.')}</p>
          </div>
        )}

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
              <span style={{ flex: 1 }}>[{idx + 1}]</span>
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Score: {score}/{currentQ + (showExplanation ? 1 : 0)} | Points: {points} | Streak: {streak}
          </span>
          <button className="btn btn-secondary" onClick={toggleHint} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
        </div>
        {showExplanation && (
          <button className="btn btn-primary" onClick={handleNext}>
            {currentQ + 1 >= quizQuestions.length ? 'See Results' : 'Next Question →'}
          </button>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        Keys: 1-4 = select answer | Enter/N = next | H = hint | Esc = exit
      </div>
    </div>
  );
}
