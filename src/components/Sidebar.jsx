import React from 'react';

export default function Sidebar({ currentView, selectedDomain, domains, getDomainProgress, onDomainSelect, onQuizSelect, onSelectDashboard, overallProgress, sidebarOpen }) {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h1>🌐 CCNA Prep</h1>
        <p>Complete Study Guide & Practice Tests</p>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSelectDashboard()}
        >
          <span className="nav-icon">📊</span>
          Dashboard
        </button>

        <div className="nav-section">Study Guide</div>
        {domains.map(domain => (
          <button
            key={domain.id}
            className={`nav-item ${currentView === 'domain' && selectedDomain?.id === domain.id ? 'active' : ''}`}
            onClick={() => onDomainSelect(domain)}
          >
            <span className="nav-icon">{domain.icon}</span>
            <span>{domain.title}</span>
            {getDomainProgress(domain.id) === 100 && <span className="nav-progress done" />}
          </button>
        ))}

        <div className="nav-section">Practice Tests</div>
        {domains.map(domain => (
          <button
            key={`quiz-${domain.id}`}
            className="nav-item"
            onClick={() => onQuizSelect(domain.id)}
          >
            <span className="nav-icon">📝</span>
            <span>Domain {domain.id} Quiz</span>
          </button>
        ))}

        <button
          className="nav-item"
          onClick={() => onQuizSelect('all')}
        >
          <span className="nav-icon">🏆</span>
          <span>Full Mock Exam</span>
        </button>
      </nav>

      <div className="sidebar-progress">
        <div className="progress-label">
          <span>Overall Progress</span>
          <span>{overallProgress}%</span>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
