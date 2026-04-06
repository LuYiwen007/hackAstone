import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Users, Plus, X, Sparkles, MessageSquare, User } from "lucide-react";
import type { Philosopher } from "../data/philosophers";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { PhilosopherAvatar } from "../components/PhilosopherAvatar";
import { generateRoundtableOpenings, generateRoundtableReply } from "../../shared/api/arena";

interface Message {
  id: string;
  speaker: "user" | string; // "user" 或思想家ID
  content: string;
  timestamp: number;
}

type Stage = "setup" | "debate" | "summary";

export function RoundtableDebate() {
  const { philosophers } = useArenaCatalog();
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
    
    // 优先走后端 Echo Agent，失败时回退本地生成
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
        throw new Error("empty server messages");
      })
      .catch(() => {
        const openingMessages: Message[] = selectedPhilosophers.map((p, index) => ({
          id: `opening-${p.id}`,
          speaker: p.id,
          content: generateOpening(p, debateTopic, index),
          timestamp: Date.now() + index * 1000,
        }));
        setMessages(openingMessages);
      })
      .finally(() => setIsThinking(false));
  };

  const handleUserSend = () => {
    if (!userInput.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: "user",
      content: userInput,
      timestamp: Date.now(),
    };
    setMessages([...messages, userMessage]);
    setUserInput("");

    // 优先走后端 Echo Agent，失败时回退本地生成
    setIsThinking(true);
    const participants = selectedPhilosophers.map((p) => ({ id: p.id, nameCN: p.nameCN, school: p.school }));
    generateRoundtableReply(debateTopic, userInput, participants)
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
        throw new Error("empty server responses");
      })
      .catch(() => {
        const responses = selectedPhilosophers.map((p, index) => ({
          id: `response-${p.id}-${Date.now()}`,
          speaker: p.id,
          content: generateResponse(p, userInput, debateTopic),
          timestamp: Date.now() + index * 2000,
        }));
        setMessages((prev) => [...prev, ...responses]);
      })
      .finally(() => setIsThinking(false));
  };

  const getPhilosopher = (philosopherId: string) => {
    return philosophers.find(p => p.id === philosopherId);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回主页</span>
            </Link>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-orange-500" />
              <h1 className="text-xl font-bold">多思想家圆桌辩论</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Setup Stage */}
        {stage === "setup" && (
          <div className="space-y-8">
            {/* 选择思想家 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-orange-500">1.</span> 选择思想家
                <span className="text-sm font-normal text-zinc-400 ml-2">
                  （2-4位，可跨时空）
                </span>
              </h2>

              {/* 已选择的思想家 */}
              {selectedPhilosophers.length > 0 && (
                <div className="mb-6 p-4 bg-zinc-900 border border-orange-900/30 rounded-lg">
                  <h3 className="text-sm font-semibold text-orange-500 mb-3">
                    已选择 {selectedPhilosophers.length} / 4
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedPhilosophers.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                      >
                        <PhilosopherAvatar philosopher={p} className="w-9 h-9 flex-shrink-0" />
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
                        <div className="flex items-center gap-3 mb-2">
                          <PhilosopherAvatar philosopher={p} className="w-10 h-10 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-white text-sm">{p.nameCN}</div>
                            <div className="text-xs text-zinc-500">{p.school}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="text-xs text-orange-500 mt-1">✓ 已选择</div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </section>

            {/* 选择辩题 */}
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-orange-500">2.</span> 选择或输入辩题
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
                    或者，输入你自己的辩题：
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => {
                      setCustomTopic(e.target.value);
                      setDebateTopic(e.target.value);
                    }}
                    placeholder="例如：元宇宙是否会导致人类逃避现实？"
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
                开始圆桌辩论
              </button>
              {(selectedPhilosophers.length < 2 || !debateTopic) && (
                <p className="text-sm text-zinc-500 mt-2">
                  请至少选择2位思想家并设定辩题
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
                <span>参与者：</span>
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
                          <PhilosopherAvatar philosopher={philosopher} className="w-10 h-10 text-sm" />
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
                            <span className="font-semibold text-orange-500">你</span>
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
                        <p className="text-zinc-500 italic">思想家们正在思考...</p>
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
                  placeholder="插话或提出新的观点..."
                  className="flex-1 p-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-orange-900/50"
                />
                <button
                  onClick={handleUserSend}
                  disabled={!userInput.trim() || isThinking}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  发送
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 模拟AI生成开场白
function generateOpening(philosopher: Philosopher, topic: string, order: number): string {
  const openings: Record<string, string> = {
    socrates: `让我们先澄清一下："${topic}"——这个问题本身是什么意思？在我们讨论之前，我们真的理解这些概念吗？我知道我对此一无所知，但我很好奇各位的看法。`,
    
    plato: `这个问题触及了现象与理念的根本区别。我们在日常世界中看到的只是影子，真正的答案存在于理念界。让我从理性的角度来分析...`,
    
    confucius: `${order === 0 ? '诸位贤者，' : ''}关于"${topic}"，我想从"仁"与"礼"的角度来思考。一个和谐的答案，应当既符合人性，又合乎规矩。`,
    
    laozi: `诸位的讨论似乎都在"有为"之中。但真正的智慧是否在于"无为"？道可道，非常道。关于"${topic}"，我们是否问错了问题？`,
    
    kant: `我建议我们用纯粹理性来审视这个问题。"${topic}"——这涉及到先验综合判断。我们需要区分现象与物自体...`,
    
    nietzsche: `哈！你们又在追求"真理"了。但"${topic}"这个问题本身，不就是弱者寻求确定性的表现吗？让我们重估一切价值！`,
    
    sartre: `"${topic}"——这个问题的答案不在于某个客观真理，而在于我们的选择。存在先于本质，我们必须为自己的选择负责。`,
    
    marx: `让我们从历史唯物主义的角度来看"${topic}"。这不是抽象的哲学问题,而是具体的社会经济问题。物质决定意识...`,
  };

  return openings[philosopher.id] || `作为${philosopher.school}的代表,我认为"${topic}"需要从${philosopher.keyIdeas[0]}的角度来理解。`;
}

// 模拟AI生成回应
function generateResponse(philosopher: Philosopher, userInput: string, topic: string): string {
  const responses: Record<string, string> = {
    socrates: `有趣的观点。但让我问你：当你说"${userInput.slice(0, 20)}..."时，你真的理解这意味着什么吗？如果我继续追问，你能一直保持这个立场吗？`,
    
    confucius: `你的观点中有可取之处。但是，我们是否考虑到了"仁"？如果这个选择不能推己及人，恐怕难以长久。`,
    
    laozi: `你说得很多，但也许说得太多了。"多言数穷，不如守中。"有时候，少做一点反而更有效。`,
    
    nietzsche: `你还在用"应该"、"正确"这些词吗？这些都是奴隶道德的遗毒！强者创造价值，而不是追随价值。`,
    
    kant: `你的论证缺乏普遍性。让我问：如果所有人都这样做，世界会怎样？这能成为普遍法则吗？`,
    
    sartre: `你在为你的选择寻找理由，但理由永远是后来加上的。你已经选择了，现在你必须承担责任。`,
  };

  return responses[philosopher.id] || `从${philosopher.school}的角度看，${userInput.slice(0, 30)}...这个观点需要结合${philosopher.keyIdeas[0]}来理解。`;
}

function parseJsonPayload<T>(raw: string): T | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const direct = tryParse<T>(trimmed);
  if (direct) return direct;
  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i) || trimmed.match(/```\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return tryParse<T>(fenced[1].trim());
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return tryParse<T>(trimmed.slice(first, last + 1));
  return null;
}

function tryParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
