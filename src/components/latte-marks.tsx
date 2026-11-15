import Image from "next/image";
import type { PressColor, Tier } from "@/lib/offer";

export type MarkName =
  | "lens"
  | "drop"
  | "gift"
  | "cards"
  | "check"
  | "power"
  | "jar"
  | "wand"
  | "lock"
  | "left"
  | "right"
  | "bag"
  | "shield"
  | "truck"
  | "warranty";

export function Mark({ name }: { name: MarkName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "lens":
      return (
        <svg {...common}>
          <path d="M4 8h4l1.5-2h5L16 8h4v10H4z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case "drop":
      return (
        <svg {...common}>
          <path d="M12 3c2.5 3.2 5 5.4 5 8.2a5 5 0 0 1-10 0C7 8.4 9.5 6.2 12 3z" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <rect x="3" y="8" width="18" height="12" rx="1.5" />
          <path d="M3 12h18M12 8v12M12 8c-2-3-5-3-5 0h5M12 8c2-3 5-3 5 0h-5" />
        </svg>
      );
    case "cards":
      return (
        <svg {...common}>
          <rect x="7" y="3" width="12" height="16" rx="1.5" />
          <path d="M5 7v13h11" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="m8.5 12 2.4 2.4 4.6-5" />
        </svg>
      );
    case "power":
      return (
        <svg {...common}>
          <path d="M12 3v6" />
          <path d="M8 5.5a7 7 0 1 0 8 0" />
        </svg>
      );
    case "jar":
      return (
        <svg {...common}>
          <path d="M8 10h8l-1 9H9z" />
          <path d="M9 10V8a3 3 0 0 1 6 0v2M8 13h8" />
        </svg>
      );
    case "wand":
      return (
        <svg {...common}>
          <path d="M12 3v8" />
          <circle cx="12" cy="14.5" r="3.2" />
          <path d="M9.2 16.5 8 20M12 17.7V21M14.8 16.5 16 20" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="6" y="11" width="12" height="8" rx="1.5" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "left":
      return (
        <svg {...common}>
          <path d="M15 6 9 12l6 6" />
        </svg>
      );
    case "right":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <path d="M6 8h12l-1 12H7z" />
          <path d="M9 8V7a3 3 0 0 1 6 0v1" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v6c0 4 3 6.2 7 8 4-1.8 7-4 7-8V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7" />
          <circle cx="7" cy="17.5" r="1.5" />
          <circle cx="17" cy="17.5" r="1.5" />
        </svg>
      );
    case "warranty":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 1.5" />
        </svg>
      );
    default: {
      const exhaustive: never = name;
      return exhaustive;
    }
  }
}

export function PackArt({ tier, color }: { tier: Tier; color: PressColor }) {
  const src = `/images/press-${color.toLowerCase()}.png`;
  return (
    <span className={`pack-art n${tier}`} aria-hidden="true">
      {Array.from({ length: tier }, (_, index) => (
        <Image key={index} src={src} alt="" width={96} height={92} />
      ))}
    </span>
  );
}
