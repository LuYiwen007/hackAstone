import { useState } from "react";
import type { Philosopher } from "../data/philosophers";
import { philosopherDisplayName, useArenaLocale } from "../context/ArenaLocaleContext";
import { getPhilosopherAvatarSrc } from "../data/philosophers";
import { cn } from "./ui/utils";

type PhilosopherAvatarProps = {
  philosopher: Pick<Philosopher, "id" | "name" | "nameCN">;
  className?: string;
  alt?: string;
};

export function PhilosopherAvatar({
  philosopher,
  className,
  alt,
}: PhilosopherAvatarProps) {
  const { locale } = useArenaLocale();
  const [broken, setBroken] = useState(false);
  const src = getPhilosopherAvatarSrc(philosopher.id);
  const label = alt ?? philosopherDisplayName(philosopher, locale);
  const initial = (label.trim().charAt(0) || "?").toUpperCase();

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={label}
        onError={() => setBroken(true)}
        className={cn("rounded-full bg-zinc-800 object-cover object-top", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 font-bold text-white",
        className
      )}
      aria-label={label}
      title={label}
    >
      {initial}
    </div>
  );
}
