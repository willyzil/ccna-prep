import React, { useState, useEffect, useCallback } from 'react';
import { domains } from './data/domains';
import { questions } from './data/questions';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DomainDetail from './components/DomainDetail';
import Quiz from './components/Quiz';
import { getProgress, saveProgress } from './utils/storage';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progress, setProgress] = useState(getProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const markTopicComplete = useCallback((domainId, topicIndex) => {
    const key = `${domainId}-${topicIndex}`;
    setProgress(prev => ({ ...prev, [key]: true }));
  }, []);

  const getDomainProgress = useCallback((domainId) => {
    const domain = domains.find(d => d.id === domainId);
    if (!domain) return 0;
    const total = domain.topics.length;
    const completed = domain.topics.reduce((count, _, idx) => {
      return count + (progress[`${domainId}-${idx}`] ? 1 : 0);
    }, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [progress]);

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
    setCurrentView('domain');
    setSidebarOpen(false);
  };

  const handleQuizSelect = (domainId) => {
    setSelectedDomain(domainId);
    setCurrentView('quiz');
    setSidebarOpen(false);
  };

  const handleNavBack = () => {
    setCurrentView('dashboard');
    setSidebarOpen(false);
  };

  const totalDomains = domains.length;
  const completedDomains = domains.filter(d => getDomainProgress(d.id) === 100).length;
  const overallProgress = totalDomains > 0 ? Math.round((completedDomains / totalDomains) * 100) : 0;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            domains={domains}
            getDomainProgress={getDomainProgress}
            onDomainSelect={handleDomainSelect}
            onQuizSelect={handleQuizSelect}
            overallProgress={overallProgress}
            totalQuestions={questions.length}
          />
        );
      case 'domain':
        return (
          <DomainDetail
            domain={selectedDomain}
            progress={progress}
            onComplete={markTopicComplete}
            onBack={handleNavBack}
          />
        );
      case 'quiz':
        return (
          <Quiz
            domainId={selectedDomain}
            questions={questions}
            onBack={handleNavBack}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout" style={{ minHeight: '100vh' }}>
      <div className={`mobile-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar
        currentView={currentView}
        selectedDomain={selectedDomain}
        domains={domains}
        getDomainProgress={getDomainProgress}
        onDomainSelect={handleDomainSelect}
        onQuizSelect={handleQuizSelect}
        onSelectDashboard={handleNavBack}
        overallProgress={overallProgress}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <div className="mobile-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>&#9776;</button>
          <h1>&#127760; CCNA Prep</h1>
          <div style={{ width: "40px" }} />
        </div>
        <main className="main-content">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
