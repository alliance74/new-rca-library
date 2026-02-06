import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {/* Tabs skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-20" />
        ))}
        <div className="ml-auto">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Notifications list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}