import React from 'react';
import { questions } from '../data/questions';

export default function Dashboard({ domains, getDomainProgress, onDomainSelect, onQuizSelect, overallProgress, totalQuestions }) {
  const totalTopics = domains.reduce((sum, d) => sum + d.topics.length, 0);

  const domainStats = domains.map(domain => ({
    ...domain,
    progress: getDomainProgress(domain.id),
    topicCount: domain.topics.length,
    quizCount: questions.filter(q => q.domain === domain.id).length
  }));

  return (
    <div>
      <div className="content-header">
        <h1>CCNA Exam Prep</h1>
        <p>Complete study guide with {domains.length} domains, {totalTopics} topics, {totalQuestions} practice questions, and interactive diagrams</p>
      </div>

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
          <div className="stat-detail">Keep studying!</div>
        </div>
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
                style={{ width: `${domain.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Quick Start</h2>
      <div className="dashboard-grid">
        <div
          className="stat-box"
          style={{ cursor: 'pointer' }}
          onClick={() => onQuizSelect('all')}
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
            onClick={() => onQuizSelect(domain.id)}
          >
            <div className="stat-title">{domain.icon} {domain.title}</div>
            <div className="stat-value">{domain.quizCount}</div>
            <div className="stat-detail">Practice questions</div>
          </div>
        ))}
      </div>
    </div>
  );
}
