import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Users, Clock, User, Swords, UsersRound } from "lucide-react";
import { getPhilosophersByPeriodAndRegion, type Philosopher } from "../data/philosophers";
import { PhilosopherCard } from "../components/PhilosopherCard";
import { useArenaCatalog } from "../context/ArenaCatalogContext";

export function Home() {
  const navigate = useNavigate();
  const { philosophers, regions, timePeriods } = useArenaCatalog();
  const [currentYear, setCurrentYear] = useState(1700);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<Philosopher | null>(null);

  const currentPeriod = timePeriods.find((p) => p.year === currentYear);

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  const handlePhilosopherClick = (philosopher: Philosopher) => {
    setSelectedPhilosopher(philosopher);
  };

  const handleStartDebate = () => {
    if (selectedPhilosopher) {
      navigate(`/philosophy-battle/${selectedPhilosopher.id}?year=${currentYear}`);
    }
  };

  const handleCloseCard = () => {
    setSelectedPhilosopher(null);
  };

  const regionPhilosophers = selectedRegion
    ? getPhilosophersByPeriodAndRegion(currentYear, selectedRegion, philosophers)
    : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-xl">Cognitive Arena</h1>
                <p className="text-xs text-zinc-500">认知竞技场</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to="/roundtable"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white transition-colors border border-orange-800"
              >
                <UsersRound className="w-4 h-4" />
                <span className="text-sm font-semibold">圆桌辩论</span>
              </Link>
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
              className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold"
            >
              哲学辩论
            </Link>
            <Link
              to="/disciplines"
              className="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            >
              学科辩论
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            与历史上的思想家对话
          </h2>
          <p className="text-zinc-400">选择一个时代，探索不同区域的哲学家，开启一场跨越时空的辩论</p>
        </div>

        {/* Timeline */}
        <div className="mb-12 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-purple-500" />
            <h3 className="text-xl font-bold">时间轴</h3>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
              <span>前500年</span>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{currentPeriod?.label}</div>
                <div className="text-xs text-zinc-500">{currentPeriod?.era}</div>
              </div>
              <span>2000年</span>
            </div>
            
            <input
              type="range"
              min="0"
              max={timePeriods.length - 1}
              value={timePeriods.findIndex((p) => p.year === currentYear)}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                setCurrentYear(timePeriods[index].year);
                setSelectedRegion(null);
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          <div className="flex justify-between text-xs text-zinc-600">
            <span>古代</span>
            <span>中世纪</span>
            <span>近代</span>
            <span>现代</span>
          </div>
        </div>

        {/* World Map */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">世界地图</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 relative" style={{ minHeight: "500px" }}>
            {/* Simplified world map using regions */}
            <div className="relative w-full h-[450px]">
              {regions.map((region) => {
                const count = getPhilosophersByPeriodAndRegion(
                  currentYear,
                  region.id,
                  philosophers
                ).length;
                
                return (
                  <button
                    key={region.id}
                    onClick={() => handleRegionClick(region.id)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                      selectedRegion === region.id
                        ? "scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  >
                    <div className="text-center">
                      <div className={`mb-2 px-4 py-2 rounded-lg border-2 ${
                        selectedRegion === region.id
                          ? "bg-purple-600 border-purple-400"
                          : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
                      }`}>
                        <div className="font-bold">{region.name}</div>
                        <div className="text-xs text-zinc-400 mt-1">
                          {count > 0 ? `${count} 位哲学家` : "暂无"}
                        </div>
                      </div>
                      
                      {/* Display philosophers as icons */}
                      {count > 0 && (
                        <div className="flex gap-1 justify-center flex-wrap max-w-[120px]">
                          {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                selectedRegion === region.id
                                  ? "bg-purple-500 animate-pulse"
                                  : "bg-zinc-700"
                              }`}
                            >
                              <User className="w-3 h-3" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Map background decoration */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Simple continent outlines */}
                  <ellipse cx="50" cy="25" rx="20" ry="15" fill="currentColor" opacity="0.3" />
                  <ellipse cx="80" cy="35" rx="15" ry="20" fill="currentColor" opacity="0.3" />
                  <ellipse cx="20" cy="35" rx="12" ry="18" fill="currentColor" opacity="0.3" />
                  <ellipse cx="65" cy="45" rx="10" ry="10" fill="currentColor" opacity="0.3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Philosopher List Modal */}
        {selectedRegion && regionPhilosophers.length > 0 && (
          <div className="bg-zinc-900 border-2 border-purple-600/30 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">
              {regions.find((r) => r.id === selectedRegion)?.name} - {currentPeriod?.label}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regionPhilosophers.map((philosopher) => (
                <button
                  key={philosopher.id}
                  onClick={() => handlePhilosopherClick(philosopher)}
                  className="text-left p-4 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-purple-600 transition-all group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {philosopher.nameCN[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold group-hover:text-purple-400 transition-colors truncate">
                        {philosopher.nameCN}
                      </h4>
                      <p className="text-xs text-zinc-500 truncate">{philosopher.name}</p>
                      <p className="text-xs text-zinc-600 mt-1">{philosopher.school}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-zinc-500 space-y-1">
                    {philosopher.keyIdeas.slice(0, 2).map((idea, i) => (
                      <div key={i} className="truncate">• {idea}</div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedRegion(null)}
              className="mt-6 w-full py-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              返回地图
            </button>
          </div>
        )}

        {selectedRegion && regionPhilosophers.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-400 mb-4">
              在{currentPeriod?.label}的{regions.find((r) => r.id === selectedRegion)?.name}暂无著名哲学家
            </p>
            <button
              onClick={() => setSelectedRegion(null)}
              className="px-6 py-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              返回地图
            </button>
          </div>
        )}

        {/* Philosopher Detail Card */}
        {selectedPhilosopher && (
          <PhilosopherCard
            philosopher={selectedPhilosopher}
            onClose={handleCloseCard}
            onStartDebate={handleStartDebate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-zinc-800 text-center text-zinc-600 text-sm">
        <p>Cognitive Arena • 让思考成为习惯</p>
      </footer>
    </div>
  );
}