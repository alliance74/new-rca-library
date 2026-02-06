import { Skeleton } from "@/components/ui/skeleton";

export default function RecentActivitySkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
            <Skeleton className="h-10 w-8 shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-1" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}