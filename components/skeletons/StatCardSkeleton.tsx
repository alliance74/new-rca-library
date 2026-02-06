import { Skeleton } from "@/components/ui/skeleton";

export default function StatCardSkeleton() {
  return (
    <div
      className="rounded-[8px] p-8 flex items-center gap-6 min-h-40"
      style={{ backgroundColor: '#001240', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)' }}
    >
      <Skeleton className="h-12 w-12 shrink-0 bg-white/20" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-2 bg-white/20" />
        <Skeleton className="h-8 w-16 mb-2 bg-white/30" />
        <Skeleton className="h-3 w-32 bg-white/20" />
      </div>
    </div>
  );
}