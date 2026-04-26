import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function TransacoesLoading() {
  return (
    <div className="container mx-auto">
      <div className="mb-3 flex flex-col items-center justify-between md:mb-8 md:flex-row">
        <div className="w-full space-y-2 md:w-auto">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        </CardContent>
      </Card>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 p-4 md:flex-row md:items-center md:justify-between md:gap-4 md:p-6">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-10 w-10 rounded-md md:hidden" />
          </div>
          <div className="flex w-full min-w-0 items-center gap-2 md:w-auto">
            <Skeleton className="h-10 flex-1 md:w-64 md:flex-none" />
            <Skeleton className="hidden h-10 w-40 md:inline-flex" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-b px-6 py-3">
            <div className="grid grid-cols-12 gap-4">
              <Skeleton className="col-span-1 h-4" />
              <Skeleton className="col-span-3 h-4" />
              <Skeleton className="col-span-2 h-4" />
              <Skeleton className="col-span-2 h-4" />
              <Skeleton className="col-span-2 h-4" />
              <Skeleton className="col-span-2 h-4" />
            </div>
          </div>

          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="grid grid-cols-12 items-center gap-4 px-6 py-4">
                <div className="col-span-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="col-span-3">
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="col-span-2 flex gap-1">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-9" />
              ))}
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
