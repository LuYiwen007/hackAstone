import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, X, Sparkles, MessageSquare, User } from "lucide-react";
import type { Philosopher } from "../data/philosophers";
import { philosopherForLocale } from "../data/philosopherLocale";
import {
  ROUNDTABLE_TOPIC_IDS,
  roundtableTopicDescriptionKey,
  roundtableTopicTitleKey,
  type RoundtableTopicId,
} from "../data/roundtableTopics";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { philosopherDisplayName, useArenaLocale } from "../context/ArenaLocaleContext";
import {
  streamRoundtablePhilosopherOpening,
  streamRoundtablePhilosopherReply,
} from "../../shared/api/arena";
import {
  finalizeRoundtableSpeech,
  roundtableMessageContent,
  roundtableStreamDisplayText,
  type RoundtableStoredMessage,
} from "../data/roundtableLocale";
import { ArenaHeader } from "../components/ArenaHeader";

type Stage = "setup" | "debate" | "summary";

type RoundtableLocationState = {
  selectedPhilosopherIds?: string[];
};

function contentFilterMessage(raw: string, t: (key: string) => string) {
  if (raw.includes("inappropriate") || raw.includes("内容安全")) {
    return t("roundtable.error.contentFilter");
  }
  return raw;
}

export function RoundtableDebate() {
  const { philosophers } = useArenaCatalog();
  const { t, locale } = useArenaLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("setup");
  const [selectedPhilosophers, setSelectedPhilosophers] = useState<Philosopher[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<RoundtableTopicId | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [messages, setMessages] = useState<RoundtableStoredMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

  useEffect(() => {
    const ids = (location.state as RoundtableLocationState | null)?.selectedPhilosopherIds;
    if (!ids?.length) return;
    const picked = ids
      .map((id) => philosophers.find((p) => p.id === id))
      .filter((p): p is Philosopher => p != null)
      .slice(0, 4);
    if (picked.length > 0) {
      setSelectedPhilosophers(picked);
    }
    navigate("/roundtable", { replace: true, state: {} });
  }, [location.state, philosophers, navigate]);

  useEffect(() => {
    if (stage !== "debate") return;
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [stage, messages, isThinking, activeSpeakerId]);

  const presetTopics = useMemo(
    () =>
      ROUNDTABLE_TOPIC_IDS.map((id) => ({
        id,
        title: t(roundtableTopicTitleKey(id)),
        description: t(roundtableTopicDescriptionKey(id)),
      })),
    [t, locale]
  );

  const debateTopic = useMemo(() => {
    if (selectedPresetId) {
      return t(roundtableTopicTitleKey(selectedPresetId));
    }
    return customTopic;
  }, [selectedPresetId, customTopic, t, locale]);

  const resolvePhilosopher = (p: Philosopher) => {
    const latest = philosophers.find((x) => x.id === p.id) ?? p;
    return philosopherForLocale(latest, locale);
  };

  const formatHistory = (msgs: RoundtableStoredMessage[]) =>
    msgs
      .map((m) => {
        const who =
          m.speaker === "user"
            ? t("roundtable.you")
            : philosopherDisplayName(
                philosophers.find((p) => p.id === m.speaker) ?? ({ id: m.speaker, nameCN: m.speaker } as Philosopher),
                locale
              );
        const text = roundtableMessageContent(m, locale);
        return `${who}: ${text}`;
      })
      .join("\n");

  const streamPhilosopherTurn = async (
    philosopher: Philosopher,
    mode: "opening" | "reply",
    prior: RoundtableStoredMessage[],
    userText?: string
  ): Promise<RoundtableStoredMessage> => {
    const latest = philosophers.find((x) => x.id === philosopher.id) ?? philosopher;
    const loc = philosopherForLocale(latest, locale);
    const msgId = `${mode}-${philosopher.id}-${Date.now()}`;
    const placeholder: RoundtableStoredMessage = {
      id: msgId,
      speaker: philosopher.id,
      content: "",
      timestamp: Date.now(),
    };

    setActiveSpeakerId(philosopher.id);
    setMessages([...prior, placeholder]);

    const body = {
      topic: debateTopic,
      philosopherId: philosopher.id,
      philosopherName: philosopherDisplayName(latest, locale),
      school: loc.school,
      keyIdeas: latest.keyIdeas?.join("。") ?? "",
      summary: loc.summary ?? latest.summary ?? "",
      history: formatHistory(prior),
      locale,
      ...(mode === "reply" && userText ? { userInput: userText } : {}),
    };

    const handlers = {
      onDelta: (_d: string, acc: string) => {
        const preview = roundtableStreamDisplayText(acc);
        setMessages((curr) =>
          curr.map((m) => (m.id === msgId ? { ...m, content: preview } : m))
        );
      },
    };

    const resp =
      mode === "opening"
        ? await streamRoundtablePhilosopherOpening(body, handlers)
        : await streamRoundtablePhilosopherReply(
            { ...body, userInput: userText ?? "" },
            handlers
          );

    const finalText = finalizeRoundtableSpeech(resp.text);
    if (!finalText.trim()) {
      throw new Error(
        mode === "opening" ? t("roundtable.error.openingJson") : t("roundtable.error.replyJson")
      );
    }

    const finished: RoundtableStoredMessage = {
      ...placeholder,
      content: finalText,
    };
    setMessages((curr) => curr.map((m) => (m.id === msgId ? finished : m)));
    return finished;
  };

  const handleAddPhilosopher = (philosopher: Philosopher) => {
    if (selectedPhilosophers.length >= 4) return;
    if (selectedPhilosophers.find((p) => p.id === philosopher.id)) return;
    setSelectedPhilosophers([...selectedPhilosophers, philosopher]);
  };

  const handleRemovePhilosopher = (philosopherId: string) => {
    setSelectedPhilosophers(selectedPhilosophers.filter((p) => p.id !== philosopherId));
  };

  const handleBackToSetup = () => {
    setStage("setup");
    setMessages([]);
    setUserInput("");
    setIsThinking(false);
    setActiveSpeakerId(null);
  };

  const handleStartDebate = async () => {
    if (selectedPhilosophers.length < 2 || !debateTopic) return;

    setStage("debate");
    setMessages([]);
    setIsThinking(true);
    setActiveSpeakerId(null);

    try {
      let hist: RoundtableStoredMessage[] = [];
      for (const p of selectedPhilosophers) {
        const msg = await streamPhilosopherTurn(p, "opening", hist);
        hist = [...hist, msg];
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : t("roundtable.error.openingFailed");
      toast.error(contentFilterMessage(raw, t));
      setStage("setup");
      setMessages([]);
    } finally {
      setIsThinking(false);
      setActiveSpeakerId(null);
    }
  };

  const handleUserSend = async () => {
    const userText = userInput.trim();
    if (!userText || isThinking) return;

    const userMessage: RoundtableStoredMessage = {
      id: `user-${Date.now()}`,
      speaker: "user",
      content: userText,
      timestamp: Date.now(),
    };
    const prior = [...messages, userMessage];
    setMessages(prior);
    setUserInput("");
    setIsThinking(true);

    try {
      let hist = prior;
      for (const p of selectedPhilosophers) {
        const msg = await streamPhilosopherTurn(p, "reply", hist, userText);
        hist = [...hist, msg];
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : t("roundtable.error.replyFailed");
      toast.error(contentFilterMessage(raw, t));
      setMessages(messages);
      setUserInput(userText);
    } finally {
      setIsThinking(false);
      setActiveSpeakerId(null);
    }
  };

  const getPhilosopher = (philosopherId: string) => philosophers.find((p) => p.id === philosopherId);

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
        {stage === "setup" && (
          <div className="space-y-8">
            <section>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-orange-500">1.</span> {t("roundtable.step1")}
                  <span className="text-sm font-normal text-zinc-400">
                    {t("roundtable.step1Hint")}
                  </span>
                </h2>
                <Link
                  to="/roundtable/philosophers"
                  state={{
                    selectedPhilosopherIds: selectedPhilosophers.map((p) => p.id),
                  } satisfies RoundtableLocationState}
                  className="ml-auto px-4 py-1.5 text-sm font-semibold rounded-lg border border-orange-700/60 text-orange-400 hover:bg-orange-950/40 hover:text-orange-300 transition-colors"
                >
                  {t("roundtable.viewAll")}
                </Link>
              </div>

              {selectedPhilosophers.length > 0 && (
                <div className="mb-6 p-4 bg-zinc-900 border border-orange-900/30 rounded-lg">
                  <h3 className="text-sm font-semibold text-orange-500 mb-3">
                    {t("roundtable.selected", { count: selectedPhilosophers.length })}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedPhilosophers.map((p) => {
                      const loc = resolvePhilosopher(p);
                      return (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                        >
                          <div>
                            <div className="font-semibold text-white">
                              {philosopherDisplayName(p, locale)}
                            </div>
                            <div className="text-xs text-zinc-500">{loc.school}</div>
                          </div>
                          <button
                            onClick={() => handleRemovePhilosopher(p.id)}
                            className="ml-2 p-1 hover:bg-zinc-700 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-zinc-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {philosophers
                  .filter((p) => p.majorWorks)
                  .map((p) => {
                    const loc = philosopherForLocale(p, locale);
                    const isSelected = selectedPhilosophers.find((sp) => sp.id === p.id);
                    const isFull = selectedPhilosophers.length >= 4;

                    return (
                      <button
                        key={p.id}
                        onClick={() => handleAddPhilosopher(p)}
                        disabled={!!isSelected || (isFull && !isSelected)}
                        className={`text-left p-3 border rounded-lg transition-all ${
                          isSelected
                            ? "bg-orange-900/30 border-orange-700 opacity-50 cursor-not-allowed"
                            : isFull
                              ? "bg-zinc-900 border-zinc-800 opacity-30 cursor-not-allowed"
                              : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800"
                        }`}
                      >
                        <div className="font-semibold text-white text-sm">
                          {philosopherDisplayName(p, locale)}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">{loc.school}</div>
                        {isSelected && (
                          <div className="text-xs text-orange-500 mt-1">✓ {t("roundtable.picked")}</div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-orange-500">2.</span> {t("roundtable.step2")}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {presetTopics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        setSelectedPresetId(topic.id);
                        setCustomTopic("");
                      }}
                      className={`text-left p-4 border rounded-lg transition-all ${
                        selectedPresetId === topic.id
                          ? "bg-orange-900/30 border-orange-700"
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800"
                      }`}
                    >
                      <h4 className="font-semibold text-white mb-1">{topic.title}</h4>
                      <p className="text-sm text-zinc-500">{topic.description}</p>
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-zinc-900 border border-dashed border-zinc-700 rounded-lg">
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">
                    {t("roundtable.customTopic")}
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => {
                      setSelectedPresetId(null);
                      setCustomTopic(e.target.value);
                    }}
                    placeholder={t("roundtable.customPlaceholder")}
                    className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-orange-900/50"
                  />
                </div>
              </div>
            </section>

            <div className="text-center pt-4">
              <button
                onClick={() => void handleStartDebate()}
                disabled={selectedPhilosophers.length < 2 || !debateTopic}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                {t("roundtable.start")}
              </button>
              {(selectedPhilosophers.length < 2 || !debateTopic) && (
                <p className="text-sm text-zinc-500 mt-2">{t("roundtable.needMore")}</p>
              )}
            </div>
          </div>
        )}

        {stage === "debate" && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleBackToSetup}
              disabled={isThinking}
              className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-50"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t("roundtable.backToSetup")}</span>
            </button>

            <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-900/30 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-orange-500 mb-2">{debateTopic}</h2>
              <div className="flex items-center justify-center gap-4 text-sm text-zinc-400 flex-wrap">
                <span>{t("roundtable.participants")}</span>
                {selectedPhilosophers.map((p) => (
                  <span key={p.id} className="text-white">
                    {philosopherDisplayName(p, locale)}
                  </span>
                ))}
              </div>
            </div>

            <div
              ref={chatScrollRef}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 min-h-[500px] max-h-[600px] overflow-y-auto"
            >
              <div className="space-y-6">
                {messages.map((msg) => {
                  const philosopher = msg.speaker !== "user" ? getPhilosopher(msg.speaker) : null;
                  const loc = philosopher ? resolvePhilosopher(philosopher) : null;
                  const speakerName = philosopher ? philosopherDisplayName(philosopher, locale) : "";
                  const bubbleText = roundtableMessageContent(msg, locale);
                  const isStreamingThis =
                    isThinking && activeSpeakerId === msg.speaker && msg.speaker !== "user";

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-4 ${msg.speaker === "user" ? "justify-end" : ""}`}
                    >
                      {msg.speaker !== "user" && philosopher && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {speakerName.slice(0, 1)}
                          </div>
                        </div>
                      )}

                      <div className={`flex-1 max-w-2xl ${msg.speaker === "user" ? "text-right" : ""}`}>
                        <div className={`flex items-center gap-2 mb-1 ${msg.speaker === "user" ? "justify-end" : ""}`}>
                          {msg.speaker !== "user" && philosopher && loc && (
                            <>
                              <span className="font-semibold text-white">{speakerName}</span>
                              <span className="text-xs text-zinc-500">{loc.school}</span>
                            </>
                          )}
                          {msg.speaker === "user" && (
                            <span className="font-semibold text-orange-500">{t("roundtable.you")}</span>
                          )}
                        </div>
                        <div
                          className={`p-4 rounded-lg ${
                            msg.speaker === "user"
                              ? "bg-orange-900/30 border border-orange-900/50"
                              : "bg-zinc-800 border border-zinc-700"
                          }`}
                        >
                          {bubbleText ? (
                            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                              {bubbleText}
                              {isStreamingThis && (
                                <span className="inline-block w-0.5 h-4 ml-0.5 bg-orange-400 animate-pulse align-middle" />
                              )}
                            </p>
                          ) : isStreamingThis ? (
                            <p className="text-zinc-500 italic">
                              {t("roundtable.philosopherThinking", { name: speakerName })}
                            </p>
                          ) : null}
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
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleUserSend()}
                  placeholder={t("roundtable.inputPlaceholder")}
                  disabled={isThinking}
                  className="flex-1 p-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-orange-900/50 disabled:opacity-50"
                />
                <button
                  onClick={() => void handleUserSend()}
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
