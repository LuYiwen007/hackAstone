import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { AIChatWindow } from '../../components/ai';
import { callBailianCompletion } from '../../shared/api/bailian';
import { buildPlanPrompt } from '../../shared/constants/aiPlanPrompt';
import { parsePlanFromAiText } from '../../shared/utils/parseAiPlan';
import { apiClient } from '../../shared/api/client';
import { ENDPOINTS } from '../../shared/api/endpoints';
import './AIChatPage.css';

export const AIChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const handleSend = async (content) => {
    const userMessage = {
      role: 'USER',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const prompt = buildPlanPrompt(content);
      const { text, sessionId: nextSessionId } = await callBailianCompletion({
        prompt,
        sessionId,
      });
      setSessionId(nextSessionId);

      const parsed = parsePlanFromAiText(text);
      if (parsed) {
        try {
          const res = await apiClient.post(ENDPOINTS.PLAN_AI_DRAFT, parsed);
          const draft = (res && res.success && res.data) ? res.data : { ...parsed };
          const aiMessage = {
            role: 'ASSISTANT',
            content: '已为你生成学习计划预览，可直接使用或继续描述需求调整。',
            planPreview: draft,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        } catch (saveErr) {
          const aiMessage = {
            role: 'ASSISTANT',
            content: '计划已生成，但暂未保存到服务器。',
            planPreview: { ...parsed },
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        const aiMessage = {
          role: 'ASSISTANT',
          content: text || '（无回复内容）',
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI 请求失败';
      const aiMessage = {
        role: 'ASSISTANT',
        content: `❌ ${msg}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastPlanDraft =
    lastMessage?.role === 'ASSISTANT' && lastMessage?.planPreview?.planName ? lastMessage.planPreview : null;

  const handleRestart = () => {
    setMessages([]);
    setSessionId(null);
  };

  const handleAcceptCreate = () => {
    if (lastPlanDraft?.id) {
      navigate(`/plan/${lastPlanDraft.id}`);
    } else {
      navigate('/plans');
    }
  };

  return (
    <div className="ai-chat-page">
      <div className="ai-chat-page-header">
        <Button variant="outline" onClick={() => navigate('/')}>
          ← 返回
        </Button>
        <h1 className="ai-chat-page-title">AI助手 - 生成计划</h1>
        <div></div>
      </div>
      <div className="ai-chat-page-content">
        <AIChatWindow
          messages={messages}
          onSend={handleSend}
          loading={loading}
          onUsePlan={(planId) => navigate(`/plan/${planId}`)}
          lastPlanDraft={lastPlanDraft}
          onRestart={handleRestart}
          onAcceptCreate={handleAcceptCreate}
        />
      </div>
    </div>
  );
};

