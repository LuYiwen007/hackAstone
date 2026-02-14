import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { PlanList } from '../../components/plan';
import './PlanListPage.css';

// 模拟数据
const mockPlans = [
  {
    id: '1',
    title: '完成项目文档',
    description: '编写项目需求文档和技术文档',
    plan_type: '工作',
    status: 'IN_PROGRESS',
    priority: 2,
    start_date: '2024-01-15T00:00:00',
    end_date: '2024-01-30T00:00:00',
    created_at: '2024-01-10T10:00:00',
  },
  {
    id: '2',
    title: '学习React框架',
    description: '深入学习React Hooks和状态管理',
    plan_type: '学习',
    status: 'NOT_STARTED',
    priority: 1,
    start_date: '2024-02-01T00:00:00',
    end_date: '2024-04-30T00:00:00',
    created_at: '2024-01-12T14:00:00',
  },
  {
    id: '3',
    title: '每周健身计划',
    description: '每周至少运动3次，每次1小时',
    plan_type: '生活',
    status: 'PAUSED',
    priority: 0,
    start_date: '2024-01-01T00:00:00',
    created_at: '2023-12-28T09:00:00',
  },
];

export const PlanListPage = () => {
  const navigate = useNavigate();
  const [plans] = useState(mockPlans);

  return (
    <div className="plan-list-page">
      <div className="plan-list-page-header">
        <h1 className="plan-list-page-title">我的计划</h1>
        <div className="plan-list-page-actions">
          <Button 
            variant="outline" 
            onClick={() => navigate('/ai/chat')}
          >
            AI生成计划
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/plan/create')}
          >
            + 创建计划
          </Button>
        </div>
      </div>
      <PlanList plans={plans} />
    </div>
  );
};

