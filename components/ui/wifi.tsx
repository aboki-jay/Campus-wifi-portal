export function Wifi({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Outer Ring (Fades in first) */}
      <path
        d="M2 8.82a15 15 0 0 1 20 0"
        className="animate-pulse"
        style={{ animationDuration: "1.5s", animationDelay: "0ms" }}
      />
      {/* Middle Ring (Fades in second) */}
      <path
        d="M5 12.859a10 10 0 0 1 14 0"
        className="animate-pulse"
        style={{ animationDuration: "1.5s", animationDelay: "200ms" }}
      />
      {/* Inner Ring (Fades in third) */}
      <path
        d="M8.5 16.429a5 5 0 0 1 7 0"
        className="animate-pulse"
        style={{ animationDuration: "1.5s", animationDelay: "400ms" }}
      />
      {/* Center Dot (Always solid) */}
      <path d="M12 20h.01" strokeWidth="3" />
    </svg>
  );
}