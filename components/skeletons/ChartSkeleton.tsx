import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  title?: string;
  type?: 'pie' | 'area' | 'bar';
}

export default function ChartSkeleton({ title, type = 'pie' }: ChartSkeletonProps) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>

      {type === 'pie' ? (
        <>
          {/* Pie chart skeleton */}
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
              <Skeleton className="w-full h-full rounded-full" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

          {/* Legend skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </>
      ) : type === 'bar' ? (
        <>
          {/* Bar chart skeleton */}
          <div className="h-48 sm:h-64 mb-4">
            <Skeleton className="w-full h-full" />
          </div>
          {/* Summary stats skeleton */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="h-6 w-8 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Area chart skeleton */
        <div className="h-48 sm:h-64">
          <Skeleton className="w-full h-full" />
        </div>
      )}
    </div>
  );
}