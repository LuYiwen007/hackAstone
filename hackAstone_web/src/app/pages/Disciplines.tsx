import { Link } from "react-router";
import { Swords, Brain, User, Users } from "lucide-react";
import { useArenaCatalog } from "../context/ArenaCatalogContext";

export function Disciplines() {
  const { battles } = useArenaCatalog();
  const categories = ["全部", "商业", "心理学", "学习方法", "热点问题"];
  
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-xl">Cognitive Arena</h1>
                <p className="text-xs text-zinc-500">认知竞技场</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to="/disciplines"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800"
              >
                <Swords className="w-4 h-4" />
                <span className="text-sm">学科辩论</span>
              </Link>
              <Link 
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">思维画像</span>
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            >
              哲学辩论
            </Link>
            <Link
              to="/disciplines"
              className="px-4 py-2 rounded-lg bg-orange-600 text-white font-bold"
            >
              学科辩论
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            你真的想对了吗？
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            探索商业、心理学、学习方法等领域的认知对抗
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800 whitespace-nowrap text-sm"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Daily Battle */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-orange-500" />
            <h3 className="text-xl font-bold">今日推荐对局</h3>
          </div>
          <Link to={`/battle/${battles[0].id}`}>
            <div className="p-6 rounded-xl bg-gradient-to-br from-red-950/50 to-orange-950/30 border-2 border-orange-600/30 hover:border-orange-500/50 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-sm text-orange-400 mb-2">{battles[0].category}</div>
                  <h4 className="text-2xl font-bold mb-3 group-hover:text-orange-400 transition-colors">
                    {battles[0].question}
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center">
                  <Swords className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Builder vs Breaker</span>
                <span className="text-orange-400 group-hover:translate-x-1 transition-transform inline-block">
                  进入对局 →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* All Battles */}
        <div>
          <h3 className="text-xl font-bold mb-4">所有对局</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {battles.map((battle) => (
              <Link key={battle.id} to={`/battle/${battle.id}`}>
                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group h-full">
                  <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                    {battle.category}
                  </div>
                  <h4 className="text-lg font-bold mb-3 group-hover:text-zinc-300 transition-colors">
                    {battle.question}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Builder</span>
                    </div>
                    <span>vs</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>Breaker</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-zinc-800 text-center text-zinc-600 text-sm">
        <p>Cognitive Arena • 让思考成为习惯</p>
      </footer>
    </div>
  );
}
