import React, { useState, useEffect, useCallback } from 'react';

export default function Quiz({ domainId, questions: allQuestions, onBack }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);

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

  const handleAnswer = (answerIdx) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIdx);
    setShowExplanation(true);
    const isCorrect = answerIdx === quizQuestions[currentQ].correct;
    setAnswers(prev => [...prev, {
      question: quizQuestions[currentQ].question,
      selected: answerIdx,
      correct: quizQuestions[currentQ].correct,
      isCorrect
    }]);
    if (isCorrect) setScore(prev => prev + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 < quizQuestions.length) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
    setIsComplete(false);
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
    return (
      <div className="quiz-container">
        <div className="results-card">
          <h1>Quiz Complete!</h1>
          <div className={`score-circle ${passed ? 'pass' : 'fail'}`}>
            {Math.round((score / quizQuestions.length) * 100)}%
            <div className="score-label">{passed ? 'PASSED' : 'NEEDS REVIEW'}</div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {passed ? 'Great job! You have a solid understanding of this domain.' : 'Review the topics you missed and try again.'}
          </p>
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
                Your answer: {ans.question.split('?')[0] ? ans.selected : 'N/A'}
                {!ans.isCorrect && ` | Correct: ${ans.correct}`}
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

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px' }}>← Exit</button>
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {currentQ + 1} / {quizQuestions.length}
        </span>
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
          Score: {score}/{currentQ + (showExplanation ? 1 : 0)}
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
