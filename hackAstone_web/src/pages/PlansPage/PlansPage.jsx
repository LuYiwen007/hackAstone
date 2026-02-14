import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { PlanList } from '../../components/plan';
import { Input } from '../../shared/ui/Input';
import './PlansPage.css';

// 模拟数据
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="plans-page">
      {/* 页面标题和描述 */}
      <div className="plans-page-header">
        <div className="plans-page-title-section">
          <h1 className="plans-page-title">我的计划</h1>
          <p className="plans-page-subtitle">管理和跟踪你的学习计划</p>
        </div>
        <div className="plans-page-actions">
          <Button 
            variant="outline" 
            onClick={() => navigate('/ai/chat')}
            className="plans-page-btn-ai"
          >
            🤖 AI生成计划
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/plan/create')}
            className="plans-page-btn-create"
          >
            + 创建计划
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="plans-page-filters">
        <div className="plans-page-search">
          <Input
            type="text"
            placeholder="搜索计划..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="plans-page-search-input"
          />
        </div>
        <div className="plans-page-status-filters">
          <button
            className={`plans-page-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            全部
          </button>
          <button
            className={`plans-page-filter-btn ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
            onClick={() => setStatusFilter('IN_PROGRESS')}
          >
            进行中
          </button>
          <button
            className={`plans-page-filter-btn ${statusFilter === 'NOT_STARTED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('NOT_STARTED')}
          >
            未开始
          </button>
          <button
            className={`plans-page-filter-btn ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('COMPLETED')}
          >
            已完成
          </button>
        </div>
      </div>

      {/* 计划列表 */}
      <PlanList plans={filteredPlans} />
    </div>
  );
};

