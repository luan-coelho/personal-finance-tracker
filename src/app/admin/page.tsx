'use client'

import { Building2, FileText, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useSelectedSpace } from '@/hooks/use-selected-space'

export default function Home() {
  const { selectedSpace, hasSelectedSpace, isLoading } = useSelectedSpace()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-32 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-8 w-16 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!hasSelectedSpace) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="text-muted-foreground mb-4 h-12 w-12" />
        <h2 className="mb-2 text-xl font-semibold">Nenhum espaço selecionado</h2>
        <p className="text-muted-foreground">
          Selecione um espaço no header para começar a trabalhar com suas planilhas financeiras.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Dashboard - {selectedSpace?.name}</h1>
      </div>

      {selectedSpace?.description && <p className="text-muted-foreground">{selectedSpace.description}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planilhas</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">Nenhuma planilha criada ainda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-muted-foreground text-xs">Nenhuma receita registrada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-muted-foreground text-xs">Nenhuma despesa registrada</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
