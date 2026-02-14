import { useState } from 'react';
import { Input } from '../../../../shared/ui/Input';
import { Button } from '../../../../shared/ui/Button';
import './PlanForm.css';

const STATUS_OPTIONS = [
  { value: 'NOT_STARTED', label: '未开始' },
  { value: 'IN_PROGRESS', label: '执行中' },
  { value: 'PAUSED', label: '暂停' },
  { value: 'COMPLETED', label: '完成' },
  { value: 'FAILED', label: '失败' },
  { value: 'DELAYED', label: '延期' },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: '低' },
  { value: 1, label: '中' },
  { value: 2, label: '高' },
];

export const PlanForm = ({ plan, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: plan?.title || '',
    description: plan?.description || '',
    plan_type: plan?.plan_type || '',
    status: plan?.status || 'NOT_STARTED',
    start_date: plan?.start_date ? plan.start_date.split('T')[0] : '',
    end_date: plan?.end_date ? plan.end_date.split('T')[0] : '',
    priority: plan?.priority ?? 0,
    tags: plan?.tags ? plan.tags.join(',') : '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 处理数据
    const submitData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    onSubmit(submitData);
  };

  return (
    <form className="plan-form" onSubmit={handleSubmit}>
      <Input
        label="计划标题 *"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        placeholder="请输入计划标题"
      />

      <div className="plan-form-row">
        <div className="plan-form-field">
          <label className="plan-form-label">计划类型</label>
          <Input
            value={formData.plan_type}
            onChange={(e) => handleChange('plan_type', e.target.value)}
            placeholder="如：工作、学习、生活"
          />
        </div>

        <div className="plan-form-field">
          <label className="plan-form-label">状态</label>
          <select
            className="plan-form-select"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="plan-form-row">
        <div className="plan-form-field">
          <label className="plan-form-label">开始时间</label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
          />
        </div>

        <div className="plan-form-field">
          <label className="plan-form-label">结束时间</label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
          />
        </div>
      </div>

      <div className="plan-form-row">
        <div className="plan-form-field">
          <label className="plan-form-label">优先级</label>
          <select
            className="plan-form-select"
            value={formData.priority}
            onChange={(e) => handleChange('priority', parseInt(e.target.value))}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="plan-form-field">
          <label className="plan-form-label">标签（用逗号分隔）</label>
          <Input
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="如：紧急,重要,项目A"
          />
        </div>
      </div>

      <div className="plan-form-field">
        <label className="plan-form-label">计划描述</label>
        <textarea
          className="plan-form-textarea"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="请输入计划详细描述"
          rows={5}
        />
      </div>

      <div className="plan-form-actions">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit" variant="primary">
          {plan ? '更新计划' : '创建计划'}
        </Button>
      </div>
    </form>
  );
};

