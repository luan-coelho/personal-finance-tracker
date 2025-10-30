'use client'

import { CheckCircle, Database, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { runManualMigrations } from '@/lib/manual-migrations'

interface MigrationResult {
  table: string
  success: boolean
  message: string
  error?: string
}

export default function SetupPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<MigrationResult[]>([])
  const [completed, setCompleted] = useState(false)

  const handleRunMigrations = async () => {
    setIsRunning(true)
    setResults([])
    setCompleted(false)

    try {
      const migrationResults = await runManualMigrations()
      setResults(migrationResults.results)
      setCompleted(true)
    } catch (error) {
      console.error('Erro ao executar migrações:', error)
      setResults([
        {
          table: 'general',
          success: false,
          message: 'Erro geral ao executar migrações',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      ])
      setCompleted(true)
    } finally {
      setIsRunning(false)
    }
  }

  const allSuccessful = results.length > 0 && results.every(result => result.success)

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuração do Sistema</h1>
        <p className="text-muted-foreground">
          Execute as migrações necessárias para configurar as funcionalidades do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migrações do Banco de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-sm">
            Esta página executa as migrações necessárias para adicionar a funcionalidade de orçamentos ao sistema.
            Clique no botão abaixo para executar as migrações.
          </p>

          <div className="flex justify-center">
            <Button onClick={handleRunMigrations} disabled={isRunning} size="lg" className="min-w-[200px]">
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Executar Migrações
                </>
              )}
            </Button>
          </div>

          {/* Resultados */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados das Migrações</h3>

              {results.map((result, index) => (
                <Alert key={index} className={result.success ? 'border-green-200' : 'border-red-200'}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertTitle className="capitalize">{result.table}</AlertTitle>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Sucesso' : 'Falhou'}
                    </Badge>
                  </div>
                  <AlertDescription className="mt-2">
                    {result.message}
                    {result.error && <div className="mt-2 text-sm text-red-600">Erro: {result.error}</div>}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Status Final */}
          {completed && (
            <Alert className={allSuccessful ? 'border-green-200' : 'border-yellow-200'}>
              {allSuccessful ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>Configuração Concluída</AlertTitle>
                  <AlertDescription>
                    Todas as migrações foram executadas com sucesso! O sistema está pronto para usar a funcionalidade de
                    orçamentos. Você pode agora acessar a página de <strong>Orçamentos</strong> no menu lateral.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle>Configuração Parcialmente Concluída</AlertTitle>
                  <AlertDescription>
                    Algumas migrações falharam. Verifique os erros acima e tente novamente ou entre em contato com o
                    suporte.
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}

          {/* Instruções */}
          {!completed && (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertTitle>Sobre as Migrações</AlertTitle>
              <AlertDescription>
                As migrações criarão as tabelas e estruturas necessárias para:
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                  <li>Tabela de orçamentos para armazenar limites por categoria</li>
                  <li>Índices para otimizar consultas</li>
                  <li>Constraints para manter a integridade dos dados</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Navegação */}
      {allSuccessful && (
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <a href="/admin/budgets">Ir para Orçamentos</a>
          </Button>
        </div>
      )}
    </div>
  )
}
