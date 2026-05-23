import { getAuth, resolveMediaUrl } from "../../shared/api/client";
import { useUserSettings } from "../context/UserSettingsContext";

type UserAvatarProps = {
  size: number;
  name?: string;
  className?: string;
};

/** 展示当前登录用户头像（服务端 URL），无图时显示昵称首字母 */
export function UserAvatar({ size, name, className = "" }: UserAvatarProps) {
  const { avatarUrl: ctxAvatar, displayName } = useUserSettings();
  const auth = getAuth();
  const label = name?.trim() || displayName || auth?.nickname || auth?.username || "?";
  const src = ctxAvatar || resolveMediaUrl(auth?.avatarUrl);
  const initial = (label.charAt(0) || "?").toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
