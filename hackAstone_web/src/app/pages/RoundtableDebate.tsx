import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, Sparkles, MessageSquare, User } from "lucide-react";
import type { Philosopher } from "../data/philosophers";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { philosopherDisplayName, useArenaLocale } from "../context/ArenaLocaleContext";
import { generateRoundtableOpenings, generateRoundtableReply } from "../../shared/api/arena";
import { parseJsonPayload } from "../../shared/jsonPayload";
import { ArenaHeader } from "../components/ArenaHeader";

interface Message {
  id: string;
  speaker: "user" | string; // "user" 或思想家ID
  content: string;
  timestamp: number;
}

type Stage = "setup" | "debate" | "summary";

export function RoundtableDebate() {
  const { philosophers } = useArenaCatalog();
  const { t } = useArenaLocale();
  const [stage, setStage] = useState<Stage>("setup");
  const [selectedPhilosophers, setSelectedPhilosophers] = useState<Philosopher[]>([]);
  const [debateTopic, setDebateTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // 预设辩题
  const presetTopics = [
    {
      id: "ai-free-will",
      title: "AI是否会取代人类自由意志？",
      description: "探讨人工智能、意识与自由选择的关系",
    },
    {
      id: "utopia",
      title: "理想社会应该追求绝对平等还是自由？",
      description: "关于正义、公平与个人权利的永恒辩论",
    },
    {
      id: "truth",
      title: "客观真理是否存在？",
      description: "认识论的核心问题：真理的本质",
    },
    {
      id: "education",
      title: "教育的目的是培养工具还是完整的人？",
      description: "人才培养vs人格教育的现代困境",
    },
  ];

  const handleAddPhilosopher = (philosopher: Philosopher) => {
    if (selectedPhilosophers.length >= 4) {
      return; // 最多4人
    }
    if (selectedPhilosophers.find(p => p.id === philosopher.id)) {
      return; // 已经添加过了
    }
    setSelectedPhilosophers([...selectedPhilosophers, philosopher]);
  };

  const handleRemovePhilosopher = (philosopherId: string) => {
    setSelectedPhilosophers(selectedPhilosophers.filter(p => p.id !== philosopherId));
  };

  const handleStartDebate = () => {
    if (selectedPhilosophers.length < 2 || !debateTopic) return;
    
    setStage("debate");
    
    setIsThinking(true);
    const participants = selectedPhilosophers.map((p) => ({ id: p.id, nameCN: p.nameCN, school: p.school }));
    generateRoundtableOpenings(debateTopic, participants)
      .then((resp) => {
        const parsed = parseJsonPayload<{ messages?: Array<{ speaker: string; content: string }> }>(resp.text);
        const serverMessages = parsed?.messages ?? [];
        if (serverMessages.length > 0) {
          const openingMessages: Message[] = serverMessages.map((m, index) => ({
            id: `opening-${m.speaker}-${Date.now()}-${index}`,
            speaker: m.speaker,
            content: m.content,
            timestamp: Date.now() + index * 300,
          }));
          setMessages(openingMessages);
          return;
        }
        throw new Error(t("roundtable.error.openingJson"));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : t("roundtable.error.openingFailed");
        toast.error(msg);
        setStage("setup");
        setMessages([]);
      })
      .finally(() => setIsThinking(false));
  };

  const handleUserSend = () => {
    if (!userInput.trim()) return;

    // 添加用户消息
    const userText = userInput.trim();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: "user",
      content: userText,
      timestamp: Date.now(),
    };
    setMessages([...messages, userMessage]);
    setUserInput("");

    setIsThinking(true);
    const participants = selectedPhilosophers.map((p) => ({ id: p.id, nameCN: p.nameCN, school: p.school }));
    generateRoundtableReply(debateTopic, userText, participants)
      .then((resp) => {
        const parsed = parseJsonPayload<{ messages?: Array<{ speaker: string; content: string }> }>(resp.text);
        const serverMessages = parsed?.messages ?? [];
        if (serverMessages.length > 0) {
          const responses = serverMessages.map((m, index) => ({
            id: `response-${m.speaker}-${Date.now()}-${index}`,
            speaker: m.speaker,
            content: m.content,
            timestamp: Date.now() + index * 300,
          }));
          setMessages((prev) => [...prev, ...responses]);
          return;
        }
        throw new Error(t("roundtable.error.replyJson"));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : t("roundtable.error.replyFailed");
        toast.error(msg);
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        setUserInput(userText);
      })
      .finally(() => setIsThinking(false));
  };

  const getPhilosopher = (philosopherId: string) => {
    return philosophers.find(p => p.id === philosopherId);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <ArenaHeader
        currentPage="roundtable"
        theme={{
          iconBg: "bg-gradient-to-br from-orange-500 to-red-600",
          activeButton: "bg-gradient-to-r from-orange-600 to-red-600",
          activeBorder: "border-orange-800",
          activeHover: "hover:from-orange-500 hover:to-red-500",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Setup Stage */}
        {stage === "setup" && (
          <div className="space-y-8">
            {/* 选择思想家 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-orange-500">1.</span> {t("roundtable.step1")}
                <span className="text-sm font-normal text-zinc-400 ml-2">
                  {t("roundtable.step1Hint")}
                </span>
              </h2>

              {/* 已选择的思想家 */}
              {selectedPhilosophers.length > 0 && (
                <div className="mb-6 p-4 bg-zinc-900 border border-orange-900/30 rounded-lg">
                  <h3 className="text-sm font-semibold text-orange-500 mb-3">
                    {t("roundtable.selected", { count: selectedPhilosophers.length })}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedPhilosophers.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                      >
                        <div>
                          <div className="font-semibold text-white">{p.nameCN}</div>
                          <div className="text-xs text-zinc-500">{p.school}</div>
                        </div>
                        <button
                          onClick={() => handleRemovePhilosopher(p.id)}
                          className="ml-2 p-1 hover:bg-zinc-700 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-zinc-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 思想家列表 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {philosophers
                  .filter(p => p.majorWorks) // 只显示有详细信息的思想家
                  .map(p => {
                    const isSelected = selectedPhilosophers.find(sp => sp.id === p.id);
                    const isFull = selectedPhilosophers.length >= 4;
                    
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleAddPhilosopher(p)}
                        disabled={isSelected || (isFull && !isSelected)}
                        className={`text-left p-3 border rounded-lg transition-all ${
                          isSelected
                            ? "bg-orange-900/30 border-orange-700 opacity-50 cursor-not-allowed"
                            : isFull
                            ? "bg-zinc-900 border-zinc-800 opacity-30 cursor-not-allowed"
                            : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800"
                        }`}
                      >
                        <div className="font-semibold text-white text-sm">{p.nameCN}</div>
                        <div className="text-xs text-zinc-500 mt-1">{p.school}</div>
                        {isSelected && (
                          <div className="text-xs text-orange-500 mt-1">✓ {t("roundtable.selected")}</div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </section>

            {/* 选择辩题 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-orange-500">2.</span> {t("roundtable.step2")}
              </h2>

              <div className="space-y-4">
                {/* 预设辩题 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {presetTopics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setDebateTopic(topic.title)}
                      className={`text-left p-4 border rounded-lg transition-all ${
                        debateTopic === topic.title
                          ? "bg-orange-900/30 border-orange-700"
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800"
                      }`}
                    >
                      <h4 className="font-semibold text-white mb-1">{topic.title}</h4>
                      <p className="text-sm text-zinc-500">{topic.description}</p>
                    </button>
                  ))}
                </div>

                {/* 自定义辩题 */}
                <div className="p-4 bg-zinc-900 border border-dashed border-zinc-700 rounded-lg">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">
                    {t("roundtable.customTopic")}
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => {
                      setCustomTopic(e.target.value);
                      setDebateTopic(e.target.value);
                    }}
                    placeholder={t("roundtable.customPlaceholder")}
                    className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-orange-900/50"
                  />
                </div>
              </div>
            </section>

            {/* 开始辩论按钮 */}
            <div className="text-center pt-4">
              <button
                onClick={handleStartDebate}
                disabled={selectedPhilosophers.length < 2 || !debateTopic}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                {t("roundtable.start")}
              </button>
              {(selectedPhilosophers.length < 2 || !debateTopic) && (
                <p className="text-sm text-zinc-500 mt-2">
                  {t("roundtable.needMore")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Debate Stage */}
        {stage === "debate" && (
          <div className="space-y-6">
            {/* 辩题 */}
            <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-900/30 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-orange-500 mb-2">
                {debateTopic}
              </h2>
              <div className="flex items-center justify-center gap-4 text-sm text-zinc-400">
                <span>{t("roundtable.participants")}</span>
                {selectedPhilosophers.map(p => (
                  <span key={p.id} className="text-white">{p.nameCN}</span>
                ))}
              </div>
            </div>

            {/* 辩论记录 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
              <div className="space-y-6">
                {messages.map((msg) => {
                  const philosopher = msg.speaker !== "user" ? getPhilosopher(msg.speaker) : null;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-4 ${msg.speaker === "user" ? "justify-end" : ""}`}
                    >
                      {msg.speaker !== "user" && philosopher && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {philosopher.nameCN.slice(0, 1)}
                          </div>
                        </div>
                      )}
                      
                      <div className={`flex-1 max-w-2xl ${msg.speaker === "user" ? "text-right" : ""}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {msg.speaker !== "user" && philosopher && (
                            <>
                              <span className="font-semibold text-white">{philosopher.nameCN}</span>
                              <span className="text-xs text-zinc-500">{philosopher.school}</span>
                            </>
                          )}
                          {msg.speaker === "user" && (
                            <span className="font-semibold text-orange-500">{t("roundtable.you")}</span>
                          )}
                        </div>
                        <div className={`p-4 rounded-lg ${
                          msg.speaker === "user"
                            ? "bg-orange-900/30 border border-orange-900/50"
                            : "bg-zinc-800 border border-zinc-700"
                        }`}>
                          <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      </div>

                      {msg.speaker === "user" && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white">
                            <User className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isThinking && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-zinc-700 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                        <p className="text-zinc-500 italic">{t("roundtable.thinking")}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 用户输入 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleUserSend()}
                  placeholder={t("roundtable.inputPlaceholder")}
                  className="flex-1 p-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-orange-900/50"
                />
                <button
                  onClick={handleUserSend}
                  disabled={!userInput.trim() || isThinking}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  {t("roundtable.send")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
