import { TransactionsListSkeleton } from '@/components/transactions-list'
import { MetricCard } from '@/components/ui/metric-card'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function TransacoesLoading() {
  return (
    <>
      <PageHeader title="Transações" />

      <PageActions actions={<Skeleton className="h-control-md w-40 rounded-full max-lg:hidden" />}>
        <Skeleton className="h-control-md w-64 rounded-full max-lg:w-full" />
      </PageActions>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <MetricCard
            key={index}
            label=""
            value=""
            loading
            className={index === 0 ? 'max-sm:col-span-2' : index === 3 ? 'max-sm:hidden' : undefined}
          />
        ))}
      </div>

      <div className="border-border bg-background flex flex-wrap items-center gap-2 rounded-[16px] border p-4">
        <Skeleton className="h-control-md w-full rounded-full sm:w-[280px]" />
        <Skeleton className="h-control-md w-28 rounded-full" />
        <Skeleton className="h-control-md w-24 rounded-full" />
        <Skeleton className="h-control-md w-28 rounded-full max-sm:hidden" />
        <Skeleton className="h-control-md w-24 rounded-full max-sm:hidden" />
      </div>

      <TransactionsListSkeleton rows={8} className="md:hidden" />

      <Table aria-busy="true" containerClassName="max-md:hidden">
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead className="w-[72px]">Usuário</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead numeric>Data</TableHead>
            <TableHead numeric>Valor</TableHead>
            <TableHead className="w-14">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }, (_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="rounded-control size-8" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="size-6 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell numeric>
                <Skeleton className="ml-auto h-3.5 w-20" />
              </TableCell>
              <TableCell numeric>
                <Skeleton className="ml-auto h-3.5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto size-8 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
