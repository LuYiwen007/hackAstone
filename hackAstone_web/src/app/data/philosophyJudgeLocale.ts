import { parseJsonPayload } from "../../shared/jsonPayload";

const NO_JUDGE = "[NO_JUDGE]";

export type PhilosophyJudgeStepPayload = {
  judgeSpeaks?: boolean;
  judgeMessage?: string;
  addressTo?: string;
  continueDebate?: boolean;
};

/** 流式累积 → Judge 气泡展示（隐藏 META 尾行与 [NO_JUDGE]） */
export function judgeStreamDisplayText(accumulated: string): string {
  if (!accumulated) return "";
  let s = accumulated;
  const metaIdx = s.lastIndexOf("\nMETA:");
  if (metaIdx >= 0) s = s.slice(0, metaIdx);
  else if (s.startsWith("META:")) s = "";
  s = s.trim();
  if (s === NO_JUDGE || s.startsWith(NO_JUDGE)) return "";
  return s;
}

export function finalizeJudgeSpeech(raw: string): string {
  return judgeStreamDisplayText(raw) || raw.trim();
}

export function parsePhilosophyJudgeStep(
  raw: PhilosophyJudgeStepPayload | null,
  fallbackText?: string
): {
  judgeSpeaks: boolean;
  judgeMessage: string;
  addressTo: "user" | "philosopher" | null;
  continueDebate: boolean;
} | null {
  if (raw?.judgeSpeaks === false && !raw.judgeMessage?.trim()) {
    return {
      judgeSpeaks: false,
      judgeMessage: "",
      addressTo: null,
      continueDebate: raw.continueDebate !== false,
    };
  }
  if (raw && (raw.judgeSpeaks === true || raw.judgeMessage?.trim())) {
    const judgeMessage = (raw.judgeMessage ?? "").trim();
    let addressTo: "user" | "philosopher" | null =
      raw.addressTo === "philosopher" || raw.addressTo === "user" ? raw.addressTo : null;
    if (!judgeMessage) return null;
    if (!addressTo) addressTo = "user";
    return {
      judgeSpeaks: true,
      judgeMessage,
      addressTo,
      continueDebate: raw.continueDebate !== false,
    };
  }
  if (fallbackText != null) {
    return parseJudgeFromPlainText(fallbackText);
  }
  return null;
}

function parseJudgeFromPlainText(full: string): {
  judgeSpeaks: boolean;
  judgeMessage: string;
  addressTo: "user" | "philosopher" | null;
  continueDebate: boolean;
} | null {
  const trimmed = full.trim();
  if (!trimmed || trimmed === NO_JUDGE) {
    return { judgeSpeaks: false, judgeMessage: "", addressTo: null, continueDebate: true };
  }
  const json = parseJsonPayload<PhilosophyJudgeStepPayload>(trimmed);
  if (json && (json.judgeSpeaks != null || json.judgeMessage)) {
    return parsePhilosophyJudgeStep(json);
  }
  let messagePart = trimmed;
  let addressTo: "user" | "philosopher" = "user";
  let continueDebate = true;
  const metaMatch = trimmed.match(/\nMETA:\s*(\{[\s\S]*\})\s*$/);
  if (metaMatch) {
    messagePart = trimmed.slice(0, metaMatch.index).trim();
    try {
      const meta = JSON.parse(metaMatch[1]) as PhilosophyJudgeStepPayload;
      if (meta.addressTo === "philosopher" || meta.addressTo === "user") {
        addressTo = meta.addressTo;
      }
      if (meta.continueDebate === false) continueDebate = false;
    } catch {
      /* defaults */
    }
  }
  if (!messagePart || messagePart === NO_JUDGE) {
    return { judgeSpeaks: false, judgeMessage: "", addressTo: null, continueDebate };
  }
  return {
    judgeSpeaks: true,
    judgeMessage: messagePart,
    addressTo,
    continueDebate,
  };
}
