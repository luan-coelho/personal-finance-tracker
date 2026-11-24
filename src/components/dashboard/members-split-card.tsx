import Link from 'next/link'

import { UserAvatarDisplay } from '@/components/user-avatar-display'

import { formatCurrency } from '@/lib/currency'
import type { DashboardOverview } from '@/lib/dashboard-types'

import { DashboardCard, transactionsHref } from './dashboard-shared'

/** Quem gastou: saídas por pessoa do espaço. Só aparece com duas pessoas ou mais. */
export function MembersSplitCard({ overview, className }: { overview: DashboardOverview; className?: string }) {
  const { members, totals } = overview
  const total = totals.current.saidas

  return (
    <DashboardCard title="Quem gastou" description="Saídas por pessoa" className={className}>
      {/* Barra empilhada única: cada pessoa num tom da escala primária, do mais forte ao mais claro */}
      <div className="bg-muted flex h-2 w-full overflow-hidden rounded-full" aria-hidden>
        {members.map((member, index) => (
          <span
            key={member.user.id}
            className={index === 0 ? 'bg-primary' : index === 1 ? 'bg-primary-300' : 'bg-primary-100'}
            style={{ width: `${total > 0 ? (member.total / total) * 100 : 0}%` }}
          />
        ))}
      </div>

      <ul className="-mx-2 flex flex-col gap-0.5">
        {members.map((member, index) => {
          const share = total > 0 ? Math.round((member.total / total) * 100) : 0
          return (
            <li key={member.user.id}>
              <Link
                href={transactionsHref({ type: 'saida', userId: member.user.id })}
                className="hover:bg-accent focus-visible:shadow-focus-ring flex min-w-0 items-center gap-3 rounded-md px-2 py-2 transition-colors duration-120 outline-none">
                <span className="relative">
                  <UserAvatarDisplay
                    user={{ ...member.user, name: member.user.name ?? member.user.email }}
                    size="sm"
                    showTooltip={false}
                  />
                  <span
                    aria-hidden
                    className={`border-card absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 ${
                      index === 0 ? 'bg-primary' : index === 1 ? 'bg-primary-300' : 'bg-primary-100'
                    }`}
                  />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm leading-5 font-medium">
                    {member.user.name ?? member.user.email}
                  </span>
                  <span className="text-muted-foreground text-xs leading-4">
                    {member.count} {member.count === 1 ? 'saída' : 'saídas'} · {share}%
                  </span>
                </span>
                <span className="text-sm leading-5 font-medium whitespace-nowrap tabular-nums">
                  {formatCurrency(member.total)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </DashboardCard>
  )
}
