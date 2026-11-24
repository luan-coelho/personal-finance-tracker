'use client'

import type { ReactNode } from 'react'

import { MonthSelector } from '@/components/month-selector'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'

import { MonthSelectorProvider } from '@/providers/month-selector-provider'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base leading-6 font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="border-border bg-background flex flex-col gap-6 rounded-lg border px-4 pb-8 sm:px-8">
      {children}
    </div>
  )
}

const demoGroups: { title: string; items: { label: string; icon: IconName; active?: boolean }[] }[] = [
  {
    title: 'Finanças',
    items: [
      { label: 'Transações', icon: 'credit-card', active: true },
      { label: 'Orçamentos', icon: 'target' },
      { label: 'Reservas', icon: 'piggy-bank' },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { label: 'Categorias', icon: 'folder-tree' },
      { label: 'Tags', icon: 'tag' },
    ],
  },
]

export function ShellSection() {
  return (
    <MonthSelectorProvider>
      <div className="flex flex-col gap-10">
        <Block title="PageHeader · module + PageActions com seletor de mês">
          <Frame>
            <PageHeader title="Transações" description="Entradas e saídas do espaço Pessoal." />
            <PageActions
              actions={
                <>
                  <Button icon="download">Exportar</Button>
                  <Button variant="primary" icon="plus">
                    Nova transação
                  </Button>
                </>
              }>
              <MonthSelector />
            </PageActions>
            <div className="border-border bg-card text-muted-foreground rounded-lg border p-6 text-sm">
              Conteúdo da página
            </div>
          </Frame>
        </Block>

        <Block title="PageHeader · route (breadcrumb, status, meta)">
          <Frame>
            <PageHeader
              variant="route"
              breadcrumb={[{ label: 'Orçamentos', href: '#' }, { label: 'Alimentação' }]}
              title="Mercado de novembro"
              status={
                <Badge tone="warning" dot>
                  Perto do limite
                </Badge>
              }
              meta="Criado por Luan · 12/11/2026"
            />
            <PageActions
              actions={
                <>
                  <Button variant="ghost">Cancelar</Button>
                  <Button variant="primary">Salvar alterações</Button>
                </>
              }
            />
          </Frame>
        </Block>

        <Block title="Breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Reservas</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Viagem</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Movimentações</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Block>

        <Block title="Seletor de mês (com Mês atual e Ver todas)">
          <MonthSelector showAllButton onShowAll={() => undefined} />
        </Block>

        <Block title="Itens da sidebar (expandida)">
          <SidebarProvider className="min-h-0">
            <Sidebar collapsible="none" className="rounded-lg border">
              <SidebarContent>
                {demoGroups.map(group => (
                  <SidebarGroup key={group.title}>
                    <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                    <SidebarMenu>
                      {group.items.map(item => (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton isActive={item.active}>
                            <Icon name={item.icon} size={20} />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroup>
                ))}
              </SidebarContent>
            </Sidebar>
          </SidebarProvider>
        </Block>
      </div>
    </MonthSelectorProvider>
  )
}
