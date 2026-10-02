interface AutoComLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function AutoComLogo({ className = "", size = "md", animated = true }: AutoComLogoProps) {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-8.5 w-8.5",
    lg: "h-11 w-11",
  };

  const svgSize = {
    sm: 28,
    md: 34,
    lg: 44,
  };

  return (
    <div
      className={`relative grid place-items-center rounded-2xl bg-gradient-to-br from-primary/25 via-background to-accent/20 border border-primary/40 shadow-teal ${sizeClasses[size]} ${className}`}
      aria-label="AutoCom Live AI Shopping Agent"
    >
      {/* Live AI Pulse Ring */}
      {animated && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-80" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
      )}

      {/* Cybernetic AI Shopping Agent Vector */}
      <svg
        width={svgSize[size]}
        height={svgSize[size]}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform group-hover:scale-110"
      >
        <defs>
          <linearGradient
            id="agentGradient"
            x1="4"
            y1="4"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--primary, #14b8a6)" />
            <stop offset="0.5" stopColor="#38bdf8" />
            <stop offset="1" stopColor="var(--accent, #f59e0b)" />
          </linearGradient>
          <linearGradient
            id="visorGradient"
            x1="10"
            y1="14"
            x2="26"
            y2="18"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="var(--primary, #14b8a6)" />
          </linearGradient>
        </defs>

        {/* Shopping Agent Outer Chassis / Bag Handle Silhouette */}
        <path
          d="M13 11C13 8.23858 15.2386 6 18 6C20.7614 6 23 8.23858 23 11"
          stroke="url(#agentGradient)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Outer Hex-Shield / Agent Body */}
        <rect
          x="7"
          y="11"
          width="22"
          height="19"
          rx="6"
          fill="color-mix(in oklab, var(--primary) 12%, transparent)"
          stroke="url(#agentGradient)"
          strokeWidth="2"
        />

        {/* Agent Neural Visor (Glowing HUD Eyes) */}
        <rect x="11" y="15.5" width="14" height="4.5" rx="2.25" fill="url(#visorGradient)" />

        {/* Dual Live Neural Iris Nodes */}
        <circle cx="14.5" cy="17.75" r="1.2" fill="#ffffff" />
        <circle cx="21.5" cy="17.75" r="1.2" fill="#ffffff" />

        {/* Proximity Spark / Deal Lightning Center */}
        <path
          d="M18 23L16.5 25.5H19.5L18 28"
          stroke="var(--accent, #f59e0b)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
