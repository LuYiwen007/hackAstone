import { useEffect, useRef } from 'react';
import { AIChatMessage } from '../AIChatMessage';
import { AIChatInput } from '../AIChatInput';
import { Loading } from '../../../../shared/ui/Loading';
import './AIChatWindow.css';

export const AIChatWindow = ({ messages = [], onSend, loading = false }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="ai-chat-window">
      <div className="ai-chat-messages">
        {messages.length === 0 && (
          <div className="ai-chat-empty">
            <p>👋 你好！我是AI助手，可以帮助你创建计划。</p>
            <p>请告诉我你的需求，我会为你生成合适的计划。</p>
          </div>
        )}
        {messages.map((message, index) => (
          <AIChatMessage key={index} message={message} />
        ))}
        {loading && (
          <div className="ai-chat-loading">
            <Loading size="small" />
            <span>AI正在思考...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <AIChatInput onSend={onSend} disabled={loading} />
    </div>
  );
};

