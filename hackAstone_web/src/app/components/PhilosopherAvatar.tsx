import { useState } from "react";
import type { Philosopher } from "../data/philosophers";
import { getPhilosopherAvatarSrc } from "../data/philosophers";
import { cn } from "./ui/utils";

type PhilosopherAvatarProps = {
  philosopher: Pick<Philosopher, "id" | "nameCN">;
  className?: string;
  alt?: string;
};

export function PhilosopherAvatar({
  philosopher,
  className,
  alt,
}: PhilosopherAvatarProps) {
  const [broken, setBroken] = useState(false);
  const src = getPhilosopherAvatarSrc(philosopher.id);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={alt ?? philosopher.nameCN}
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
      aria-label={alt ?? philosopher.nameCN}
      title={alt ?? philosopher.nameCN}
    >
      {philosopher.nameCN[0]}
    </div>
  );
}
