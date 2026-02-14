import './SubjectPerformance.css';

export const SubjectPerformance = ({ subjects = [] }) => {
  return (
    <div className="subject-performance">
      <h2 className="subject-performance-title">学科表现</h2>
      <div className="subject-performance-grid">
        {subjects.map((subject, index) => {
          const percentage = (subject.score / 100) * 100;
          const isPositive = subject.change >= 0;
          
          return (
            <div key={index} className="subject-performance-item">
              <div className="subject-performance-header">
                <span className="subject-performance-name">{subject.name}</span>
                <div className="subject-performance-score">
                  <span className="subject-performance-value">{subject.score}</span>
                  <span className={`subject-performance-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '+' : ''}{subject.change}%
                  </span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {isPositive ? (
                      <path d="M8 2V14M8 2L12 6M8 2L4 6" stroke={isPositive ? '#00A63E' : '#E7000B'} strokeWidth="2" strokeLinecap="round"/>
                    ) : (
                      <path d="M8 14V2M8 14L12 10M8 14L4 10" stroke="#E7000B" strokeWidth="2" strokeLinecap="round"/>
                    )}
                  </svg>
                </div>
              </div>
              <div className="subject-performance-bar">
                <div 
                  className="subject-performance-bar-fill" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: subject.color || '#2B7FFF'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

