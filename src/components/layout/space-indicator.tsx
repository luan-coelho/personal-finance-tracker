'use client'

import { AlertTriangle, Building2 } from 'lucide-react'
import Link from 'next/link'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { useSelectedSpace } from '@/hooks/use-selected-space'

import { routes } from '@/lib/routes'

export function SpaceIndicator() {
  const { hasSelectedSpace, selectedSpaceName, isLoading } = useSelectedSpace()

  if (isLoading) {
    return null
  }

  if (!hasSelectedSpace) {
    return (
      <Alert className="mx-4 mt-4 border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-orange-800">
            Nenhum espaço selecionado. Selecione um espaço no header ou crie um novo.
          </span>
          <Button asChild size="sm" variant="outline" className="ml-4">
            <Link href={routes.frontend.admin.spaces.create}>
              <Building2 className="mr-2 h-4 w-4" />
              Criar espaço
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="mx-4 mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
      <div className="flex items-center gap-2 text-green-800">
        <Building2 className="h-4 w-4" />
        <span className="text-sm font-medium">
          Trabalhando no espaço: <span className="font-semibold">{selectedSpaceName}</span>
        </span>
      </div>
    </div>
  )
}
