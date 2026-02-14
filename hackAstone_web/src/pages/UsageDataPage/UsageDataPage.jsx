import { useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { UsageStats, UsageChart } from '../../components/usage';
import './UsageDataPage.css';

// 模拟数据
const mockStats = {
  totalPlans: 10,
  completedPlans: 6,
  inProgressPlans: 3,
  totalViews: 156,
};

export const UsageDataPage = () => {
  const [stats] = useState(mockStats);

  return (
    <div className="usage-data-page">
      <h1 className="usage-data-page-title">使用数据统计</h1>
      <Card>
        <UsageStats stats={stats} />
      </Card>
      <Card>
        <UsageChart data={[]} />
      </Card>
    </div>
  );
};

