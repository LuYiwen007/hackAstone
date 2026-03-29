import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Users } from "lucide-react";
import {
  fetchMindProfile,
  type MindProfilePayload,
} from "../../shared/api/arena";

const fallbackProfile: MindProfilePayload = {
  biases: [
    {
      name: "确认偏差",
      description: "倾向于寻找支持已有观点的证据",
      percentage: 72,
      color: "bg-red-500",
      instances: 13,
    },
    {
      name: "权威依赖",
      description: "容易被权威或逻辑清晰的论述说服",
      percentage: 58,
      color: "bg-orange-500",
      instances: 9,
    },
    {
      name: "过度自信",
      description: "在不确定的情况下表现出过高的确定性",
      percentage: 45,
      color: "bg-yellow-500",
      instances: 7,
    },
    {
      name: "忽略反例",
      description: "倾向于忽视与观点相悖的案例",
      percentage: 64,
      color: "bg-red-500",
      instances: 11,
    },
    {
      name: "二元思维",
      description: "倾向于用非黑即白的方式看待问题",
      percentage: 51,
      color: "bg-orange-500",
      instances: 8,
    },
  ],
  stats: [
    { label: "已完成对局", value: "18" },
    { label: "改变立场次数", value: "7" },
    { label: "思维盲区", value: "5" },
    { label: "准确判断率", value: "61%" },
  ],
  recentBattles: [
    {
      question: "努力 vs 选择，哪个更重要？",
      choice: "我不确定",
      judgeComment: "你忽略了时间维度",
      changed: true,
    },
    {
      question: "多任务处理真的有效吗？",
      choice: "支持 Breaker",
      judgeComment: "你的假设是所有任务都需要高认知",
      changed: false,
    },
    {
      question: "AI 会让人变笨吗？",
      choice: "支持 Builder",
      judgeComment: "你混淆了工具和依赖性",
      changed: true,
    },
  ],
};

export function MindProfile() {
  const [data, setData] = useState<MindProfilePayload>(fallbackProfile);

  useEffect(() => {
    fetchMindProfile()
      .then(setData)
      .catch(() => setData(fallbackProfile));
  }, []);

  const { biases, stats, recentBattles } = data;
  const statsWithIcons = stats.map((s) => ({ ...s, icon: Users }));

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
            <span>返回首页</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="mb-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl mx-auto mb-4">
            🧠
          </div>
          <h1 className="text-4xl font-bold mb-2">你的思维画像</h1>
          <p className="text-zinc-400 text-lg">认识自己的思考方式</p>
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
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Cognitive Biases */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold">你的思维偏差地图</h2>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 mb-6">
              这些数据基于你在对局中的选择和理由。认识到自己的偏差，是改进思维的第一步。
            </p>

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
                      <div className="text-xs text-zinc-500">{bias.instances} 次出现</div>
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
          </div>
        </div>

        {/* Insights */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">关键洞察</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border-l-4 border-red-500 rounded-xl p-6">
              <h3 className="font-bold mb-2 text-red-400">需要注意</h3>
              <p className="text-zinc-300">
                在 72% 的情况下，你倾向于忽略反例和相反证据。尝试主动寻找挑战你观点的信息。
              </p>
            </div>
            <div className="bg-zinc-900 border-l-4 border-blue-500 rounded-xl p-6">
              <h3 className="font-bold mb-2 text-blue-400">优势</h3>
              <p className="text-zinc-300">
                你愿意改变立场（7次改变），说明你具有开放的心态。这是理性思考的重要品质。
              </p>
            </div>
          </div>
        </div>

        {/* Recent Battles */}
        <div>
          <h2 className="text-2xl font-bold mb-6">最近的思考记录</h2>
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
                      已改变立场
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-4 text-sm">
                  <div className="flex-1">
                    <div className="text-zinc-500 mb-1">你的选择</div>
                    <div className="text-zinc-300">{battle.choice}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-zinc-500 mb-1">Judge 的追问</div>
                    <div className="text-zinc-300">{battle.judgeComment}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-zinc-400 mb-6">
            "我以前想得有多不成熟" — 这是成长感的来源
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/"
              className="inline-block px-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-bold"
            >
              哲学辩论
            </Link>
            <Link 
              to="/disciplines"
              className="inline-block px-8 py-4 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors font-bold"
            >
              学科辩论
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}