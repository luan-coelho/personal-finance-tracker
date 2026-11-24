import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MetricCard } from '@/components/ui/metric-card'
import { Skeleton } from '@/components/ui/skeleton'

function SkeletonCard({ className, rows = 4, chart = false }: { className?: string; rows?: number; chart?: boolean }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-1 h-3.5 w-56" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {chart ? (
          <Skeleton className="h-44 w-full" />
        ) : (
          Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="rounded-control size-8 shrink-0" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-1 w-full" />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

/** Esqueleto com a mesma grade do painel, para nada saltar ao carregar. */
export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando o painel" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-12 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <MetricCard key={index} label="" value="" loading />
        ))}
      </div>
      <SkeletonCard chart className="lg:col-span-8" />
      <SkeletonCard className="lg:col-span-4" />
      <SkeletonCard className="lg:col-span-6" rows={5} />
      <SkeletonCard className="lg:col-span-6" rows={5} />
    </div>
  )
}
