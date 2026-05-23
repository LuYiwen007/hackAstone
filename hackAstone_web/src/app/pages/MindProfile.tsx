import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Users, LogIn } from "lucide-react";
import {
  fetchMindProfile,
  type MindProfilePayload,
} from "../../shared/api/arena";
import { getAuth, isLoggedIn } from "../../shared/api/client";
import { UserAvatar } from "../components/UserAvatar";
import { useArenaLocale } from "../context/ArenaLocaleContext";
import { useUserSettings } from "../context/UserSettingsContext";

function statLabelKey(label: string): string {
  const map: Record<string, string> = {
    "已完成对局": "profile.stats.battles",
    "改变立场次数": "profile.stats.changed",
    "思维盲区": "profile.stats.blindspots",
    "准确判断率": "profile.stats.accuracy",
  };
  return map[label] || label;
}

const emptyProfile: MindProfilePayload = {
  biases: [],
  stats: [
    { label: "已完成对局", value: "0" },
    { label: "改变立场次数", value: "0" },
    { label: "思维盲区", value: "0" },
    { label: "准确判断率", value: "--" },
  ],
  recentBattles: [],
};

export function MindProfile() {
  const [data, setData] = useState<MindProfilePayload>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loggedIn = isLoggedIn();
  const auth = getAuth();
  const { t } = useArenaLocale();
  const { displayName, refreshFromServer } = useUserSettings();

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false);
      return;
    }
    void refreshFromServer();
    setLoading(true);
    setError("");
    fetchMindProfile()
      .then((res) => {
        setData(res);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : t("profile.error");
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [loggedIn, auth?.userId, t]);

  const { biases, stats, recentBattles } = data;
  const statsWithIcons = stats.map((s) => ({ ...s, icon: Users }));

  // 从 stats 中提取关键数字用于洞察
  const battlesCount = parseInt(stats.find((s) => s.label === "已完成对局")?.value || "0", 10) || 0;
  const changedCount = parseInt(stats.find((s) => s.label === "改变立场次数")?.value || "0", 10) || 0;
  const accuracyStr = stats.find((s) => s.label === "准确判断率")?.value || "--";

  // 找出最高和最低的偏差
  const sortedBiases = [...biases].sort((a, b) => b.percentage - a.percentage);
  const topBias = sortedBiases[0];

  const hasData = biases.length > 0 && battlesCount > 0;

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t("profile.backHome")}</span>
            </Link>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <UserAvatar size={80} name={displayName} />
          </div>
          <h1 className="text-3xl font-bold mb-4">{t("profile.guestTitle")}</h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
            {t("profile.guestHint")}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors font-bold"
          >
            <LogIn className="w-5 h-5" />
            {t("profile.loginRegister")}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("profile.backHome")}</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <UserAvatar size={28} name={displayName} />
            <span>{displayName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading && (
          <div className="text-center py-24">
            <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-zinc-500">{t("profile.loading")}</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-24">
            <p className="text-red-400 mb-4">{t("profile.error")}: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              {t("profile.retry")}
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Profile Header */}
            <div className="mb-12 text-center">
              <div className="mx-auto mb-4 flex justify-center">
                <UserAvatar size={80} name={displayName} />
              </div>
              <h1 className="text-4xl font-bold mb-2">{t("profile.title")}</h1>
              <p className="text-zinc-400 text-lg">{t("profile.subtitle")}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {statsWithIcons.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center"
                >
                  <stat.icon className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-zinc-500">{t(statLabelKey(stat.label))}</div>
                </div>
              ))}
            </div>

            {/* Cognitive Biases */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-bold">{t("profile.biases.title")}</h2>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <p className="text-zinc-400 mb-6">
                  {t("profile.biases.description")}
                </p>

                {!hasData ? (
                  <div className="text-center py-12 text-zinc-500">
                    <p>{t("profile.biases.empty")}</p>
                    <p className="mt-2">{t("profile.biases.emptyHint")}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {biases.map((bias) => (
                      <div key={bias.name}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold mb-1">{bias.name}</h3>
                            <p className="text-sm text-zinc-500">{bias.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold">{bias.percentage}%</div>
                            <div className="text-xs text-zinc-500">{t("profile.biases.instances", { count: bias.instances })}</div>
                          </div>
                        </div>
                        <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${bias.color} rounded-full transition-all`}
                            style={{ width: `${bias.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Insights */}
            {hasData && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">{t("profile.insights.title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-900 border-l-4 border-red-500 rounded-xl p-6">
                    <h3 className="font-bold mb-2 text-red-400">{t("profile.insights.warning")}</h3>
                    <p className="text-zinc-300">
                      {topBias
                        ? t("profile.insights.warningTemplate", { bias: topBias.name, percentage: topBias.percentage, description: topBias.description })
                        : t("profile.insights.warningFallback")}
                    </p>
                  </div>
                  <div className="bg-zinc-900 border-l-4 border-blue-500 rounded-xl p-6">
                    <h3 className="font-bold mb-2 text-blue-400">{t("profile.insights.strength")}</h3>
                    <p className="text-zinc-300">
                      {changedCount > 0
                        ? t("profile.insights.strengthTemplate", { count: changedCount })
                        : t("profile.insights.strengthFallback")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Battles */}
            <div>
              <h2 className="text-2xl font-bold mb-6">{t("profile.recent.title")}</h2>
              {recentBattles.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                  {t("profile.recent.empty")}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBattles.map((battle, index) => (
                    <div
                      key={index}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg flex-1">{battle.question}</h3>
                        {battle.changed && (
                          <span className="px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-xs font-bold">
                            {t("profile.recent.changed")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-start gap-4 text-sm">
                        <div className="flex-1">
                          <div className="text-zinc-500 mb-1">{t("profile.recent.yourChoice")}</div>
                          <div className="text-zinc-300">{battle.choice}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-zinc-500 mb-1">{t("profile.recent.judgeComment")}</div>
                          <div className="text-zinc-300">{battle.judgeComment}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <p className="text-zinc-400 mb-6">
                {t("profile.cta.quote")}
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/"
                  className="inline-block px-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-bold"
                >
                  {t("profile.cta.philosophy")}
                </Link>
                <Link
                  to="/disciplines"
                  className="inline-block px-8 py-4 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors font-bold"
                >
                  {t("profile.cta.disciplines")}
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
