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

/** Full-page loading state for the landing route. */
export function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-mesh">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-14 pt-12 sm:px-6 md:pb-20 md:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <Skeleton className="h-7 w-64 max-w-full rounded-full" />
            <Skeleton className="h-12 w-11/12" />
            <Skeleton className="h-12 w-2/3" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
            <div className="grid max-w-md grid-cols-3 gap-3 pt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="min-w-0 space-y-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-12 sm:px-6">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-72 max-w-full" />
        <div className="pt-4">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
