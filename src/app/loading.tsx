import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* 4 Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-68 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-68 w-full rounded-xl" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  )
}

