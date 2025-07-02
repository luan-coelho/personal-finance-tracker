'use client'

import { Activity, Calendar, Clock, Globe, Monitor } from 'lucide-react'
import { useState } from 'react'

import { ActivityAction, ActivityActionDescriptions } from '@/app/db/schemas/activity-log-schema'

import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'

import { useUserActivityLogs } from '@/hooks/use-activity-logs'

interface ActivityLogsViewerProps {
  userId: string
  userName: string
}

export function ActivityLogsViewer({ userId, userName }: ActivityLogsViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data, isLoading, error } = useUserActivityLogs(userId, {
    page: currentPage,
    limit: itemsPerPage,
  })

  const logs = data?.logs || []
  const totalPages = data?.totalPages || 0

  // Gerar páginas para navegação
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date))
  }

  const getActionBadgeVariant = (action: ActivityAction) => {
    switch (action) {
      case 'SIGN_IN':
        return 'default'
      case 'SIGN_OUT':
        return 'secondary'
      case 'USER_CREATED':
        return 'default'
      case 'USER_UPDATED':
        return 'outline'
      case 'USER_ACTIVATED':
        return 'default'
      case 'USER_DEACTIVATED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (error) {
    return <div className="text-destructive py-8 text-center">Erro ao carregar logs de atividades: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Logs de Atividades</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Histórico de atividades de {userName}
          {data && (
            <>
              {' - '}
              {data.total} registro(s) encontrado(s)
              {data.total > itemsPerPage && (
                <span>
                  {' '}
                  - Página {currentPage} de {totalPages}
                </span>
              )}
            </>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          Nenhum log de atividade registrado para este usuário.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {logs.map(log => (
              <div
                key={log.id}
                className="bg-muted/30 hover:bg-muted/50 flex items-start gap-4 rounded-lg border p-4 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <Activity className="text-muted-foreground h-4 w-4" />
                  <div className="text-muted-foreground text-xs">{formatDate(log.createdAt).split(' ')[1]}</div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getActionBadgeVariant(log.action as ActivityAction)}>
                      {ActivityActionDescriptions[log.action as ActivityAction] || log.action}
                    </Badge>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {formatDate(log.createdAt).split(' ')[0]}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {formatDate(log.createdAt).split(' ')[1]}
                    </div>
                  </div>

                  <p className="text-sm">{log.description}</p>

                  {(log.ipAddress || log.userAgent) && (
                    <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                      {log.ipAddress && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {log.ipAddress}
                        </div>
                      )}
                      {log.userAgent && (
                        <div className="flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          {log.userAgent.length > 50 ? `${log.userAgent.substring(0, 50)}...` : log.userAgent}
                        </div>
                      )}
                    </div>
                  )}

                  {log.metadata && (
                    <details className="text-muted-foreground text-xs">
                      <summary className="cursor-pointer">Metadados</summary>
                      <pre className="bg-muted mt-2 overflow-x-auto rounded p-2 text-xs">
                        {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => handlePageChange(page as number)}
                          isActive={currentPage === page}
                          className="cursor-pointer">
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}
