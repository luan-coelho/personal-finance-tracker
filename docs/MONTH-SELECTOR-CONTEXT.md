# Contexto Global do Seletor de Mês

## Problema Identificado

Anteriormente, cada componente que utilizava o `useMonthSelector()` criava seu próprio estado local independente. Isso causava inconsistências:

- O `MonthSelector` component tinha seu próprio estado
- A página de orçamentos tinha outro estado independente
- O `BudgetForm` tinha mais um estado separado
- Mudanças no seletor de mês **não atualizavam** as queries automaticamente

## Solução Implementada

Foi criado um **React Context** para compartilhar o estado do mês selecionado globalmente em toda a aplicação.

### Arquivos Criados

#### `src/providers/month-selector-provider.tsx`

Provider que encapsula o hook `useMonthSelector()` e compartilha o estado via Context:

```tsx
export function MonthSelectorProvider({ children, initialDate }: MonthSelectorProviderProps) {
  const monthSelector = useMonthSelector(initialDate)
  return <MonthSelectorContext.Provider value={monthSelector}>{children}</MonthSelectorContext.Provider>
}

export function useMonthSelectorContext(): UseMonthSelectorReturn {
  const context = useContext(MonthSelectorContext)
  if (!context) {
    throw new Error('useMonthSelectorContext must be used within a MonthSelectorProvider')
  }
  return context
}
```

### Arquivos Modificados

#### `src/components/layout/app-layout.tsx`

Adicionado o `MonthSelectorProvider` no layout principal, envolvendo toda a aplicação:

```tsx
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <MonthSelectorProvider>
        <AppSidebar />
        {/* ... resto do layout ... */}
      </MonthSelectorProvider>
    </SidebarProvider>
  )
}
```

#### `src/components/month-selector.tsx`

Atualizado para usar `useMonthSelectorContext()` ao invés de criar seu próprio estado:

**Antes:**

```tsx
const monthSelector = useMonthSelector(initialDate)
```

**Depois:**

```tsx
const monthSelector = useMonthSelectorContext()
```

Também adicionado `useEffect` para notificar mudanças:

```tsx
useEffect(() => {
  onMonthChange?.(monthSelector)
}, [monthSelector.selectedMonth, monthSelector.selectedYear, onMonthChange])
```

#### `src/app/admin/budgets/page.tsx`

Atualizado para usar o contexto:

**Antes:**

```tsx
import { useMonthSelector } from '@/hooks/use-month-selector'

const monthSelector = useMonthSelector()
```

**Depois:**

```tsx
import { useMonthSelectorContext } from '@/providers/month-selector-provider'

const monthSelector = useMonthSelectorContext()
```

#### `src/components/budget-form.tsx`

Atualizado para usar o contexto:

**Antes:**

```tsx
import { useMonthSelector } from '@/hooks/use-month-selector'

const monthSelector = useMonthSelector()
```

**Depois:**

```tsx
import { useMonthSelectorContext } from '@/providers/month-selector-provider'

const monthSelector = useMonthSelectorContext()
```

## Como Funciona Agora

### 1. Estado Único e Compartilhado

Existe apenas **uma instância** do estado de mês/ano em toda a aplicação, gerenciada pelo `MonthSelectorProvider`.

### 2. Sincronização Automática

Quando o usuário altera o mês no `MonthSelector`:

1. O estado global é atualizado no provider
2. Todos os componentes que usam `useMonthSelectorContext()` são re-renderizados
3. Queries do React Query são invalidadas automaticamente (devido à mudança no `currentMonthString`)
4. Novos dados são buscados para o mês selecionado

### 3. Consistência Garantida

- ✅ O `MonthSelector` sempre mostra o mês correto
- ✅ A lista de orçamentos sempre reflete o mês selecionado
- ✅ O formulário de orçamento sempre usa o mês atual do contexto
- ✅ Transações, reservas e outros recursos também podem usar o mesmo contexto

## Fluxo de Dados

```
Usuário clica em "Mês Anterior"
         ↓
MonthSelector chama monthSelector.goToPreviousMonth()
         ↓
Provider atualiza o estado global
         ↓
Todos os componentes com useMonthSelectorContext() são notificados
         ↓
currentMonthString muda de "2025-10" para "2025-09"
         ↓
React Query detecta mudança na query key
         ↓
Nova query é executada para buscar orçamentos de setembro/2025
         ↓
Interface atualiza com novos dados
```

## Migração de Outros Componentes

Para migrar outros componentes que usam `useMonthSelector()`:

### Antes:

```tsx
import { useMonthSelector } from '@/hooks/use-month-selector'

export function MyComponent() {
  const monthSelector = useMonthSelector()
  // ...
}
```

### Depois:

```tsx
import { useMonthSelectorContext } from '@/providers/month-selector-provider'

export function MyComponent() {
  const monthSelector = useMonthSelectorContext()
  // ...
}
```

## Benefícios

1. **Single Source of Truth**: Um único estado para toda a aplicação
2. **Sincronização Automática**: Mudanças se propagam instantaneamente
3. **Menos Bugs**: Impossível ter estados inconsistentes entre componentes
4. **Melhor UX**: Usuário vê mudanças imediatas ao trocar de mês
5. **Código Mais Limpo**: Não precisa passar props de mês para baixo na árvore

## Testes

Para testar a funcionalidade:

1. Acesse a página de orçamentos
2. Clique em "Mês Anterior" ou "Mês Seguinte" no `MonthSelector`
3. Verifique que:
   - A lista de orçamentos atualiza automaticamente
   - O indicador de mês no formulário rápido atualiza
   - O resumo de orçamentos reflete o novo mês
   - A comparação com mês anterior também atualiza

## Próximos Passos

Considerar aplicar o mesmo padrão para:

- [ ] Página de transações
- [ ] Página de reservas
- [ ] Dashboards e relatórios
- [ ] Qualquer outro componente que precise do mês selecionado
