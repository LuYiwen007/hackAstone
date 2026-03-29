import { useState } from "react";
import { Lightbulb, FileText, Download, Save } from "lucide-react";
import { Philosopher } from "../data/philosophers";
import { ModernApplication } from "./ModernApplication";
import { ConceptCards } from "./ConceptCards";

interface DebateSummaryProps {
  philosopher: Philosopher;
  question: string;
  userChoice: "agree" | "disagree" | "uncertain" | null;
  userReason: string;
}

export function DebateSummary({ philosopher, question, userChoice, userReason }: DebateSummaryProps) {
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  // AI生成的智能总结（实际应用中应调用API）
  const generateSummary = () => {
    const choiceText = userChoice === "agree" ? `同意${philosopher.nameCN}` : 
                      userChoice === "disagree" ? "持反对立场" : "表示不确定";
    
    return {
      corePoints: [
        `${philosopher.nameCN}的核心观点：${philosopher.keyIdeas[0]}`,
        `反方立场强调实用性和现实考量`,
        `你选择了${choiceText}，展示了你的思考倾向`
      ],
      comparison: {
        philosopherStance: philosopher.summary || `${philosopher.nameCN}的哲学立场`,
        userStance: userReason.slice(0, 100) + (userReason.length > 100 ? "..." : ""),
        alignment: userChoice === "agree" ? "高度一致" : userChoice === "disagree" ? "对立" : "尚在探索"
      },
      deepQuestions: [
        `如果${philosopher.nameCN}生活在现代，他会如何看待这个问题？`,
        `你的立场在什么情况下可能会改变？`,
        `这个问题对你的日常生活有什么实际影响？`
      ]
    };
  };

  const summary = generateSummary();

  const handleSaveNotes = () => {
    // 实际应用中应该保存到数据库
    console.log("保存笔记:", notes);
    alert("笔记已保存到你的学习档案！");
  };

  const handleDownload = () => {
    const content = `
# 哲学辩论记录 - ${philosopher.nameCN}

## 辩论主题
${question}

## 核心观点提炼
${summary.corePoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## 立场对比

### ${philosopher.nameCN}的立场
${summary.comparison.philosopherStance}

### 你的立场
${summary.comparison.userStance}

### 一致性评估
${summary.comparison.alignment}

## 深度思考问题
${summary.deepQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

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
      {/* AI Summary Section */}
      <div>
        <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          智能总结
        </h4>

        {/* Core Points */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-4">
          <h5 className="font-bold mb-3 text-purple-400">核心观点提炼</h5>
          <ul className="space-y-2">
            {summary.corePoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-zinc-300">
                <span className="text-purple-500 mt-1 flex-shrink-0">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Comparison Table */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-4">
          <h5 className="font-bold mb-4 text-purple-400">立场对比</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-zinc-900 border border-purple-600/30">
              <div className="text-xs text-zinc-500 mb-2">{philosopher.nameCN}的立场</div>
              <p className="text-sm text-zinc-300">{summary.comparison.philosopherStance}</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-900 border border-blue-600/30">
              <div className="text-xs text-zinc-500 mb-2">你的立场</div>
              <p className="text-sm text-zinc-300">{summary.comparison.userStance}</p>
            </div>
          </div>
          <div className="text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-purple-600/20 text-purple-400 text-sm font-bold">
              一致性：{summary.comparison.alignment}
            </span>
          </div>
        </div>

        {/* Deep Questions */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
          <h5 className="font-bold mb-3 text-purple-400">值得深思的问题</h5>
          <ul className="space-y-3">
            {summary.deepQuestions.map((question, i) => (
              <li key={i} className="flex items-start gap-2 text-zinc-300">
                <span className="text-purple-500 font-bold flex-shrink-0">{i + 1}.</span>
                <span className="italic">{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <button
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
                onClick={handleSaveNotes}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-bold"
              >
                <Save className="w-4 h-4" />
                <span>保存笔记</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>导出记录</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Application Section */}
      <ModernApplication 
        philosopherName={philosopher.nameCN}
        philosopherId={philosopher.id}
        coreIdeas={philosopher.keyIdeas}
      />

      {/* Concept Cards Section */}
      <ConceptCards 
        debateTopic={question}
        philosopherName={philosopher.nameCN}
      />
    </div>
  );
}