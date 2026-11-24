'use client'

import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'

import { CategoryIconTile } from '@/components/category-icon'
import { QueryErrorCard } from '@/components/query-error-card'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BarChart } from '@/components/ui/bar-chart'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DonutChart } from '@/components/ui/donut-chart'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import { LineChart } from '@/components/ui/line-chart'
import { List, ListItem } from '@/components/ui/list-item'
import { MetricCard } from '@/components/ui/metric-card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

const transactions = [
  {
    id: 1,
    description: 'Supermercado Pão Dourado',
    category: 'Alimentação',
    date: '21/11/2026',
    amount: '- R$ 342,18',
    tone: 'error' as const,
  },
  {
    id: 2,
    description: 'Salário',
    category: 'Remuneração',
    date: '05/11/2026',
    amount: 'R$ 8.200,00',
    tone: 'success' as const,
  },
  {
    id: 3,
    description: 'Conta de energia',
    category: 'Moradia',
    date: '10/11/2026',
    amount: '- R$ 214,90',
    tone: 'error' as const,
  },
  {
    id: 4,
    description: 'Uber',
    category: 'Transporte',
    date: '18/11/2026',
    amount: '- R$ 27,40',
    tone: 'error' as const,
  },
]

// Gasto diário fictício: outubro inteiro e novembro até hoje (dia 24).
const octoberDaily = [
  180, 42, 0, 310, 95, 60, 1250, 38, 74, 0, 220, 130, 56, 0, 410, 88, 47, 260, 0, 115, 72, 340, 64, 0, 190, 58, 83, 0,
  275, 96, 140,
]
const novemberDaily = [
  95, 60, 0, 1250, 44, 120, 38, 0, 210, 66, 52, 0, 180, 92, 315, 40, 0, 130, 75, 58, 240, 0, 110, 342,
]

function cumulative(values: number[]) {
  let total = 0
  return values.map(value => {
    total += value
    return total
  })
}

const dayLabels = Array.from({ length: 31 }, (_, i) => (i === 0 || (i + 1) % 5 === 0 ? String(i + 1) : ''))

const monthlyOutflows = [
  { label: 'jun', value: 4620 },
  { label: 'jul', value: 5180 },
  { label: 'ago', value: 4390 },
  { label: 'set', value: 4875 },
  { label: 'out', value: 5310 },
  { label: 'nov', value: 4912 },
]

const compactCurrency = (value: number) =>
  value >= 1000 ? `${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : String(value)

const recentTransactions = [
  { id: 1, description: 'Supermercado Pão Dourado', category: 'Alimentação', meta: 'Hoje · Cartão', amount: -342.18 },
  { id: 2, description: 'Uber', category: 'Transporte', meta: 'Ontem · Pix', amount: -27.4 },
  { id: 3, description: 'Conta de energia', category: 'Moradia', meta: '10 nov · Boleto', amount: -214.9 },
  { id: 4, description: 'Salário', category: 'Salário', meta: '5 nov · Transferência', amount: 8200 },
]

const badgeTones = ['neutral', 'success', 'warning', 'error', 'info', 'primary'] as const
const badgeLabels: Record<(typeof badgeTones)[number], string> = {
  neutral: 'Rascunho',
  success: 'Pago',
  warning: 'Vence em 3 dias',
  error: 'Atrasado',
  info: 'Em andamento',
  primary: 'Recorrente',
}

const dialogLines = Array.from({ length: 12 }, (_, i) => `Linha ${i + 1} do corpo`)
const sheetSections = Array.from({ length: 16 }, (_, i) => `Seção de filtro ${i + 1}`)

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base leading-6 font-semibold">{title}</h3>
      {children}
    </section>
  )
}

export function DisplaySection() {
  const [selected, setSelected] = useState<number>(2)
  const [open, setOpen] = useState(false)
  const [activeMonth, setActiveMonth] = useState<number | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState(3)

  return (
    <div className="flex flex-col gap-10">
      <Block title="Metric card">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Receitas no mês"
            value="R$ 8.200,00"
            tone="success"
            icon="arrow-up-circle"
            delta="12%"
            note="vs. R$ 7.320,00 em outubro"
          />
          <MetricCard
            label="Despesas no mês"
            value="R$ 4.912,35"
            tone="error"
            icon="arrow-down-circle"
            delta="8%"
            deltaTrend="down"
            deltaTone="success"
            note="2 contas vencem esta semana"
            noteTone="warning"
          />
          <MetricCard label="Orçamento usado" value="64" unit="%" progress={64} note="R$ 3.200,00 de R$ 5.000,00" />
          <MetricCard label="Saldo" value="" loading />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Gasto até hoje"
            value="R$ 3.517"
            trend={cumulative(novemberDaily)}
            trendTone="primary"
            note="9% a menos que no dia 24 de outubro"
          />
          <MetricCard
            label="Saídas por mês"
            value="R$ 4.912"
            trend={monthlyOutflows.map(m => m.value)}
            note="média de 6 meses: R$ 4.881"
          />
          <MetricCard
            label="Alimentação"
            value="91"
            unit="%"
            trend={[42, 55, 61, 70, 78, 91]}
            trendTone="warning"
            note="R$ 910 de R$ 1.000"
            noteTone="warning"
          />
          <MetricCard className="w-40" label="Card estreito" value="37" trend={[4, 10, 6, 16, 12, 20]} />
        </div>
      </Block>

      <Block title="Line chart">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gasto acumulado</CardTitle>
              <CardDescription>novembro até o dia 24 vs. outubro</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                aria-label="Gasto acumulado: R$ 3.517 até o dia 24 de novembro; outubro fechou em R$ 4.693."
                labels={dayLabels}
                format={formatCurrency}
                marker={{ index: novemberDaily.length - 1 }}
                series={[
                  {
                    name: 'novembro',
                    values: [...cumulative(novemberDaily), ...Array<null>(31 - novemberDaily.length).fill(null)],
                  },
                  { name: 'outubro', values: cumulative(octoberDaily) },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <LineChart
                title="Saídas por mês"
                subtitle="últimos 6 meses"
                aria-label="Saídas por mês, de junho a novembro: entre R$ 4.390 e R$ 5.310."
                labels={monthlyOutflows.map(m => m.label)}
                format={formatCurrency}
                min={3000}
                max={6000}
                marker={{ index: 4 }}
                series={[{ name: 'Saídas', values: monthlyOutflows.map(m => m.value) }]}
              />
            </CardContent>
          </Card>
        </div>
      </Block>

      <Block title="Bar chart">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent>
              <BarChart
                title="Saídas por mês"
                subtitle="clique para filtrar"
                data={monthlyOutflows}
                format={compactCurrency}
                activeIndex={activeMonth}
                onBarClick={index => setActiveMonth(current => (current === index ? null : index))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <BarChart
                title="Maiores categorias"
                subtitle="novembro"
                height={120}
                format={compactCurrency}
                data={[
                  { label: 'Moradia', value: 1850 },
                  { label: 'Mercado', value: 1240, tone: 'error' },
                  { label: 'Transporte', value: 620 },
                  { label: 'Lazer', value: 410, dim: true },
                  { label: 'Saúde', value: 280, dim: true },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </Block>

      <Block title="Donut chart">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent>
              <DonutChart
                title="Para onde foi a renda"
                totalLabel="R$ 8.200"
                unit="de entradas"
                format={formatCurrency}
                segments={[
                  { label: 'Gasto', value: 4912.35, tone: 'warning' },
                  { label: 'Guardado', value: 1500, tone: 'success' },
                  { label: 'Sobra', value: 1787.65, tone: 'info' },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <DonutChart
                title="Orçamentos"
                unit="orçamentos"
                size={96}
                thickness={12}
                segments={[
                  { label: 'Dentro do limite', value: 5, tone: 'success' },
                  { label: 'Perto do limite', value: 2, tone: 'warning' },
                  { label: 'Estourados', value: 1, tone: 'error' },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </Block>

      <Block title="List item">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Últimas transações</CardTitle>
          </CardHeader>
          <CardContent>
            <List className="-mx-2">
              {recentTransactions.map(t => (
                <ListItem
                  key={t.id}
                  leading={<CategoryIconTile name={t.category} iconSize={20} className="size-10" />}
                  title={t.description}
                  meta={`${t.category} · ${t.meta}`}
                  selected={selectedTransaction === t.id}
                  onClick={() => setSelectedTransaction(t.id)}
                  right={
                    <span
                      className={cn(
                        'text-sm font-semibold whitespace-nowrap tabular-nums',
                        t.amount > 0 && 'text-success-text',
                      )}>
                      {t.amount > 0 ? formatCurrency(t.amount) : `- ${formatCurrency(-t.amount)}`}
                    </span>
                  }
                />
              ))}
              <ListItem
                icon="arrow-right"
                tone="primary"
                title="Ver todas as transações"
                href="#"
                right={<Icon name="chevron-right" size={16} className="text-muted-foreground" />}
              />
            </List>
          </CardContent>
        </Card>
      </Block>

      <Block title="Card">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Resumo de novembro</CardTitle>
              <CardDescription>Atualizado há 12 min</CardDescription>
              <CardAction>
                <Badge tone="success" dot>
                  Dentro do orçamento
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">32 transações · 6 categorias</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Exportar
              </Button>
              <Button variant="primary" size="sm">
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>
          <Card interactive onClick={() => toast('Card aberto')}>
            <CardHeader>
              <CardTitle>Card interativo</CardTitle>
              <CardDescription>Hover muda só borda e sombra</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-primary-text inline-flex items-center gap-1 text-[13px] font-medium">
                Abrir <Icon name="chevron-right" size={16} />
              </span>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Card compacto</CardTitle>
              <CardDescription>Padding 16, gap 12</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={82} tone="warning" />
            </CardContent>
          </Card>
        </div>
      </Block>

      <Block title="Badge">
        <div className="flex flex-wrap items-center gap-2">
          {badgeTones.map(tone => (
            <Badge key={tone} tone={tone}>
              {badgeLabels[tone]}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {badgeTones.map(tone => (
            <Badge key={tone} tone={tone} dot>
              {badgeLabels[tone]}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="success" icon="check">
            Conciliado
          </Badge>
          <Badge tone="error" icon="x">
            Recusado
          </Badge>
          <Badge tone="info" icon="refresh">
            Recorrente
          </Badge>
        </div>
      </Block>

      <Block title="Table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead numeric>Data</TableHead>
              <TableHead numeric>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(t => (
              <TableRow
                key={t.id}
                data-state={selected === t.id ? 'selected' : undefined}
                className="cursor-pointer"
                onClick={() => setSelected(t.id)}>
                <TableCell className="font-medium">{t.description}</TableCell>
                <TableCell className="text-muted-foreground">{t.category}</TableCell>
                <TableCell numeric className="text-muted-foreground">
                  {t.date}
                </TableCell>
                <TableCell numeric className={t.tone === 'success' ? 'text-success-text' : undefined}>
                  {t.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell numeric>R$ 7.615,52</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" aria-disabled="true" tabIndex={-1} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">12</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Block>

      <Block title="Tabs">
        <Tabs defaultValue="resumo">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
            <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
            <TabsTrigger value="arquivadas" disabled>
              Arquivadas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="resumo" className="text-muted-foreground">
            Conteúdo da aba Resumo.
          </TabsContent>
          <TabsContent value="transacoes" className="text-muted-foreground">
            Conteúdo da aba Transações.
          </TabsContent>
          <TabsContent value="orcamentos" className="text-muted-foreground">
            Conteúdo da aba Orçamentos.
          </TabsContent>
        </Tabs>
        <Tabs defaultValue="todas">
          <TabsList variant="segmented">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="despesas">Despesas</TabsTrigger>
          </TabsList>
        </Tabs>
      </Block>

      <Block title="Progress">
        <div className="flex max-w-md flex-col gap-4">
          <Progress value={40} />
          <Progress value={72} tone="success" />
          <Progress value={91} tone="warning" />
          <Progress value={128} tone="error" />
          <Progress value={55} size="sm" />
        </div>
      </Block>

      <Block title="Skeleton">
        <div className="flex max-w-md items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[70%]" />
          </div>
        </div>
        <Skeleton className="h-[120px] w-full max-w-md rounded-xl" />
      </Block>

      <Block title="Avatar">
        <div className="flex flex-wrap items-center gap-4">
          {([24, 32, 40, 56] as const).map(size => (
            <Avatar key={size} size={size}>
              <AvatarFallback>LC</AvatarFallback>
            </Avatar>
          ))}
          <Avatar>
            <AvatarFallback>MA</AvatarFallback>
            <AvatarBadge status="online" />
          </Avatar>
          <AvatarGroup>
            <Avatar size={32}>
              <AvatarFallback>LC</AvatarFallback>
            </Avatar>
            <Avatar size={32}>
              <AvatarFallback>MA</AvatarFallback>
            </Avatar>
            <Avatar size={32}>
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+4</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </Block>

      <Block title="Separator e collapsible">
        <Separator />
        <Collapsible className="border-border max-w-md rounded-md border px-4">
          <CollapsibleTrigger className="flex h-12 w-full items-center gap-2.5 rounded-sm text-left font-semibold">
            Detalhes do orçamento
            <Icon name="chevron-down" size={16} className="ml-auto" />
          </CollapsibleTrigger>
          <CollapsibleContent className="text-muted-foreground pb-4">
            Limite mensal de R$ 5.000,00 · renovação no dia 1.
          </CollapsibleContent>
        </Collapsible>
      </Block>

      <Block title="Alert">
        <div className="flex max-w-2xl flex-col gap-3">
          <Alert tone="info">
            <AlertTitle>Importação em andamento</AlertTitle>
            <AlertDescription>32 transações do extrato de novembro estão sendo processadas.</AlertDescription>
          </Alert>
          <Alert tone="success">
            <AlertTitle>Orçamento renovado</AlertTitle>
            <AlertDescription>O limite de dezembro já está disponível.</AlertDescription>
          </Alert>
          <Alert tone="warning">
            <AlertTitle>Orçamento quase no limite</AlertTitle>
            <AlertDescription>Alimentação está em 91% do limite mensal.</AlertDescription>
          </Alert>
          <Alert tone="error">
            <AlertTitle>Não foi possível salvar a transação</AlertTitle>
            <AlertDescription>Verifique a conexão e tente novamente.</AlertDescription>
            <AlertAction>
              <Button variant="outline" size="sm">
                Tentar novamente
              </Button>
            </AlertAction>
          </Alert>
          <QueryErrorCard onRetry={() => toast('Recarregando')} />
        </div>
      </Block>

      <Block title="Empty state">
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState
            bordered
            icon="receipt"
            title="Nenhuma transação encontrada"
            description="Ajuste os filtros ou adicione a primeira transação do mês."
            action={
              <>
                <Button variant="outline">Limpar filtros</Button>
                <Button variant="primary" icon="plus">
                  Adicionar transação
                </Button>
              </>
            }
          />
          <EmptyState
            icon="piggy-bank"
            title="Nenhuma reserva"
            description="Crie uma reserva para separar dinheiro por objetivo."
          />
        </div>
      </Block>

      <Block title="Toast">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => toast.success('Transação salva')}>Sucesso</Button>
          <Button
            onClick={() =>
              toast.error('Não foi possível excluir', {
                description: 'Verifique a conexão e tente novamente.',
                closeButton: true,
              })
            }>
            Erro
          </Button>
          <Button onClick={() => toast.warning('Orçamento de Alimentação em 91%')}>Aviso</Button>
          <Button
            onClick={() =>
              toast.info('Importação iniciada', {
                description: '32 transações em processamento',
                action: { label: 'Ver', onClick: () => undefined },
              })
            }>
            Informação
          </Button>
          <Button onClick={() => toast('Filtro salvo')}>Neutro</Button>
          <Button onClick={() => toast.loading('Sincronizando', { duration: 2000 })}>Carregando</Button>
        </div>
      </Block>

      <Block title="Dialog, alert dialog e sheet">
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Abrir dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova categoria</DialogTitle>
                <DialogDescription>Categorias agrupam transações nos relatórios.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                {dialogLines.map(line => (
                  <p key={line} className="text-muted-foreground">
                    {line}. Só esta área rola; cabeçalho e rodapé ficam fixos.
                  </p>
                ))}
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button variant="primary">Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button>Abrir dialog md</Button>
            </DialogTrigger>
            <DialogContent size="md">
              <DialogHeader>
                <DialogTitle>Editar orçamento</DialogTitle>
                <DialogDescription>Largura de 768px para formulários.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <p className="text-muted-foreground">Conteúdo do formulário.</p>
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button variant="primary">Salvar orçamento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" icon="trash">
                Excluir transação
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent destructive>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
                <AlertDialogDescription>
                  &quot;Supermercado Pão Dourado&quot; · R$ 342,18 será excluída permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel />
                <AlertDialogAction>Excluir transação</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Confirmação simples</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Copiar orçamento para dezembro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Os limites de novembro serão usados como ponto de partida.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel />
                <AlertDialogAction>Copiar orçamento</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button icon="filter">Filtros</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>3 ativos</SheetDescription>
              </SheetHeader>
              <SheetBody>
                {sheetSections.map(section => (
                  <p key={section} className="text-muted-foreground">
                    {section}
                  </p>
                ))}
              </SheetBody>
              <SheetFooter>
                <Button variant="ghost">Limpar</Button>
                <SheetClose asChild>
                  <Button variant="primary">Aplicar filtros</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button>Sheet lg</Button>
            </SheetTrigger>
            <SheetContent size="lg">
              <SheetHeader>
                <SheetTitle>Nova transação</SheetTitle>
              </SheetHeader>
              <SheetBody>
                <p className="text-muted-foreground">Formulário com 560px.</p>
              </SheetBody>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </SheetClose>
                <Button variant="primary">Salvar</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </Block>
    </div>
  )
}
