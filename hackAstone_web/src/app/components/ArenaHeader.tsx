import { AlertCircle, LogIn, LogOut, Swords, User, Users, UsersRound } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useArenaLocale } from "../context/ArenaLocaleContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getAuth, clearAuth, isLoggedIn } from "../../shared/api/client";

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

export function ArenaHeader({ currentPage, theme }: ArenaHeaderProps) {
  const { t } = useArenaLocale();
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const auth = getAuth();

  const handleLogout = () => {
    clearAuth();
    window.location.reload();
  };

  const pageMeta: Record<
    ArenaPage,
    {
      labelKey: string;
      to: string;
      icon?: typeof AlertCircle;
    }
  > = {
    home: { labelKey: "nav.philosophy", to: "/" },
    disciplines: { labelKey: "nav.disciplines", to: "/disciplines" },
    roundtable: { labelKey: "nav.roundtable", to: "/roundtable", icon: UsersRound },
    dilemma: { labelKey: "nav.dilemma", to: "/dilemma", icon: AlertCircle },
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${theme.iconBg}`}>
              <Users className={`h-6 w-6 ${theme.iconFg ?? "text-white"}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("app.title")}</h1>
              <p className="text-xs text-zinc-500">{t("app.subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {loggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 transition-colors hover:bg-zinc-800"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm max-w-[80px] truncate">
                    {auth?.nickname || auth?.username || t("nav.profile")}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 transition-colors hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                  title={t("nav.logout")}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 transition-colors hover:bg-zinc-800 text-zinc-300 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                <span className="text-sm">{t("nav.login")}</span>
              </Link>
            )}
          </div>
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
                {Icon ? (
                  <Icon className="h-4 w-4" />
                ) : pageKey === "disciplines" ? (
                  <Swords className="h-4 w-4" />
                ) : null}
                <span>{t(page.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
