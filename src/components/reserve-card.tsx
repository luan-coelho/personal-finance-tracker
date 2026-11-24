'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { Reserve } from '@/app/db/schemas/reserve-schema'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button, IconButton } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'

import { useDeleteReserve, useToggleReserveStatus } from '@/hooks/use-reserves'

import { formatCurrency } from '@/lib/currency'
import { toIconName } from '@/lib/icons'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

/** Cor padrão de `reserves.color` no banco. */
const DEFAULT_RESERVE_COLOR = '#3b82f6'

export function formatReserveProgress(progress: number) {
  return `${progress.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

interface ReserveIconTileProps {
  icon?: string | null
  color?: string | null
  /** Lado do tile em px (40 em cards, 32 no cabeçalho, 44 ao lado de um campo). */
  size?: 32 | 40 | 44
  className?: string
}

/**
 * Tile do ícone da reserva (raio 10). A cor escolhida pelo usuário entra só como tinta suave do fundo
 * e da borda (misturada com `card`), e o ícone fica em `foreground`, então o contraste não depende da cor.
 */
export function ReserveIconTile({ icon, color, size = 40, className }: ReserveIconTileProps) {
  const tint = color || DEFAULT_RESERVE_COLOR

  return (
    <span
      data-slot="reserve-icon-tile"
      aria-hidden
      className={cn(
        'text-foreground rounded-control inline-flex shrink-0 items-center justify-center border',
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: `color-mix(in oklab, ${tint} 16%, var(--card))`,
        borderColor: `color-mix(in oklab, ${tint} 36%, var(--card))`,
      }}>
      <Icon name={toIconName(icon)} size={size >= 44 ? 24 : size === 32 ? 18 : 20} />
    </span>
  )
}

interface ReserveCardProps {
  reserve: Reserve
  spaceId: string
}

export function ReserveCard({ reserve, spaceId }: ReserveCardProps) {
  const deleteReserveMutation = useDeleteReserve(spaceId)
  const toggleStatusMutation = useToggleReserveStatus(spaceId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const currentAmount = parseFloat(reserve.currentAmount)
  const targetAmount = reserve.targetAmount ? parseFloat(reserve.targetAmount) : null
  const progress = targetAmount && targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
  const movementsHref = routes.frontend.admin.reserves.movements(reserve.id)

  async function handleDelete() {
    await deleteReserveMutation.mutateAsync(reserve.id)
    setShowDeleteDialog(false)
  }

  async function handleToggleStatus() {
    await toggleStatusMutation.mutateAsync(reserve.id)
  }

  return (
    <>
      <Card
        interactive
        className={cn(
          'relative px-6',
          'has-[[data-slot=reserve-card-link]:focus-visible]:border-border-strong has-[[data-slot=reserve-card-link]:focus-visible]:shadow-[var(--sh-md),var(--focus-ring)]',
        )}>
        <div className="flex items-start gap-3">
          <ReserveIconTile icon={reserve.icon} color={reserve.color} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href={movementsHref}
                data-slot="reserve-card-link"
                className="text-foreground min-w-0 truncate text-base leading-6 font-semibold outline-none after:absolute after:inset-0 after:rounded-lg after:content-['']">
                {reserve.name}
              </Link>
              {!reserve.active && <Badge>Inativa</Badge>}
            </div>
            {reserve.description && (
              <p className="text-muted-foreground line-clamp-2 text-[13px] leading-[18px]">{reserve.description}</p>
            )}
          </div>
          <div className="relative z-10 -mt-1 -mr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton icon="more-horizontal" label={`Ações da reserva ${reserve.name}`} size="sm" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={movementsHref}>
                    <Icon name="arrow-left-right" />
                    Ver movimentações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={routes.frontend.admin.reserves.edit(reserve.id)}>
                    <Icon name="pencil" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStatus}>
                  <Icon name="power" />
                  {reserve.active ? 'Desativar' : 'Ativar'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Icon name="trash" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-foreground text-2xl leading-8 font-bold tracking-[-0.02em] tabular-nums">
            {formatCurrency(currentAmount)}
          </span>
          <span className="text-muted-foreground text-[13px] leading-[18px] tabular-nums">
            {targetAmount ? `Meta ${formatCurrency(targetAmount)}` : 'Sem meta definida'}
          </span>
        </div>

        {targetAmount && targetAmount > 0 ? (
          <div className="flex items-center gap-3">
            <Progress
              value={Math.min(progress, 100)}
              tone={progress >= 100 ? 'success' : 'primary'}
              aria-label={`Progresso da meta de ${reserve.name}`}
            />
            <span className="text-muted-foreground shrink-0 text-xs leading-4 font-medium tabular-nums">
              {formatReserveProgress(progress)}
            </span>
          </div>
        ) : null}
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent destructive>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              A reserva &quot;{reserve.name}&quot; e todas as movimentações dela serão excluídas. Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteReserveMutation.isPending} />
            <Button variant="destructive" loading={deleteReserveMutation.isPending} onClick={handleDelete}>
              {deleteReserveMutation.isPending ? 'Excluindo' : 'Excluir reserva'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
