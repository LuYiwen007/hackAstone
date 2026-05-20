import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Brain, Eye, EyeOff } from "lucide-react";
import { apiPost, setAuth } from "../../shared/api/client";
import { useArenaLocale } from "../context/ArenaLocaleContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useArenaLocale();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await apiPost<string>("/user/register", { username, password, nickname });
        const loginRes = await apiPost<{ token: string; userId: string; username: string; nickname: string }>(
          "/user/login",
          { username, password }
        );
        setAuth(loginRes);
        navigate("/profile");
      } else {
        const loginRes = await apiPost<{ token: string; userId: string; username: string; nickname: string }>(
          "/user/login",
          { username, password }
        );
        setAuth(loginRes);
        navigate("/profile");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("error.generic") || "操作失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {isRegister ? t("login.registerTitle") : t("login.title")}
          </h1>
          <p className="text-zinc-500 text-sm">
            {isRegister ? t("login.registerSubtitle") : t("login.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">{t("login.account")}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={t("login.placeholder.account")}
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">{t("login.nickname")}</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required={isRegister}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t("login.placeholder.nickname")}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">{t("login.password")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 pr-12 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={t("login.placeholder.password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? t("login.processing") : isRegister ? t("login.registerSubmit") : t("login.submit")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          {isRegister ? (
            <>
              {t("login.hasAccount")}{" "}
              <button
                onClick={() => { setIsRegister(false); setError(""); }}
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                {t("login.loginNow")}
              </button>
            </>
          ) : (
            <>
              {t("login.noAccount")}{" "}
              <button
                onClick={() => { setIsRegister(true); setError(""); }}
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                {t("login.registerNow")}
              </button>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-zinc-500 hover:text-zinc-300 text-sm">
            ← {t("login.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
