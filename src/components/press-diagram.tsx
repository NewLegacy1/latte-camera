type Step = "fill" | "slide" | "press";

function Camera() {
  return (
    <g>
      <rect x="78" y="58" width="164" height="104" rx="16" fill="#38251F" />
      <rect x="92" y="44" width="70" height="22" rx="6" fill="#2A1B17" />
      <circle cx="118" cy="48" r="6" fill="#C8B8A4" />
      <circle cx="142" cy="48" r="5" fill="#A84448" />
      <rect x="168" y="70" width="58" height="16" rx="4" fill="#F7F1E8" />
      <text x="197" y="82" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fill="#38251F">
        Dear Latte
      </text>
      <circle cx="160" cy="116" r="34" fill="#1A100E" />
      <circle cx="160" cy="116" r="24" fill="#5C463C" />
      <circle cx="160" cy="116" r="12" fill="#E8C9C1" />
      <rect x="214" y="96" width="16" height="28" rx="3" fill="#6B5348" />
    </g>
  );
}

export function PressDiagram({ step }: { step: Step }) {
  return (
    <svg viewBox="0 0 320 220" role="img" className="h-full w-full" aria-label={label(step)}>
      <rect width="320" height="220" rx="24" fill="#FFFBF6" />
      <Camera />
      {scene(step)}
    </svg>
  );
}

function label(step: Step) {
  switch (step) {
    case "fill":
      return "Diagram: spoon cocoa or cinnamon into the press.";
    case "slide":
      return "Diagram: slide a stencil card into the press.";
    case "press":
      return "Diagram: set the press on the cup, press once, and lift.";
    default: {
      const exhaustive: never = step;
      return exhaustive;
    }
  }
}

function scene(step: Step) {
  switch (step) {
    case "fill":
      return (
        <g>
          <path d="M214 28c18 8 22 28 8 36" fill="none" stroke="#A84448" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="228" cy="24" rx="16" ry="7" fill="#6B3A2A" />
          <circle cx="160" cy="100" r="3" fill="#6B3A2A" />
          <circle cx="168" cy="92" r="2.5" fill="#6B3A2A" />
          <circle cx="154" cy="90" r="2" fill="#A84448" />
        </g>
      );
    case "slide":
      return (
        <g>
          <rect x="214" y="108" width="78" height="46" rx="6" fill="#E8C9C1" stroke="#A84448" strokeWidth="2" />
          <path d="M236 131h28" stroke="#A84448" strokeWidth="2" />
          <path d="M250 124l10 7-10 7" fill="none" stroke="#A84448" strokeWidth="2" strokeLinecap="round" />
          <text x="253" y="148" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fill="#38251F">
            card
          </text>
        </g>
      );
    case "press":
      return (
        <g>
          <path d="M160 168v18" stroke="#A84448" strokeWidth="3" strokeLinecap="round" />
          <path d="M152 180l8 8 8-8" fill="none" stroke="#A84448" strokeWidth="3" strokeLinecap="round" />
          <path d="M96 196h128c0 12-28 18-64 18s-64-6-64-18z" fill="#F7F1E8" stroke="#38251F" strokeWidth="2" />
          <path d="M118 188c8 8 18 8 26 0 8 8 18 8 26 0" fill="none" stroke="#E8C9C1" strokeWidth="3" />
          <path fill="#A84448" d="M160 186s-6-3.4-6-6.2a3.2 3.2 0 0 1 6-1.6 3.2 3.2 0 0 1 6 1.6c0 2.8-6 6.2-6 6.2z" />
        </g>
      );
    default: {
      const exhaustive: never = step;
      return exhaustive;
    }
  }
}
