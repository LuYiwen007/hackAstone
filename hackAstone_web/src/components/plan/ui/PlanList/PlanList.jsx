import { PlanCard } from '../PlanCard';
import { Loading } from '../../../../shared/ui/Loading';
import './PlanList.css';

export const PlanList = ({ plans, loading = false }) => {
  if (loading) {
    return (
      <div className="plan-list-loading">
        <Loading size="large" />
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="plan-list-empty">
        <p>暂无计划，点击右上角按钮创建新计划</p>
      </div>
    );
  }

  return (
    <div className="plan-list">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
};

