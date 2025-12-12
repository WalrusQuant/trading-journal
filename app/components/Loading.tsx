export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-terminal-border rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-2 border-t-matrix-500 rounded-full animate-spin"></div>
      </div>
      <span className="text-xs font-mono text-gray-500 uppercase tracking-widest animate-pulse">
        Loading...
      </span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-terminal-border/50 ${className}`}></div>
  );
}
