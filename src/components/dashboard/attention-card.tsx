import { CategoryIconTile } from '@/components/category-icon'
import { Icon, type IconName } from '@/components/ui/icon'
import { List, ListItem } from '@/components/ui/list-item'

import { type DashboardAlert, type DashboardAlertKind, buildAlerts } from '@/lib/dashboard-insights'
import type { DashboardOverview } from '@/lib/dashboard-types'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

import { DashboardCard, transactionsHref } from './dashboard-shared'

const kindIcon: Record<DashboardAlertKind, IconName> = {
  'budget-exceeded': 'alert-circle',
  'budget-near': 'alert-triangle',
  'budget-forecast': 'trending-up',
  'category-above-previous': 'trending-up',
  'unbudgeted-spending': 'receipt',
  'negative-balance': 'wallet',
  'reserve-goal-reached': 'check-circle',
}

const toneText: Record<DashboardAlert['tone'], string> = {
  error: 'text-error-text',
  warning: 'text-warning-text',
  success: 'text-success-text',
  info: 'text-info-text',
}

/** Destino de cada alerta: categoria abre Transações filtrada; reserva abre suas movimentações. */
function alertHref(alert: DashboardAlert): string | undefined {
  if (alert.reserveId) return routes.frontend.admin.reserves.movements(alert.reserveId)
  if (alert.category) return transactionsHref({ type: 'saida', category: alert.category })
  if (alert.kind === 'negative-balance') return transactionsHref()
  return undefined
}

function AlertItem({ alert }: { alert: DashboardAlert }) {
  // Alerta de categoria mostra o tile da categoria com o status no ícone ao lado do título
  const leading = alert.category ? <CategoryIconTile name={alert.category} className="size-10" iconSize={20} /> : null

  return (
    <ListItem
      href={alertHref(alert)}
      icon={leading ? undefined : kindIcon[alert.kind]}
      tone={alert.tone}
      leading={leading ?? undefined}
      title={
        <span className="flex min-w-0 items-center gap-1.5">
          <Icon name={kindIcon[alert.kind]} size={14} className={cn('shrink-0', toneText[alert.tone])} />
          <span className="truncate">{alert.title}</span>
        </span>
      }
      meta={alert.description}
    />
  )
}

/** Lista curta do que pede ação agora, do mais grave para o positivo. */
export function AttentionCard({ overview, className }: { overview: DashboardOverview; className?: string }) {
  const alerts = buildAlerts(overview)

  return (
    <DashboardCard
      title="Atenção"
      description={
        alerts.length === 0 ? 'Nada fora do lugar' : `${alerts.length} ${alerts.length === 1 ? 'ponto' : 'pontos'}`
      }
      className={className}>
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <span className="bg-success-soft text-success-text inline-flex size-10 items-center justify-center rounded-full">
            <Icon name="check-circle" size={20} />
          </span>
          <p className="text-sm leading-5 font-medium">Tudo dentro do planejado</p>
          <p className="text-muted-foreground text-[13px] leading-5">Nenhum orçamento perto do limite neste mês.</p>
        </div>
      ) : (
        <List className="-mx-2">
          {alerts.map(alert => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </List>
      )}
    </DashboardCard>
  )
}
