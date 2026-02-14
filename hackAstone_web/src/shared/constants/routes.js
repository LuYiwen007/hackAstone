/**
 * 路由常量
 */

export const ROUTES = {
  HOME: '/',
  PLANS: '/plans',
  TASKS: '/tasks',
  REVIEW: '/review',
  INSIGHTS: '/insights',
  SETTINGS: '/settings',
  PLAN_DETAIL: '/plan/:id',
  CREATE_PLAN: '/plan/create',
  AI_CHAT: '/ai/chat',
  USAGE_DATA: '/usage',
};

export const getPlanDetailRoute = (id) => `/plan/${id}`;
