/**
 * API端点配置
 */

export const ENDPOINTS = {
  // 用户相关
  USER_LOGIN: '/user/login',
  USER_REGISTER: '/user/register',
  USER_PROFILE: '/user/profile',
  
  // 计划相关
  PLAN_LIST: '/plan/list',
  PLAN_DETAIL: '/plan',
  PLAN_CREATE: '/plan/create',
  PLAN_UPDATE: '/plan/update',
  PLAN_DELETE: '/plan/delete',
  
  // 使用数据相关
  USAGE_DATA: '/usage/data',
  USAGE_STATS: '/usage/stats',
  
  // AI对话相关
  CONVERSATION_SAVE: '/ai/conversation/save',
  CONVERSATION_GET: '/ai/conversation/get',

  // AI 计划草稿（储存与预览）
  PLAN_AI_DRAFT: '/plan/ai-draft',
  PLAN_AI_DRAFT_GET: '/plan/ai-draft', // GET /plan/ai-draft/:id
};

