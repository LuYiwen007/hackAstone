/**
 * 应用配置
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/** 阿里云百炼（DashScope）配置 - 用于 AI 生成计划 */
export const BAILIAN_CONFIG = {
  /** API Key，请在 .env 中设置 VITE_DASHSCOPE_API_KEY，或在控制台「密钥管理」获取 */
  API_KEY: import.meta.env.VITE_DASHSCOPE_API_KEY || '',
  /** 应用 ID，对应百炼控制台「应用管理」中的应用 ID */
  APP_ID: import.meta.env.VITE_BAILIAN_APP_ID || '6f27fb46e69a46f8b003908afe010d84',
  /** 文本补全接口地址（APP_ID 会动态替换） */
  COMPLETION_URL: 'https://dashscope.aliyuncs.com/api/v1/apps',
};

export const AI_CONFIG = {
  // AI API配置（前端直接调用）
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  CLAUDE_API_KEY: import.meta.env.VITE_CLAUDE_API_KEY || '',
  CLAUDE_API_URL: 'https://api.anthropic.com/v1/messages',
  DEFAULT_MODEL: 'gpt-4',
};

