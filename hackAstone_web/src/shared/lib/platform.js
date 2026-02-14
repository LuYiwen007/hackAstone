/**
 * 平台检测工具
 */

export const isWeb = () => typeof window !== 'undefined';

export const isMobile = () => {
  if (!isWeb()) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isDesktop = () => isWeb() && !isMobile();

