import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Brain, Users } from "lucide-react";
import { fetchMindProfile, type MindProfilePayload } from "../../shared/api/arena";
import { getOrCreateUserId } from "../../shared/userSession";

const fallbackProfile: MindProfilePayload = {
  userId: "guest",
  persisted: false,
  biases: [
    {
      name: "确认偏差",
      description: "更容易注意支持自己原有观点的论据。",
      percentage: 72,
      color: "bg-red-500",
      instances: 13,
    },
    {
      name: "权威依赖",
      description: "更容易被权威表述或结构清晰的说法说服。",
      percentage: 58,
      color: "bg-orange-500",
      instances: 9,
    },
    {
      name: "过度自信",
      description: "在信息并不充分时也容易给出较高确定性。",
      percentage: 45,
      color: "bg-yellow-500",
      instances: 7,
    },
    {
      name: "忽略反例",
      description: "不够主动寻找与自己判断相反的样本。",
      percentage: 64,
      color: "bg-red-500",
      instances: 11,
    },
    {
      name: "二元思维",
      description: "倾向把复杂问题压缩成非黑即白的选项。",
      percentage: 51,
      color: "bg-orange-500",
      instances: 8,
    },
  ],
  stats: [
    { label: "已完成对局", value: "18" },
    { label: "改变立场次数", value: "7" },
    { label: "识别出的盲区", value: "5" },
    { label: "判断准确率", value: "61%" },
  ],
  recentBattles: [
    {
      question: "努力和选择，哪个更重要？",
      choice: "我还不确定",
      judgeComment: "你忽略了时间维度。",
      changed: true,
    },
    {
      question: "多任务处理真的高效吗？",
      choice: "支持 Breaker",
      judgeComment: "你默认所有任务都需要高认知投入。",
      changed: false,
    },
    {
      question: "AI 会让人变笨吗？",
      choice: "支持 Builder",
      judgeComment: "你混淆了工具放大和能力依赖。",
      changed: true,
    },
  ],
};

function formatUserLabel(userId: string) {
  if (!userId.startsWith("guest-")) {
    return userId;
  }
  return `访客 ${userId.slice(-4).toUpperCase()}`;
}

export function MindProfile() {
  const [userId, setUserId] = useState("guest");
  const [data, setData] = useState<MindProfilePayload>(fallbackProfile);

  useEffect(() => {
    const currentUserId = getOrCreateUserId();
    setUserId(currentUserId);

    fetchMindProfile(currentUserId)
      .then(setData)
      .catch(() =>
        setData({
          ...fallbackProfile,
          userId: currentUserId,
        })
      );
  }, []);

  const statsWithIcons = useMemo(
    () => data.stats.map((stat) => ({ ...stat, icon: Users })),
    [data.stats]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-zinc-100"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>返回首页</span>
          </Link>
          <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            当前用户：{formatUserLabel(data.userId ?? userId)}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-3xl">
            <Brain className="h-10 w-10" />
          </div>
          <h1 className="mb-2 text-4xl font-bold">你的思维画像</h1>
          <p className="text-lg text-zinc-400">这份画像已经开始按用户独立存储。</p>
          <p className="mt-2 text-sm text-zinc-500">
            {data.persisted ? "当前画像来自数据库" : "当前画像来自本地兜底数据"}
            {data.lastUpdatedAt ? ` · 最近更新 ${data.lastUpdatedAt}` : ""}
          </p>
        </div>

        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statsWithIcons.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center"
            >
              <stat.icon className="mx-auto mb-3 h-8 w-8 text-orange-500" />
              <div className="mb-1 text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <Users className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold">思维偏差雷达</h2>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="mb-6 text-zinc-400">
              这些数据来自你在辩论中的选择、论证倾向和被追问后的变化轨迹。
            </p>

            <div className="space-y-6">
              {data.biases.map((bias) => (
                <div key={bias.name}>
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 font-bold">{bias.name}</h3>
                      <p className="text-sm text-zinc-500">{bias.description}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold">{bias.percentage}%</div>
                      <div className="text-xs text-zinc-500">{bias.instances} 次出现</div>
                    </div>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-950">
                    <div
                      className={`h-full rounded-full transition-all ${bias.color}`}
                      style={{ width: `${bias.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">关键洞察</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border-l-4 border-red-500 bg-zinc-900 p-6">
              <h3 className="mb-2 font-bold text-red-400">需要注意</h3>
              <p className="text-zinc-300">
                你最容易在高确定性题目里忽略反例。下一次辩论可以先写出一个最能推翻自己结论的反面例子。
              </p>
            </div>
            <div className="rounded-xl border-l-4 border-blue-500 bg-zinc-900 p-6">
              <h3 className="mb-2 font-bold text-blue-400">你的优势</h3>
              <p className="text-zinc-300">
                你愿意在被追问后调整立场，这说明你不是只想赢，而是真的在更新判断。
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold">最近的思考记录</h2>
          <div className="space-y-4">
            {data.recentBattles.map((battle, index) => (
              <div
                key={`${battle.question}-${index}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="flex-1 text-lg font-bold">{battle.question}</h3>
                  {battle.changed && (
                    <span className="rounded-full bg-orange-600/20 px-3 py-1 text-xs font-bold text-orange-400">
                      已改变立场
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-4 text-sm md:flex-row">
                  <div className="flex-1">
                    <div className="mb-1 text-zinc-500">你的选择</div>
                    <div className="text-zinc-300">{battle.choice}</div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-zinc-500">Judge 的追问</div>
                    <div className="text-zinc-300">{battle.judgeComment}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="mb-6 text-zinc-400">画像会继续随着不同用户的辩论记录独立累计。</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/"
              className="inline-block rounded-lg bg-cyan-600 px-8 py-4 font-bold transition-colors hover:bg-cyan-700"
            >
              继续哲学辩论
            </Link>
            <Link
              to="/disciplines"
              className="inline-block rounded-lg bg-orange-600 px-8 py-4 font-bold transition-colors hover:bg-orange-700"
            >
              去学科辩论
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
