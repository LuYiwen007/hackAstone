import './AIChatMessage.css';

export const AIChatMessage = ({ message }) => {
  const isUser = message.role === 'USER';
  
  return (
    <div className={`ai-chat-message ${isUser ? 'ai-chat-message-user' : 'ai-chat-message-assistant'}`}>
      <div className="ai-chat-message-content">
        <div className="ai-chat-message-role">
          {isUser ? '👤 你' : '🤖 AI助手'}
        </div>
        <div className="ai-chat-message-text">
          {message.content}
        </div>
        {message.created_at && (
          <div className="ai-chat-message-time">
            {new Date(message.created_at).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
};

