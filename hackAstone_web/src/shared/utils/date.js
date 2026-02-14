/**
 * 日期工具函数
 */

export const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  const d = new Date(date);
  return (
    today.getFullYear() === d.getFullYear() &&
    today.getMonth() === d.getMonth() &&
    today.getDate() === d.getDate()
  );
};

export const isPast = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

export const isFuture = (date) => {
  if (!date) return false;
  return new Date(date) > new Date();
};

export const getDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

