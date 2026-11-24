import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export default function InicioLoading() {
  return (
    <>
      <PageHeader title="Início" />
      <PageActions actions={<Skeleton className="h-control-md w-40 rounded-full" />}>
        <Skeleton className="h-control-md w-64 rounded-full" />
      </PageActions>
      <DashboardSkeleton />
    </>
  )
}
