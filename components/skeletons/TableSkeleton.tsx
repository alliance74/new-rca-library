import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header skeleton */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-full sm:max-w-md" />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      {/* Desktop table skeleton */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-full">
          {/* Table header */}
          <div className="bg-gray-100 px-6 py-4">
            <div className="flex items-center gap-4">
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
          </div>
          
          {/* Table rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div key={colIndex} className="flex-1">
                    {colIndex === 0 ? (
                      <Skeleton className="h-8 w-6" />
                    ) : colIndex === columns - 1 ? (
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-6 rounded" />
                      </div>
                    ) : (
                      <Skeleton className="h-4 w-full max-w-32" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile card skeleton */}
      <div className="block lg:hidden">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex items-start gap-3">
              <Skeleton className="h-16 w-12 shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-16" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-16 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}