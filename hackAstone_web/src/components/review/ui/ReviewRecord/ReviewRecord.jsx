import './ReviewRecord.css';

export const ReviewRecord = ({ record }) => {
  const isToday = record.status === 'today';

  return (
    <div className="review-record">
      <div className="review-record-header">
        <div className="review-record-icon">{record.icon || '📚'}</div>
        <div className="review-record-info">
          <div className="review-record-title-row">
            <h3 className="review-record-title">{record.planTitle}</h3>
            <span className={`review-record-status ${isToday ? 'status-today' : 'status-past'}`}>
              {isToday ? '当日完成' : '以往完成'}
            </span>
          </div>
          <div className="review-record-meta">
            <div className="review-record-meta-item">
              <span>{record.date}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H13V13H3V3Z" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M5 1V5M11 1V5" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="review-record-meta-item">
              <span>{record.timeRange}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" stroke="#4A5565" strokeWidth="1.5"/>
                <path d="M8 4V8L10 10" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="review-record-duration">{record.duration}</span>
          </div>
        </div>
      </div>
      <div className="review-record-summary">
        <p className="review-record-summary-title">学习总结</p>
        <p className="review-record-summary-text">{record.summary}</p>
      </div>
      {record.tags && record.tags.length > 0 && (
        <div className="review-record-tags">
          {record.tags.map((tag, index) => (
            <span key={index} className="review-record-tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};
