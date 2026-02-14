import { ROUTES } from '../../shared/constants/routes';
import { Layout } from '../layout';
import { HomePage } from '../../pages/HomePage';
import { PlansPage } from '../../pages/PlansPage';
import { TasksPage } from '../../pages/TasksPage';
import { ReviewPage } from '../../pages/ReviewPage';
import { InsightsPage } from '../../pages/InsightsPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { PlanDetailPage } from '../../pages/PlanDetailPage';
import { CreatePlanPage } from '../../pages/CreatePlanPage';
import { AIChatPage } from '../../pages/AIChatPage';
import { UsageDataPage } from '../../pages/UsageDataPage';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: ROUTES.HOME,
        element: <HomePage />,
      },
      {
        path: ROUTES.PLANS,
        element: <PlansPage />,
      },
      {
        path: ROUTES.TASKS,
        element: <TasksPage />,
      },
      {
        path: ROUTES.REVIEW,
        element: <ReviewPage />,
      },
      {
        path: ROUTES.INSIGHTS,
        element: <InsightsPage />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: ROUTES.PLAN_DETAIL,
    element: <PlanDetailPage />,
  },
  {
    path: ROUTES.CREATE_PLAN,
    element: <CreatePlanPage />,
  },
  {
    path: ROUTES.AI_CHAT,
    element: <AIChatPage />,
  },
  {
    path: ROUTES.USAGE_DATA,
    element: <UsageDataPage />,
  },
];
