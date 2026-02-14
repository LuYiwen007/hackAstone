import { useState } from 'react';
import { Button } from '../../../../shared/ui/Button';
import './AIChatInput.css';

export const AIChatInput = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="ai-chat-input" onSubmit={handleSubmit}>
      <textarea
        className="ai-chat-input-textarea"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="输入您的问题..."
        disabled={disabled}
        rows={3}
      />
      <div className="ai-chat-input-actions">
        <Button 
          type="submit" 
          variant="primary" 
          disabled={!message.trim() || disabled}
        >
          发送
        </Button>
      </div>
    </form>
  );
};

