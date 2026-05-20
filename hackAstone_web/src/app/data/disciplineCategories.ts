export const DISCIPLINE_CATEGORY_KEYS = [
  "disciplines.category.all",
  "disciplines.category.business",
  "disciplines.category.psychology",
  "disciplines.category.learning",
  "disciplines.category.hot",
] as const;

export type DisciplineCategoryKey = (typeof DISCIPLINE_CATEGORY_KEYS)[number];

export const DISCIPLINE_CATEGORY_LABELS: Record<
  DisciplineCategoryKey,
  { en: string; zh: string }
> = {
  "disciplines.category.all": { en: "General", zh: "全部" },
  "disciplines.category.business": { en: "Business", zh: "商业" },
  "disciplines.category.psychology": { en: "Psychology", zh: "心理学" },
  "disciplines.category.learning": { en: "Learning", zh: "学习方法" },
  "disciplines.category.hot": { en: "Hot topics", zh: "热点问题" },
};

/** 与 i18n 分类展示名匹配（兼容中英文 catalog） */
function matchCategoryLabel(categoryKey: DisciplineCategoryKey, battleCategory: string): boolean {
  const c = battleCategory.trim().toLowerCase();
  switch (categoryKey) {
    case "disciplines.category.all":
      return true;
    case "disciplines.category.business":
      return c === "business" || c === "商业";
    case "disciplines.category.psychology":
      return c === "psychology" || c === "心理学";
    case "disciplines.category.learning":
      return c === "learning" || c === "学习方法";
    case "disciplines.category.hot":
      return c === "hot topics" || c === "热点问题";
    default:
      return true;
  }
}

/** 静态对局看 category 字段；AI 双语对局同时匹配 en/zh */
export function battleMatchesCategory(
  categoryKey: DisciplineCategoryKey,
  battle: { category: string; locales?: { en?: { category: string }; zh?: { category: string } } }
): boolean {
  if (battle.locales?.en && matchCategoryLabel(categoryKey, battle.locales.en.category)) {
    return true;
  }
  if (battle.locales?.zh && matchCategoryLabel(categoryKey, battle.locales.zh.category)) {
    return true;
  }
  return matchCategoryLabel(categoryKey, battle.category);
}
