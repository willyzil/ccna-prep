import React from 'react';
import { questions } from '../data/questions';

export default function Dashboard({ domains, getDomainProgress, onDomainSelect, onQuizSelect, overallProgress, totalQuestions, bookmarks, history, totalBookmarks, onResetProgress }) {
  const totalTopics = domains.reduce((sum, d) => sum + d.topics.length, 0);

  const domainStats = domains.map(domain => ({
    ...domain,
    progress: getDomainProgress(domain.id),
    topicCount: domain.topics.length,
    quizCount: questions.filter(q => q.domain === domain.id).length
  }));

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayStats = history[today] || null;
  const last7Days = Object.entries(history)
    .filter(([date]) => {
      const d = new Date(date);
      const diff = (new Date() - d) / (1000 * 60 * 60 * 24);
      return diff <= 7 && diff >= 0;
    })
    .map(([date, stats]) => ({ date, ...stats }));

  const totalAttempts = last7Days.reduce((sum, day) => sum + day.total, 0);
  const totalCorrect = last7Days.reduce((sum, day) => sum + day.correct, 0);
  const avgScore = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Function to start quiz
  const startQuiz = (domainId, mode = 'basic') => {
    onQuizSelect(domainId, mode);
  };

  const getModeButton = (mode, label, icon, description) => (
    <div
      className="stat-box"
      style={{ cursor: 'pointer', padding: '12px' }}
      onClick={() => onQuizSelect('all', mode)}
    >
      <div className="stat-title">{icon} {label}</div>
      <div className="stat-detail">{description}</div>
    </div>
  );

  return (
    <div>
      <div className="content-header">
        <h1>CCNA Exam Prep</h1>
        <p>Complete study guide with {domains.length} domains, {totalTopics} topics, {totalQuestions} practice questions</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-box">
          <div className="stat-title">Domains</div>
          <div className="stat-value">{domains.length}</div>
          <div className="stat-detail">All CCNA exam topics</div>
        </div>
        <div className="stat-box">
          <div className="stat-title">Topics</div>
          <div className="stat-value">{totalTopics}</div>
          <div className="stat-detail">Study topics covered</div>
        </div>
        <div className="stat-box">
          <div className="stat-title">Questions</div>
          <div className="stat-value">{totalQuestions}</div>
          <div className="stat-detail">Practice exam questions</div>
        </div>
        <div className="stat-box">
          <div className="stat-title">Overall Progress</div>
          <div className="stat-value">{overallProgress}%</div>
          <div className="stat-detail">{domains.filter(d => getDomainProgress(d.id) === 100).length} of {domains.length} domains complete</div>
        </div>
      </div>

      {/* Study Stats */}
      {last7Days.length > 0 && (
        <div className="info-card" style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>📊 Study Stats (Last 7 Days)</h4>
          <div className="dashboard-grid" style={{ margin: 0 }}>
            <div>
              <div className="stat-title">Total Attempts</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>{totalAttempts}</div>
            </div>
            <div>
              <div className="stat-title">Avg Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: avgScore >= 72 ? 'var(--success)' : 'var(--warning)' }}>{avgScore}%</div>
            </div>
            <div>
              <div className="stat-title">Correct Answers</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{totalCorrect}/{totalAttempts}</div>
            </div>
            {totalBookmarks > 0 && (
              <div>
                <div className="stat-title">Bookmarked Questions</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>{totalBookmarks}</div>
              </div>
            )}
          </div>
          {/* Recent performance */}
          {last7Days.length > 1 && (
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {last7Days.slice(-3).map(day => (
                <span key={day.date} style={{ marginRight: '12px' }}>
                  {day.date.substring(5)}: {day.correct}/{day.total} ({day.total > 0 ? Math.round((day.correct/day.total)*100) : 0}%)
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quiz Modes */}
      <h2 className="section-title">Quiz Modes</h2>
      <div className="dashboard-grid">
        {getModeButton('basic', 'Basic Quiz', '📝', 'Simple quiz with explanations')}
        {getModeButton('enhanced', 'Enhanced Quiz', '🎮', 'Points, streaks, badges')}
        {getModeButton('timer', 'Timer Mode', '⏱️', `${String(60)}s limit per question`)}
      </div>

      <h2 className="section-title">Study Guide</h2>
      <div className="domain-cards">
        {domainStats.map(domain => (
          <div
            key={domain.id}
            className="domain-card"
            onClick={() => onDomainSelect(domain)}
          >
            <div className="domain-number">{domain.id}</div>
            <h3>{domain.icon} {domain.title}</h3>
            <p>{domain.description}</p>
            <div className="domain-stats">
              <span>{domain.topicCount} topics</span>
              <span>•</span>
              <span>{domain.quizCount} questions</span>
              <span>•</span>
              <span>{domain.weight}</span>
            </div>
            <div className="progress-bar-bg" style={{ marginTop: '12px' }}>
              <div
                className="progress-bar-fill"
                style={{ width: String(domain.progress) + '%' }}
              />
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-small btn-primary"
                onClick={(e) => { e.stopPropagation(); startQuiz(domain.id, 'basic'); }}
              >
                📝 Basic
              </button>
              <button
                className="btn btn-small btn-secondary"
                onClick={(e) => { e.stopPropagation(); startQuiz(domain.id, 'enhanced'); }}
              >
                🎮 Enhanced
              </button>
              <button
                className="btn btn-small btn-secondary"
                onClick={(e) => { e.stopPropagation(); startQuiz(domain.id, 'timer'); }}
              >
                ⏱️ Timer
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Quick Start</h2>
      <div className="dashboard-grid">
        <div
          className="stat-box"
          style={{ cursor: 'pointer' }}
          onClick={() => onQuizSelect('all', 'basic')}
        >
          <div className="stat-title">🏆 Full Mock Exam</div>
          <div className="stat-value">{totalQuestions}</div>
          <div className="stat-detail">All domains mixed</div>
        </div>
        {domainStats.slice(0, 4).map(domain => (
          <div
            key={`qs-${domain.id}`}
            className="stat-box"
            style={{ cursor: 'pointer' }}
            onClick={() => onQuizSelect(domain.id, 'basic')}
          >
            <div className="stat-title">{domain.icon} {domain.title}</div>
            <div className="stat-value">{domain.quizCount}</div>
            <div className="stat-detail">Practice questions</div>
          </div>
        ))}
      </div>

      {/* Reset Progress */}
      {onResetProgress && (
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button
            className="btn"
            onClick={onResetProgress}
            style={{ padding: '8px 20px', fontSize: '0.8rem', background: 'var(--error-light)', color: 'var(--error)', border: '1px solid var(--error)' }}
          >
            🗑 Reset All Progress & Bookmarks
          </button>
        </div>
      )}
    </div>
  );
}
