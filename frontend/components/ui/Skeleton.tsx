export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-shimmer bg-panel-2 ${className}`} />;
}