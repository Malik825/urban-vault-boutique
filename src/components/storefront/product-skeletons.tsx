import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/storefront/site-header";

/** Placeholder that mirrors the product card layout while data loads. */
export function ProductCardSkeleton() {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-2 flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Full-page loading state for the landing route matching the hero layout 1:1. */
export function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero Section Skeleton */}
      <section className="pt-4 sm:pt-6 sm:pb-12 sm:px-6">
        <div className="mx-auto max-w-7xl sm:container-x sm:px-0">
          <div className="sm:bg-primary-soft/30 sm:dark:bg-primary-dark/20 sm:rounded-xl sm:p-10 lg:p-16 border border-border/40 sm:shadow-card">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              {/* Right: Sliding Device Gallery Skeleton */}
              <div className="relative h-[55vw] min-h-[260px] max-h-[440px] sm:h-[320px] lg:h-[460px] w-full rounded-xl order-1 lg:order-2 overflow-hidden shadow-lg">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>

              {/* Left: Text Content Skeleton */}
              <div className="max-w-xl order-2 lg:order-1 px-4 pt-2 pb-8 sm:px-0 sm:py-0 space-y-4">
                <Skeleton className="h-10 sm:h-12 w-full max-w-md rounded-lg" />
                <Skeleton className="h-10 sm:h-12 w-3/4 max-w-xs rounded-lg" />

                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </div>

                {/* Mobile Full-Width Buttons Skeleton */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                  <Skeleton className="h-11 w-full sm:w-44 rounded-md" />
                  <Skeleton className="h-11 w-full sm:w-48 rounded-md" />
                </div>

                <div className="mt-6 pt-5 border-t border-border/60 flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3.5 w-72 max-w-[85%] rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Section Skeleton */}
      <div className="mx-auto max-w-7xl container-x space-y-4 py-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-7 w-64 max-w-full rounded" />
          </div>
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <div className="pt-4">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
