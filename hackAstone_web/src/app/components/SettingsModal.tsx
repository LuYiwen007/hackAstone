import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import {
  X,
  User,
  CreditCard,
  Globe,
  Palette,
  Bell,
  ChevronRight,
  Check,
  Zap,
  Crown,
  Shield,
  Camera,
} from "lucide-react";
import { useArenaLocale } from "../context/ArenaLocaleContext";
import {
  clearAuth,
  fetchCurrentUser,
  getAuth,
  isLoggedIn,
  patchAuthProfile,
  updateUserProfile,
  uploadUserAvatar,
  type UserSettings,
} from "../../shared/api/client";
import type { ThemeId } from "../../shared/api/userSettings";
import { markUserChosenLocale, type ArenaLocale } from "../../shared/i18n/format";
import { useUserSettings } from "../context/UserSettingsContext";
import { UserAvatar } from "./UserAvatar";

type SettingsSection = "general" | "subscription" | "language" | "appearance" | "notifications";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

const plans = [
  {
    id: "free",
    name: "免费版",
    nameEn: "Free",
    price: "¥0",
    period: "/月",
    description: "探索认知对抗的起点",
    features: ["每日 5 场辩论", "基础思维画像", "3 位思想家"],
    icon: Shield,
    color: "zinc",
    current: true,
  },
  {
    id: "pro",
    name: "专业版",
    nameEn: "Pro",
    price: "¥29",
    period: "/月",
    description: "深度认知训练体验",
    features: [
      "无限场次辩论",
      "完整思维画像分析",
      "全部思想家解锁",
      "圆桌辩论模式",
      "闪卡与测验生成",
    ],
    icon: Zap,
    color: "orange",
    current: false,
  },
  {
    id: "elite",
    name: "精英版",
    nameEn: "Elite",
    price: "¥89",
    period: "/月",
    description: "顶级认知竞技体验",
    features: [
      "专业版全部功能",
      "AI 深度反馈报告",
      "认知偏差周报",
      "优先体验新功能",
      "专属社群",
    ],
    icon: Crown,
    color: "purple",
    current: false,
  },
];

const navItems: {
  id: SettingsSection;
  label: string;
  labelEn: string;
  icon: React.ElementType;
}[] = [
  { id: "general", label: "通用", labelEn: "General", icon: User },
  { id: "subscription", label: "订阅方案", labelEn: "Plan & Billing", icon: CreditCard },
  { id: "language", label: "语言", labelEn: "Language", icon: Globe },
  { id: "appearance", label: "外观", labelEn: "Appearance", icon: Palette },
  { id: "notifications", label: "通知", labelEn: "Notifications", icon: Bell },
];

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 py-4 last:border-0">
      <div className="min-w-0 flex-1 pr-8">
        <div className="text-sm font-medium text-zinc-100">{label}</div>
        {description ? <div className="mt-0.5 text-xs text-zinc-500">{description}</div> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 rounded-full transition-colors ${checked ? "bg-orange-600" : "bg-zinc-700"}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { locale, t } = useArenaLocale();
  const { settings, patchSettings, refreshFromServer, displayName: ctxDisplayName } =
    useUserSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveSettingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [section, setSection] = useState<SettingsSection>("general");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const loggedIn = isLoggedIn();
  const auth = getAuth();

  const persistSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      if (saveSettingsTimer.current) clearTimeout(saveSettingsTimer.current);
      saveSettingsTimer.current = setTimeout(async () => {
        try {
          await patchSettings(patch);
          setProfileError("");
        } catch (err: unknown) {
          setProfileError(err instanceof Error ? err.message : "设置保存失败");
        }
      }, 350);
    },
    [patchSettings]
  );

  const loadProfile = useCallback(async () => {
    if (!isLoggedIn()) return;
    setProfileLoading(true);
    setProfileError("");
    const cached = getAuth();
    if (cached) {
      setNickname(cached.nickname);
      setEmail(cached.email ?? "");
    }
    try {
      await refreshFromServer();
      const profile = await fetchCurrentUser();
      setNickname(profile.nickname);
      setEmail(profile.email ?? "");
      patchAuthProfile({
        nickname: profile.nickname,
        email: profile.email,
        avatarUrl: profile.avatarUrl ?? null,
      });
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setProfileLoading(false);
    }
  }, [refreshFromServer]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !loggedIn) return;
    void loadProfile();
  }, [open, loggedIn, loadProfile]);

  if (!open) return null;

  const isZh = locale === "zh";
  const displayName =
    nickname.trim() || ctxDisplayName || auth?.nickname || auth?.username || (isZh ? "认知竞技者" : "Arena Player");
  const planLabel = isZh ? "免费版" : "Free";
  const prefs = settings.preferences;
  const notifications = settings.notifications;
  const theme = settings.appearance.theme;

  async function handleSaveProfile() {
    if (!loggedIn) return;
    setSaving(true);
    setProfileError("");
    setProfileSaved(false);
    try {
      const profile = await updateUserProfile(nickname.trim());
      setNickname(profile.nickname);
      setEmail(profile.email ?? "");
      patchAuthProfile({
        nickname: profile.nickname,
        email: profile.email,
        avatarUrl: profile.avatarUrl ?? null,
      });
      setProfileSaved(true);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setAvatarUploading(true);
    setProfileError("");
    try {
      const profile = await uploadUserAvatar(file);
      patchAuthProfile({ avatarUrl: profile.avatarUrl ?? null });
      await refreshFromServer();
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "头像上传失败");
    } finally {
      setAvatarUploading(false);
    }
  }

  function updatePrefs(patch: Partial<typeof prefs>) {
    persistSettings({ preferences: { ...prefs, ...patch } });
  }

  function updateNotifications(patch: Partial<typeof notifications>) {
    persistSettings({ notifications: { ...notifications, ...patch } });
  }

  function updateTheme(next: ThemeId) {
    persistSettings({ appearance: { theme: next } });
  }

  function handleLogout() {
    clearAuth();
    onClose();
    window.location.reload();
  }

  const sectionTitle =
    (isZh
      ? navItems.find((n) => n.id === section)?.label
      : navItems.find((n) => n.id === section)?.labelEn) ?? "";

  if (!loggedIn) {
    return createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
        <div
          role="dialog"
          aria-modal
          aria-labelledby="settings-guest-title"
          className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <h2 id="settings-guest-title" className="text-base font-semibold text-zinc-100">
              {isZh ? "设置" : "Settings"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              aria-label={t("settings.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-6 py-12 text-center">
            <p className="mb-6 text-sm text-zinc-400">
              {isZh ? "登录后可查看并编辑账户信息" : "Sign in to view and edit your account"}
            </p>
            <Link
              to="/login"
              onClick={onClose}
              className="inline-block rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
            >
              {isZh ? "登录 / 注册" : "Sign in"}
            </Link>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal
        aria-labelledby="settings-dialog-title"
        className="relative z-10 flex h-[min(580px,calc(100vh-2rem))] w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
      >
        <div className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-4 py-5">
            <div className="flex items-center gap-3">
              <UserAvatar size={36} name={displayName} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-zinc-100">{displayName}</div>
                <div className="truncate text-xs text-zinc-500">
                  {loggedIn && email ? email : planLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-zinc-800 px-3 py-3">
            <input
              className="w-full rounded-md border border-transparent bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600"
              placeholder={isZh ? "搜索设置…" : "Search settings…"}
            />
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`mx-1 flex w-[calc(100%-8px)] items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors ${
                    active
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-medium">{isZh ? item.label : item.labelEn}</span>
                  {active ? <ChevronRight className="ml-auto h-3 w-3 text-zinc-500" /> : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <h2 id="settings-dialog-title" className="text-base font-semibold text-zinc-100">
              {sectionTitle}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              aria-label={t("settings.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            {section === "general" && (
              <div>
                  <div className="mt-2 mb-6">
                    <div className="mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                      {isZh ? "个人资料" : "Profile"}
                    </div>
                    <div className="rounded-lg bg-zinc-800/50 px-4 py-5">
                      <div className="mb-5 flex flex-col items-center gap-3">
                        <button
                          type="button"
                          disabled={avatarUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="group relative disabled:opacity-60"
                          aria-label={isZh ? "更换头像" : "Change avatar"}
                        >
                          <UserAvatar size={72} name={displayName} />
                          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Camera className="h-5 w-5 text-white" />
                          </span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => void handleAvatarFile(e)}
                        />
                        <p className="text-center text-xs text-zinc-500">
                          {avatarUploading
                            ? isZh
                              ? "正在上传头像…"
                              : "Uploading avatar…"
                            : isZh
                              ? "点击上传头像（JPEG/PNG，最大 2MB）"
                              : "Tap to upload (JPEG/PNG, max 2MB)"}
                        </p>
                      </div>
                      {profileLoading ? (
                        <p className="py-2 text-center text-xs text-zinc-500">
                          {isZh ? "正在同步账户…" : "Syncing account…"}
                        </p>
                      ) : null}
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs text-zinc-500">
                            {isZh ? "昵称" : "Display name"}
                          </label>
                          <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-600"
                            placeholder={isZh ? "展示名称" : "Name shown in the app"}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-zinc-500">
                            {isZh ? "邮箱" : "Email"}
                          </label>
                          <div className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-400">
                            {email || "—"}
                          </div>
                          <p className="mt-1 text-xs text-zinc-600">
                            {isZh ? "邮箱不可修改" : "Email cannot be changed here"}
                          </p>
                        </div>
                        {profileError ? (
                          <p className="text-xs text-orange-400">{profileError}</p>
                        ) : null}
                        {profileSaved ? (
                          <p className="text-xs text-green-500">
                            {isZh ? "资料已保存" : "Profile saved"}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          disabled={saving || profileLoading || !nickname.trim()}
                          onClick={() => void handleSaveProfile()}
                          className="w-full rounded-lg bg-orange-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-zinc-700"
                        >
                          {saving
                            ? isZh
                              ? "保存中…"
                              : "Saving…"
                            : isZh
                              ? "保存资料"
                              : "Save profile"}
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full rounded-lg border border-zinc-700 py-2 text-sm text-red-400 transition-colors hover:bg-zinc-800"
                        >
                          {isZh ? "退出登录" : "Log out"}
                        </button>
                      </div>
                    </div>
                  </div>

                <div className="mb-6">
                  <div className="mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                    {isZh ? "账户" : "Account"}
                  </div>
                  <div className="rounded-lg bg-zinc-800/50 px-4">
                    <SettingRow
                      label={isZh ? "账户类型" : "Account Type"}
                      description={
                        isZh ? "当前使用免费版" : "Currently on Free plan"
                      }
                    >
                      <button
                        type="button"
                        onClick={() => setSection("subscription")}
                        className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-700"
                      >
                        {isZh ? "升级" : "Upgrade"}
                      </button>
                    </SettingRow>
                    <SettingRow
                      label={isZh ? "数据与隐私" : "Data & Privacy"}
                      description={
                        isZh ? "管理你的学习数据" : "Manage your learning data"
                      }
                    >
                      <button
                        type="button"
                        className="rounded-md bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-600"
                      >
                        {isZh ? "管理" : "Manage"}
                      </button>
                    </SettingRow>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                    {isZh ? "偏好设置" : "Preferences"}
                  </div>
                  <div className="rounded-lg bg-zinc-800/50 px-4">
                    <SettingRow
                      label={isZh ? "自动保存辩论记录" : "Auto-save debate history"}
                      description={
                        isZh
                          ? "辩论结束后自动保存到思维画像"
                          : "Save results to mind profile automatically"
                      }
                    >
                      <Toggle
                        checked={prefs.autoSave}
                        onChange={(v) => updatePrefs({ autoSave: v })}
                      />
                    </SettingRow>
                    <SettingRow
                      label={isZh ? "声音效果" : "Sound Effects"}
                      description={
                        isZh ? "交互音效反馈" : "Auditory feedback for interactions"
                      }
                    >
                      <Toggle
                        checked={prefs.sound}
                        onChange={(v) => updatePrefs({ sound: v })}
                      />
                    </SettingRow>
                    <SettingRow
                      label={isZh ? "显示思考时间" : "Show Thinking Timer"}
                      description={
                        isZh
                          ? "在辩论时显示作答倒计时"
                          : "Display countdown during debates"
                      }
                    >
                      <Toggle
                        checked={prefs.timer}
                        onChange={(v) => updatePrefs({ timer: v })}
                      />
                    </SettingRow>
                  </div>
                </div>
              </div>
            )}

            {section === "subscription" && (
              <div className="py-2">
                <p className="mb-5 text-xs text-zinc-500">
                  {isZh
                    ? "解锁完整认知训练体验，加速思维升级"
                    : "Unlock the full cognitive training experience"}
                </p>
                <div className="space-y-3">
                  {plans.map((plan) => {
                    const Icon = plan.icon;
                    const colorMap = {
                      zinc: "border-zinc-700 bg-zinc-800/40",
                      orange: "border-orange-600/60 bg-orange-950/30",
                      purple: "border-purple-600/60 bg-purple-950/30",
                    };
                    const accentMap = {
                      zinc: "text-zinc-400",
                      orange: "text-orange-400",
                      purple: "text-purple-400",
                    };
                    const color = plan.color as keyof typeof colorMap;
                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-xl border p-4 ${colorMap[color]}`}
                      >
                        {plan.current ? (
                          <span className="absolute top-3 right-3 rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                            {isZh ? "当前方案" : "Current"}
                          </span>
                        ) : null}
                        <div className="mb-3 flex items-start gap-3">
                          <Icon className={`mt-0.5 h-5 w-5 ${accentMap[color]}`} />
                          <div>
                            <div className="text-sm font-semibold text-zinc-100">
                              {isZh ? plan.name : plan.nameEn}
                            </div>
                            <div className="text-xs text-zinc-500">{plan.description}</div>
                          </div>
                          <div className="ml-auto text-right">
                            <span className={`text-lg font-bold ${accentMap[color]}`}>
                              {plan.price}
                            </span>
                            <span className="text-xs text-zinc-600">{plan.period}</span>
                          </div>
                        </div>
                        <ul className="mb-3 space-y-1">
                          {plan.features.map((f) => (
                            <li
                              key={f}
                              className="flex items-center gap-2 text-xs text-zinc-400"
                            >
                              <Check className="h-3 w-3 shrink-0 text-zinc-500" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        {!plan.current ? (
                          <button
                            type="button"
                            className={`w-full rounded-lg py-2 text-xs font-semibold transition-colors ${
                              plan.color === "purple"
                                ? "bg-purple-600 text-white hover:bg-purple-700"
                                : "bg-orange-600 text-white hover:bg-orange-700"
                            }`}
                          >
                            {isZh
                              ? `升级到${plan.name}`
                              : `Upgrade to ${plan.nameEn}`}
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {section === "language" && (
              <div className="py-2">
                <div className="mt-2 mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  {isZh ? "界面语言" : "Interface Language"}
                </div>
                <div className="overflow-hidden rounded-lg bg-zinc-800/50">
                  {(
                    [
                      {
                        code: "zh" as ArenaLocale,
                        label: "中文（简体）",
                        sublabel: "Chinese (Simplified)",
                      },
                      { code: "en" as ArenaLocale, label: "English", sublabel: "英语" },
                    ] as const
                  ).map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        markUserChosenLocale();
                        void persistSettings({ locale: lang.code });
                      }}
                      className={`flex w-full items-center justify-between border-b border-zinc-800 px-4 py-3.5 transition-colors last:border-0 hover:bg-zinc-800 ${
                        locale === lang.code ? "bg-zinc-800/80" : ""
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium text-zinc-100">{lang.label}</div>
                        <div className="text-xs text-zinc-500">{lang.sublabel}</div>
                      </div>
                      {locale === lang.code ? (
                        <Check className="h-4 w-4 text-orange-500" />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {section === "appearance" && (
              <div className="py-2">
                <div className="mt-2 mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  {isZh ? "颜色主题" : "Color Theme"}
                </div>
                <div className="mb-6 grid grid-cols-3 gap-3">
                  {(
                    [
                      {
                        id: "dark" as const,
                        label: isZh ? "深色" : "Dark",
                        bg: "#18181b",
                        accent: "#ea580c",
                      },
                      {
                        id: "darker" as const,
                        label: isZh ? "更深" : "Darker",
                        bg: "#09090b",
                        accent: "#dc2626",
                      },
                      {
                        id: "midnight" as const,
                        label: isZh ? "午夜" : "Midnight",
                        bg: "#0f0f1a",
                        accent: "#7c3aed",
                      },
                    ] as const
                  ).map((tItem) => (
                    <button
                      key={tItem.id}
                      type="button"
                      onClick={() => updateTheme(tItem.id)}
                      className={`overflow-hidden rounded-lg border-2 transition-all ${
                        theme === tItem.id
                          ? "border-orange-500"
                          : "border-zinc-700 hover:border-zinc-600"
                      }`}
                    >
                      <div className="relative h-16" style={{ backgroundColor: tItem.bg }}>
                        <div
                          className="absolute right-2 bottom-2 left-2 h-2 rounded-full opacity-70"
                          style={{ backgroundColor: tItem.accent }}
                        />
                      </div>
                      <div className="bg-zinc-800 py-1.5 text-center text-xs text-zinc-400">
                        {tItem.label}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  {isZh ? "布局密度" : "Layout Density"}
                </div>
                <div className="rounded-lg bg-zinc-800/50 px-4">
                  <SettingRow
                    label={isZh ? "紧凑模式" : "Compact Mode"}
                    description={
                      isZh ? "减少间距，显示更多内容" : "Reduce spacing to show more content"
                    }
                  >
                    <Toggle
                      checked={prefs.compact}
                      onChange={(v) => updatePrefs({ compact: v })}
                    />
                  </SettingRow>
                  <SettingRow
                    label={isZh ? "动画效果" : "Animations"}
                    description={
                      isZh ? "界面过渡动画" : "UI transition animations"
                    }
                  >
                    <Toggle
                      checked={prefs.animations}
                      onChange={(v) => updatePrefs({ animations: v })}
                    />
                  </SettingRow>
                </div>
              </div>
            )}

            {section === "notifications" && (
              <div className="py-2">
                <div className="mt-2 mb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  {isZh ? "通知设置" : "Notification Settings"}
                </div>
                <div className="rounded-lg bg-zinc-800/50 px-4">
                  <SettingRow
                    label={isZh ? "每日思维挑战" : "Daily Mind Challenge"}
                    description={
                      isZh
                        ? "每天推送一个新的辩论题目"
                        : "Receive a new debate topic each day"
                    }
                  >
                    <Toggle
                      checked={notifications.daily}
                      onChange={(v) => updateNotifications({ daily: v })}
                    />
                  </SettingRow>
                  <SettingRow
                    label={isZh ? "周度思维报告" : "Weekly Mind Report"}
                    description={
                      isZh
                        ? "每周一收到认知偏差分析报告"
                        : "Get cognitive bias analysis every Monday"
                    }
                  >
                    <Toggle
                      checked={notifications.weekly}
                      onChange={(v) => updateNotifications({ weekly: v })}
                    />
                  </SettingRow>
                  <SettingRow
                    label={isZh ? "新功能更新" : "Feature Updates"}
                    description={
                      isZh
                        ? "当有新的思想家或模式上线时通知"
                        : "Get notified when new features launch"
                    }
                  >
                    <Toggle
                      checked={notifications.updates}
                      onChange={(v) => updateNotifications({ updates: v })}
                    />
                  </SettingRow>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
