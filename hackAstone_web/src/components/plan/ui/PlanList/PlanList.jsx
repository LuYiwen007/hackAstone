import { PlanCard } from '../PlanCard';
import { Loading } from '../../../../shared/ui/Loading';
import './PlanList.css';

export const PlanList = ({ plans, loading = false, showCreateCard = false, onCreateClick }) => {
  if (loading) {
    return (
      <div className="plan-list-loading">
        <Loading size="large" />
      </div>
    );
  }

  const hasPlans = plans && plans.length > 0;

  return (
    <div className="plan-list-wrapper">
      {!hasPlans && !showCreateCard && (
        <div className="plan-list-empty">
          <p>暂无计划，点击「新建计划」创建</p>
        </div>
      )}
      {(hasPlans || showCreateCard) && (
        <div className="plan-list">
          {hasPlans && plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
          {showCreateCard && (
            <button type="button" className="plan-list-create-card" onClick={onCreateClick}>
              <span className="plan-list-create-icon">+</span>
              <span className="plan-list-create-text">创建计划</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

