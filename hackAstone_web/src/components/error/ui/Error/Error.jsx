import './Error.css';

export const Error = ({ message = '发生错误', onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <div className="error-message">{message}</div>
      {onRetry && (
        <button className="error-retry" onClick={onRetry}>
          重试
        </button>
      )}
    </div>
  );
};

