import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DomainDetail({ domain, progress, onComplete, onBack }) {
  const [expandedTopic, setExpandedTopic] = useState(null);

  if (!domain) return <div>No domain selected</div>;

  const handleTopicToggle = (idx) => {
    setExpandedTopic(expandedTopic === idx ? null : idx);
  };

  const handleMarkComplete = (idx) => {
    onComplete(domain.id, idx);
  };

  const isComplete = (idx) => {
    return progress[`${domain.id}-${idx}`];
  };

  return (
    <div>
      <div className="content-header">
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '16px' }}>
          ← Back to Dashboard
        </button>
        <div className="domain-badge">Domain {domain.id} — {domain.weight} of exam</div>
        <h1>{domain.icon} {domain.title}</h1>
        <p>{domain.description}</p>
      </div>

      <div className="info-card highlight">
        <h4>📊 Exam Weight</h4>
        <p>This domain accounts for {domain.weight} of the CCNA exam. Focus your study time accordingly.</p>
      </div>

      <h2 className="section-title">Topics</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
        {domain.topics.length} topics to study — click to expand each topic
      </p>

      {domain.topics.map((topic, idx) => (
        <div key={idx} className="info-card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4>
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleTopicToggle(idx)}>
                {expandedTopic === idx ? '▼' : '▶'} {topic.title}
              </span>
              <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: isComplete(idx) ? 'var(--success)' : 'var(--text-muted)' }}>
                {isComplete(idx) ? '✓ Complete' : '○ Incomplete'}
              </span>
            </h4>
            <button
              className={`btn ${isComplete(idx) ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => handleMarkComplete(idx)}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              {isComplete(idx) ? '✓ Done' : 'Mark Complete'}
            </button>
          </div>

          {expandedTopic === idx && (
            <div style={{ marginTop: '16px' }}>
              <div className="markdown-body" style={{ marginBottom: '20px' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{topic.content}</ReactMarkdown>
              </div>

              {topic.diagram && (
                <div className="diagram-container">
                  <div dangerouslySetInnerHTML={{ __html: topic.diagram }} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
