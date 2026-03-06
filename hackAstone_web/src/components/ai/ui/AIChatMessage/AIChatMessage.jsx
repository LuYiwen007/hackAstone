import { PlanPreview } from '../../../plan/ui/PlanPreview';
import './AIChatMessage.css';

export const AIChatMessage = ({ message, onUsePlan }) => {
  const isUser = message.role === 'USER';
  const hasPlanPreview = !isUser && message.planPreview && message.planPreview.planName;
  const planPreviewConfirm = hasPlanPreview && message.planPreview?.id && onUsePlan
    ? () => onUsePlan(message.planPreview.id)
    : undefined;

  return (
    <div className={`ai-chat-message ${isUser ? 'ai-chat-message-user' : 'ai-chat-message-assistant'}`}>
      <div className="ai-chat-message-content">
        <div className="ai-chat-message-role">
          {isUser ? '👤 你' : '🤖 AI助手'}
        </div>
        {hasPlanPreview ? (
          <div className="ai-chat-message-plan-preview">
            <PlanPreview plan={message.planPreview} onConfirm={planPreviewConfirm} />
          </div>
        ) : (
          <div className="ai-chat-message-text">
            {message.content}
          </div>
        )}
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

