import Link from 'next/link'

import { ReserveIconTile } from '@/components/reserve-card'
import { Progress } from '@/components/ui/progress'

import { formatCurrency } from '@/lib/currency'
import type { DashboardOverview, DashboardReserve } from '@/lib/dashboard-types'
import { routes } from '@/lib/routes'

import { DashboardCard, DashboardCardEmpty } from './dashboard-shared'

const TOP_RESERVES = 3

function reserveProgress(reserve: DashboardReserve) {
  const target = Number(reserve.targetAmount ?? 0)
  return target > 0 ? (Number(reserve.currentAmount) / target) * 100 : null
}

function ReserveRow({ reserve }: { reserve: DashboardReserve }) {
  const progress = reserveProgress(reserve)

  return (
    <Link
      href={routes.frontend.admin.reserves.movements(reserve.id)}
      className="hover:bg-accent focus-visible:shadow-focus-ring flex min-w-0 items-center gap-3 rounded-md px-2 py-2 transition-colors duration-120 outline-none">
      <ReserveIconTile icon={reserve.icon} color={reserve.color} size={32} />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex min-w-0 items-baseline justify-between gap-2">
          <span className="truncate text-sm leading-5 font-medium">{reserve.name}</span>
          <span className="text-muted-foreground text-xs leading-4 tabular-nums">
            {progress === null ? formatCurrency(reserve.currentAmount) : `${Math.round(progress)}%`}
          </span>
        </span>
        {progress !== null ? (
          <Progress
            size="sm"
            value={Math.min(progress, 100)}
            tone={progress >= 100 ? 'success' : 'primary'}
            aria-label={`${Math.round(progress)}% da meta de ${reserve.name}`}
          />
        ) : (
          <span className="text-muted-foreground text-xs leading-4">Sem meta</span>
        )}
      </span>
    </Link>
  )
}

/** Reservas: total guardado, aporte do mês e as reservas com mais movimento. */
export function ReservesOverviewCard({ overview, className }: { overview: DashboardOverview; className?: string }) {
  const { reserves } = overview
  const totalSaved = reserves.reduce((sum, reserve) => sum + Number(reserve.currentAmount), 0)
  const monthContribution = reserves.reduce((sum, reserve) => sum + reserve.monthContribution, 0)
  const top = [...reserves]
    .sort((a, b) => b.monthContribution - a.monthContribution || Number(b.currentAmount) - Number(a.currentAmount))
    .slice(0, TOP_RESERVES)

  return (
    <DashboardCard title="Reservas" href={routes.frontend.admin.reserves.index} className={className}>
      {reserves.length === 0 ? (
        <DashboardCardEmpty>Nenhuma reserva ativa.</DashboardCardEmpty>
      ) : (
        <>
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl leading-8 font-bold tracking-[-0.02em] tabular-nums">
              {formatCurrency(totalSaved)}
            </span>
            <span className="text-muted-foreground text-xs leading-4">
              {monthContribution > 0 ? (
                <>
                  <span className="text-info-text font-medium tabular-nums">+{formatCurrency(monthContribution)}</span>{' '}
                  guardados neste mês
                </>
              ) : (
                'Nenhum aporte neste mês'
              )}
            </span>
          </div>
          <div className="-mx-2 flex flex-col gap-0.5">
            {top.map(reserve => (
              <ReserveRow key={reserve.id} reserve={reserve} />
            ))}
          </div>
        </>
      )}
    </DashboardCard>
  )
}
