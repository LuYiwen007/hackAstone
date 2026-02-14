import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { PlanStatusBadge } from '../../components/plan';
import { Modal } from '../../shared/ui/Modal';
import { PlanForm } from '../../components/plan';
import { formatDate, formatDateTime } from '../../shared/utils/format';
import './PlanDetailPage.css';

// 模拟数据
const mockPlan = {
  id: '1',
  title: '完成项目文档',
  description: '编写项目需求文档和技术文档，包括功能设计、接口设计等',
  plan_type: '工作',
  status: 'IN_PROGRESS',
  priority: 2,
  start_date: '2024-01-15T00:00:00',
  end_date: '2024-01-30T00:00:00',
  tags: ['紧急', '重要', '项目A'],
  created_at: '2024-01-10T10:00:00',
  updated_at: '2024-01-15T14:30:00',
};

export const PlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan] = useState(mockPlan);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleUpdate = (formData) => {
    console.log('更新计划:', formData);
    setIsEditModalOpen(false);
    // 这里会调用API更新计划
  };

  const getPriorityLabel = (priority) => {
    const labels = { 0: '低', 1: '中', 2: '高' };
    return labels[priority] || '低';
  };

  return (
    <div className="plan-detail-page">
      <div className="plan-detail-page-header">
        <Button variant="outline" onClick={() => navigate('/')}>
          ← 返回
        </Button>
        <div className="plan-detail-page-actions">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            编辑
          </Button>
          <Button variant="danger">删除</Button>
        </div>
      </div>

      <Card className="plan-detail-card">
        <div className="plan-detail-header">
          <h1 className="plan-detail-title">{plan.title}</h1>
          <PlanStatusBadge status={plan.status} />
        </div>

        <div className="plan-detail-meta">
          <div className="plan-detail-meta-item">
            <span className="plan-detail-meta-label">计划类型:</span>
            <span className="plan-detail-meta-value">{plan.plan_type || '-'}</span>
          </div>
          <div className="plan-detail-meta-item">
            <span className="plan-detail-meta-label">优先级:</span>
            <span className="plan-detail-meta-value">{getPriorityLabel(plan.priority)}</span>
          </div>
          {plan.start_date && (
            <div className="plan-detail-meta-item">
              <span className="plan-detail-meta-label">开始时间:</span>
              <span className="plan-detail-meta-value">{formatDate(plan.start_date)}</span>
            </div>
          )}
          {plan.end_date && (
            <div className="plan-detail-meta-item">
              <span className="plan-detail-meta-label">结束时间:</span>
              <span className="plan-detail-meta-value">{formatDate(plan.end_date)}</span>
            </div>
          )}
        </div>

        {plan.tags && plan.tags.length > 0 && (
          <div className="plan-detail-tags">
            {plan.tags.map((tag, index) => (
              <span key={index} className="plan-detail-tag">{tag}</span>
            ))}
          </div>
        )}

        {plan.description && (
          <div className="plan-detail-description">
            <h3>计划描述</h3>
            <p>{plan.description}</p>
          </div>
        )}

        <div className="plan-detail-footer">
          <div className="plan-detail-time">
            <span>创建时间: {formatDateTime(plan.created_at)}</span>
            {plan.updated_at && (
              <span>更新时间: {formatDateTime(plan.updated_at)}</span>
            )}
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="编辑计划"
      >
        <PlanForm plan={plan} onSubmit={handleUpdate} onCancel={() => setIsEditModalOpen(false)} />
      </Modal>
    </div>
  );
};

