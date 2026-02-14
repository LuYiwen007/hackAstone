import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { PlanForm } from '../../components/plan';
import './CreatePlanPage.css';

export const CreatePlanPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (formData) => {
    console.log('创建计划:', formData);
    // 这里会调用API创建计划
    // 创建成功后跳转到计划列表
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="create-plan-page">
      <div className="create-plan-page-header">
        <h1 className="create-plan-page-title">创建新计划</h1>
        <Button variant="outline" onClick={handleCancel}>
          取消
        </Button>
      </div>
      <Card>
        <PlanForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </Card>
    </div>
  );
};

