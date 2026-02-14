/**
 * 应用配置
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const AI_CONFIG = {
  // AI API配置（前端直接调用）
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  CLAUDE_API_KEY: import.meta.env.VITE_CLAUDE_API_KEY || '',
  CLAUDE_API_URL: 'https://api.anthropic.com/v1/messages',
  DEFAULT_MODEL: 'gpt-4',
};

