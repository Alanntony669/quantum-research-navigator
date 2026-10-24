export default function LoadingSkeleton({ count = 6, type = 'paper' }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 rounded bg-white/10" />
            <div className="h-8 w-8 rounded-lg bg-white/10" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-5/6 rounded bg-white/10" />
            <div className="h-4 w-4/6 rounded bg-white/10" />
          </div>
          <div className="mt-4 h-3 w-1/3 rounded bg-white/5" />
          <div className="mt-4 space-y-1.5">
            <div className="h-3 w-full rounded bg-white/5" />
            <div className="h-3 w-full rounded bg-white/5" />
            <div className="h-3 w-2/3 rounded bg-white/5" />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-3">
            <div className="h-3 w-16 rounded bg-white/5" />
            <div className="h-6 w-16 rounded-lg bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
