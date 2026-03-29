import { useEffect, useRef } from 'react';
import { AIChatMessage } from '../AIChatMessage';
import { AIChatInput } from '../AIChatInput';
import { Loading } from '../../../../shared/ui/Loading';
import './AIChatWindow.css';

export const AIChatWindow = ({
  messages = [],
  onSend,
  loading = false,
  onUsePlan,
  lastPlanDraft = null,
  onRestart,
  onAcceptCreate,
}) => {
  const messagesEndRef = useRef(null);
  const showPlanActions = Boolean(lastPlanDraft && lastPlanDraft.planName);

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
          <AIChatMessage key={index} message={message} onUsePlan={onUsePlan} />
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
      {showPlanActions && (onRestart || onAcceptCreate) && (
        <div className="ai-chat-plan-actions">
          {onRestart && (
            <button type="button" className="ai-chat-plan-action-btn ai-chat-plan-action-restart" onClick={onRestart}>
              重新开始
            </button>
          )}
          {onAcceptCreate && (
            <button type="button" className="ai-chat-plan-action-btn ai-chat-plan-action-accept" onClick={onAcceptCreate}>
              接受并创建
            </button>
          )}
        </div>
      )}
    </div>
  );
};

