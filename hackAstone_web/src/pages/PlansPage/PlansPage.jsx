import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlanList, NewPlanMenu } from '../../components/plan';
import './PlansPage.css';

const mockPlans = [
  {
    id: '1',
    title: '数学复习计划',
    description: '系统复习微积分、线性代数和概率论',
    plan_type: '学习',
    status: 'IN_PROGRESS',
    priority: 2,
    start_date: '2024-01-15T00:00:00',
    end_date: '2024-03-30T00:00:00',
    created_at: '2024-01-10T10:00:00',
    progress: 65,
    expected: 80,
  },
  {
    id: '2',
    title: 'Python编程学习',
    description: '深入学习Python高级特性和框架',
    plan_type: '学习',
    status: 'IN_PROGRESS',
    priority: 1,
    start_date: '2024-02-01T00:00:00',
    end_date: '2024-04-30T00:00:00',
    created_at: '2024-01-12T14:00:00',
    progress: 40,
    expected: 45,
  },
  {
    id: '3',
    title: '英语口语提升',
    description: '每天练习口语，提升流利度和发音',
    plan_type: '学习',
    status: 'IN_PROGRESS',
    priority: 1,
    start_date: '2024-01-01T00:00:00',
    end_date: '2024-06-30T00:00:00',
    created_at: '2023-12-28T09:00:00',
    progress: 80,
    expected: 75,
  },
  {
    id: '4',
    title: '完成项目文档',
    description: '编写项目需求文档和技术文档',
    plan_type: '工作',
    status: 'NOT_STARTED',
    priority: 2,
    start_date: '2024-02-15T00:00:00',
    end_date: '2024-02-28T00:00:00',
    created_at: '2024-02-10T10:00:00',
    progress: 0,
    expected: 0,
  },
];

export const PlansPage = () => {
  const navigate = useNavigate();
  const [plans] = useState(mockPlans);
  const [newPlanMenuOpen, setNewPlanMenuOpen] = useState(false);

  return (
    <div className="plans-page">
      <div className="plans-page-header">
        <div className="plans-page-title-section">
          <h1 className="plans-page-title">我的计划</h1>
          <p className="plans-page-subtitle">管理和跟踪你的学习计划</p>
        </div>
        <button
          type="button"
          className="plans-page-btn-new"
          onClick={() => setNewPlanMenuOpen(true)}
        >
          + 新建计划
        </button>
      </div>

      <NewPlanMenu
        isOpen={newPlanMenuOpen}
        onClose={() => setNewPlanMenuOpen(false)}
        onAiPlan={() => navigate('/ai/chat')}
        onCreatePlan={() => navigate('/plan/create')}
      />

      <PlanList
        plans={plans}
        showCreateCard
        onCreateClick={() => setNewPlanMenuOpen(true)}
      />
    </div>
  );
};

