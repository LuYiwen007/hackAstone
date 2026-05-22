import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lightbulb, FileText, Download, Save } from "lucide-react";
import { Philosopher } from "../data/philosophers";
import { ModernApplication } from "./ModernApplication";
import { ConceptCards } from "./ConceptCards";
import {
  buildDebateNoteKey,
  fetchDebateNote,
  runEchoQuery,
  saveDebateNote,
} from "../../shared/api/arena";
import { getAuth, isLoggedIn } from "../../shared/api/client";
import { parseJsonPayload } from "../../shared/jsonPayload";

interface DebateSummaryProps {
  philosopher: Philosopher;
  question: string;
  userChoice: "agree" | "disagree" | "uncertain" | null;
  userReason: string;
  /** 笔记来源类型，用于按用户隔离存储 */
  sourceType?: string;
}

type AiDebateInsight = {
  corePoints: string[];
  comparison: {
    philosopherStance: string;
    userStance: string;
    alignment: string;
  };
  deepQuestions: string[];
};

function buildInsightPrompt(
  philosopher: Philosopher,
  question: string,
  userChoice: DebateSummaryProps["userChoice"],
  userReason: string
): string {
  const choiceLabel =
    userChoice === "agree"
      ? "同意哲学家立场"
      : userChoice === "disagree"
        ? "反对哲学家立场"
        : userChoice === "uncertain"
          ? "不确定"
          : "未选择";
  return [
    "[ROLE]",
    "CA-Echo-LLM",
    "",
    "[TASK]",
    "根据一场哲学辩论的信息，生成结构化「智能总结」，仅返回 JSON。",
    "",
    "[RETURN_FORMAT]",
    '{"corePoints":["..."],"comparison":{"philosopherStance":"...","userStance":"...","alignment":"..."},"deepQuestions":["..."]}',
    "",
    "[CONSTRAINTS]",
    "中文；corePoints 至少 3 条；deepQuestions 至少 3 条；comparison.userStance 应概括用户理由；仅返回 JSON。",
    "",
    `哲学家：${philosopher.nameCN}；学派：${philosopher.school}；关键思想：${philosopher.keyIdeas.join("、")}`,
    `辩题：${question}`,
    `用户立场标签：${choiceLabel}`,
    `用户陈述与理由：${userReason || "（用户未留下文字）"}`,
  ].join("\n");
}

export function DebateSummary({
  philosopher,
  question,
  userChoice,
  userReason,
  sourceType = "debate",
}: DebateSummaryProps) {
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [insight, setInsight] = useState<AiDebateInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [insightStreamPreview, setInsightStreamPreview] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const sourceKey = buildDebateNoteKey(philosopher.id, question);
  const loggedIn = isLoggedIn();
  const auth = getAuth();

  useEffect(() => {
    if (!loggedIn) {
      setNotes("");
      return;
    }
    let cancelled = false;
    fetchDebateNote(sourceType, sourceKey)
      .then((res) => {
        if (!cancelled && res.content) {
          setNotes(res.content);
        }
      })
      .catch(() => {
        /* 无笔记或网络错误时保持空白 */
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn, auth?.userId, sourceType, sourceKey]);

  useEffect(() => {
    let cancelled = false;
    setInsightLoading(true);
    setInsight(null);
    setInsightStreamPreview("");
    runEchoQuery(buildInsightPrompt(philosopher, question, userChoice, userReason), {
      onDelta: (_d, acc) => setInsightStreamPreview(acc),
    })
      .then((resp) => {
        const parsed = parseJsonPayload<AiDebateInsight>(resp.text);
        if (
          !parsed?.corePoints?.length ||
          !parsed.comparison?.philosopherStance ||
          !parsed.deepQuestions?.length
        ) {
          throw new Error("模型未返回有效的智能总结 JSON");
        }
        if (!cancelled) setInsight(parsed);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "智能总结加载失败";
          toast.error(msg);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setInsightLoading(false);
          setInsightStreamPreview("");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [philosopher.id, question, userChoice, userReason]);

  const handleSaveNotes = async () => {
    if (!loggedIn) {
      toast.error("请先登录后再保存笔记");
      return;
    }
    setNoteSaving(true);
    try {
      await saveDebateNote({
        sourceType,
        sourceKey,
        topic: question,
        content: notes,
      });
      toast.success("笔记已保存到你的学习档案");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "保存失败";
      toast.error(msg);
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDownload = () => {
    if (!insight) {
      toast.error("暂无可导出的智能总结");
      return;
    }
    const content = `
# 哲学辩论记录 - ${philosopher.nameCN}

## 辩论主题
${question}

## 核心观点提炼
${insight.corePoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## 立场对比

### ${philosopher.nameCN}的立场
${insight.comparison.philosopherStance}

### 你的立场
${insight.comparison.userStance}

### 一致性评估
${insight.comparison.alignment}

## 深度思考问题
${insight.deepQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

## 个人笔记
${notes || "（暂无笔记）"}

---
生成时间：${new Date().toLocaleString("zh-CN")}
来源：Cognitive Arena - 认知竞技场
    `.trim();

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `辩论记录-${philosopher.nameCN}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 mt-8 pt-8 border-t border-zinc-800">
      <div>
        <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          智能总结
        </h4>

        {insightLoading && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-zinc-400 space-y-3">
            <div>正在通过后端生成智能总结…</div>
            {insightStreamPreview ? (
              <pre className="max-h-48 overflow-auto text-sm whitespace-pre-wrap text-zinc-500">{insightStreamPreview}</pre>
            ) : null}
          </div>
        )}

        {!insightLoading && !insight && (
          <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-6 text-red-300 text-sm">
            无法加载智能总结，请确认后端与百炼配置正常后刷新页面重试。
          </div>
        )}

        {insight && (
          <>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-4">
              <h5 className="font-bold mb-3 text-purple-400">核心观点提炼</h5>
              <ul className="space-y-2">
                {insight.corePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-purple-500 mt-1 flex-shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-4">
              <h5 className="font-bold mb-4 text-purple-400">立场对比</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-zinc-900 border border-purple-600/30">
                  <div className="text-xs text-zinc-500 mb-2">{philosopher.nameCN}的立场</div>
                  <p className="text-sm text-zinc-300">{insight.comparison.philosopherStance}</p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900 border border-blue-600/30">
                  <div className="text-xs text-zinc-500 mb-2">你的立场</div>
                  <p className="text-sm text-zinc-300">{insight.comparison.userStance}</p>
                </div>
              </div>
              <div className="text-center">
                <span className="inline-block px-4 py-2 rounded-full bg-purple-600/20 text-purple-400 text-sm font-bold">
                  一致性：{insight.comparison.alignment}
                </span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
              <h5 className="font-bold mb-3 text-purple-400">值得深思的问题</h5>
              <ul className="space-y-3">
                {insight.deepQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-purple-500 font-bold flex-shrink-0">{i + 1}.</span>
                    <span className="italic">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="w-full flex items-center justify-between p-4 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <span className="font-bold">个人笔记</span>
            <span className="text-xs text-zinc-500">（可编辑保存）</span>
          </div>
          <span className="text-zinc-500">{showNotes ? "▼" : "▶"}</span>
        </button>

        {showNotes && (
          <div className="mt-4 space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`记录你的思考：
• 这次辩论让我意识到...
• 我对${philosopher.nameCN}的理解是...
• 我想进一步探索的问题...`}
              className="w-full h-48 p-4 rounded-lg bg-zinc-950 border border-zinc-700 focus:border-purple-500 focus:outline-none resize-none text-zinc-300"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={noteSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-bold disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{noteSaving ? "保存中…" : loggedIn ? "保存笔记" : "登录后保存"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!insight}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>导出记录</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ModernApplication
        philosopherName={philosopher.nameCN}
        philosopherId={philosopher.id}
        coreIdeas={philosopher.keyIdeas}
      />

      <ConceptCards debateTopic={question} philosopherName={philosopher.nameCN} />
    </div>
  );
}
