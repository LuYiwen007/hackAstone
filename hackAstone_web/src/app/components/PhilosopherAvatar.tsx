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
  const src = getPhilosopherAvatarSrc(philosopher.id);

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? philosopher.nameCN}
        className={cn("rounded-full object-cover object-top bg-zinc-800", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-purple-600 flex items-center justify-center font-bold text-white",
        className
      )}
      aria-label={alt ?? philosopher.nameCN}
      title={alt ?? philosopher.nameCN}
    >
      {philosopher.nameCN[0]}
    </div>
  );
}
