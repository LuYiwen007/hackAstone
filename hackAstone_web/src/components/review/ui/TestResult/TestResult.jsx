import './TestResult.css';

export const TestResult = ({ result }) => {
  const isToday = result.status === 'today';

  return (
    <div className={`test-result ${isToday ? 'test-result-today' : 'test-result-history'}`}>
      <div className="test-result-header">
        <div className="test-result-icon">{result.icon || '📚'}</div>
        <div className="test-result-info">
          <div className="test-result-title-row">
            <h3 className="test-result-title">{result.planTitle}</h3>
            <span className={`test-result-status ${isToday ? 'status-today' : 'status-history'}`}>
              {isToday ? '今日任务' : '历史任务'}
            </span>
          </div>
          <div className="test-result-meta">
            <div className="test-result-meta-item">
              <span>{result.date}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H13V13H3V3Z" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M5 1V5M11 1V5" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="test-result-meta-item">
              <span>{result.duration}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" stroke="#4A5565" strokeWidth="1.5"/>
                <path d="M8 4V8L10 10" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="test-result-score">
        <div className="test-result-score-left">
          <div className="test-result-score-value">{result.score}分</div>
          <div className="test-result-score-desc">
            {result.level} · 答对 {result.correct}/{result.total} 题
          </div>
        </div>
        <div className="test-result-score-stats">
          <div className="test-result-stat-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#00A63E" fillOpacity="0.2"/>
              <path d="M10 4L11.5 8L15.5 8.5L12.5 11.5L13 15.5L10 13.5L7 15.5L7.5 11.5L4.5 8.5L8.5 8L10 4Z" fill="#00A63E"/>
            </svg>
            <span style={{ color: '#00A63E' }}>{result.correct}</span>
          </div>
          <div className="test-result-stat-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z" fill="#E7000B" fillOpacity="0.2"/>
              <path d="M10 4L11.5 8L15.5 8.5L12.5 11.5L13 15.5L10 13.5L7 15.5L7.5 11.5L4.5 8.5L8.5 8L10 4Z" fill="#E7000B"/>
            </svg>
            <span style={{ color: '#E7000B' }}>{result.total - result.correct}</span>
          </div>
        </div>
      </div>
      <div className="test-result-comment">
        <p className="test-result-comment-title">AI 批改评语</p>
        <p className="test-result-comment-text">{result.comment}</p>
      </div>
      {result.tags && result.tags.length > 0 && (
        <div className="test-result-tags">
          {result.tags.map((tag, index) => (
            <span key={index} className="test-result-tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

