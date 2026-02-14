import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { AIChatWindow } from '../../components/ai';
import './AIChatPage.css';

export const AIChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = (content) => {
    // 添加用户消息
    const userMessage = {
      role: 'USER',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // 模拟AI回复（仅UI展示，不接入实际AI）
    setLoading(true);
    setTimeout(() => {
      const aiMessage = {
        role: 'ASSISTANT',
        content: '这是一个模拟的AI回复。实际项目中这里会调用AI API生成回复。',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
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
        <AIChatWindow messages={messages} onSend={handleSend} loading={loading} />
      </div>
    </div>
  );
};

