import type { Battle } from "./battles";
import type { BattleLocaleSlice, BattleWithLocales } from "./battleLocale";
import enOverlayById from "./battles-en-overlay.json";

function toSlice(battle: Battle): BattleLocaleSlice {
  return {
    question: battle.question,
    category: battle.category,
    builderView: battle.builderView,
    breakerView: battle.breakerView,
    judgeQuestions: [...battle.judgeQuestions],
    reveal: battle.reveal,
  };
}

/** 为静态 fallback 对局附加 zh/en locales，与后端 catalog 结构一致 */
export function attachBattleLocales(battles: Battle[]): BattleWithLocales[] {
  return battles.map((battle) => {
    const zh = toSlice(battle);
    const overlay = enOverlayById[battle.id as keyof typeof enOverlayById];
    const en: BattleLocaleSlice = overlay
      ? {
          question: overlay.question ?? zh.question,
          category: overlay.category ?? zh.category,
          builderView: overlay.builderView ?? zh.builderView,
          breakerView: overlay.breakerView ?? zh.breakerView,
          judgeQuestions: overlay.judgeQuestions ?? zh.judgeQuestions,
          reveal: overlay.reveal ?? zh.reveal,
        }
      : zh;
    return { ...battle, locales: { zh, en } };
  });
}
