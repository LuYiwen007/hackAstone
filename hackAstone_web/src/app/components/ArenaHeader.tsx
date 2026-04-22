import { AlertCircle, Swords, User, Users, UsersRound } from "lucide-react";
import { Link } from "react-router";

type ArenaPage = "home" | "disciplines" | "roundtable" | "dilemma";

type ArenaHeaderProps = {
  currentPage: ArenaPage;
  theme: {
    iconBg: string;
    iconFg?: string;
    activeButton: string;
    activeBorder?: string;
    activeHover?: string;
  };
};

const pageMeta: Record<
  ArenaPage,
  {
    label: string;
    to: string;
    icon?: typeof AlertCircle;
  }
> = {
  home: { label: "哲学辩论", to: "/" },
  disciplines: { label: "学科辩论", to: "/disciplines" },
  roundtable: { label: "圆桌辩论", to: "/roundtable", icon: UsersRound },
  dilemma: { label: "道德困境", to: "/dilemma", icon: AlertCircle },
};

export function ArenaHeader({ currentPage, theme }: ArenaHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${theme.iconBg}`}>
              <Users className={`h-6 w-6 ${theme.iconFg ?? "text-white"}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Cognitive Arena</h1>
              <p className="text-xs text-zinc-500">跨时空思想对话场</p>
            </div>
          </div>

          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 transition-colors hover:bg-zinc-800"
          >
            <User className="h-4 w-4" />
            <span className="text-sm">思维画像</span>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(pageMeta) as ArenaPage[]).map((pageKey) => {
            const page = pageMeta[pageKey];
            const Icon = page.icon;
            const active = pageKey === currentPage;
            const activeClasses = [
              theme.activeButton,
              theme.activeBorder ?? "",
              theme.activeHover ?? "",
              "font-bold text-white",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <Link
                key={pageKey}
                to={page.to}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
                  active
                    ? activeClasses
                    : "border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                {Icon ? <Icon className="h-4 w-4" /> : pageKey === "disciplines" ? <Swords className="h-4 w-4" /> : null}
                <span>{page.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
