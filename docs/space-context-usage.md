# Contexto de Espaço - Guia de Uso

## Visão Geral

O sistema de contexto de espaço permite que a aplicação mantenha um espaço selecionado globalmente, fazendo com que todas as funcionalidades trabalhem no contexto desse espaço específico.

## Componentes Principais

### 1. SpaceProvider

Provider que gerencia o estado global do espaço selecionado.

### 2. SpaceSelector

Componente de seleção de espaço no header da aplicação.

### 3. SpaceIndicator

Indicador visual que mostra o espaço atual ou avisa quando nenhum está selecionado.

## Hooks Disponíveis

### useSelectedSpace()

Hook principal para acessar o espaço selecionado.

```typescript
import { useSelectedSpace } from '@/hooks/use-selected-space'

function MyComponent() {
  const {
    selectedSpace,        // Espaço atualmente selecionado
    setSelectedSpace,     // Função para alterar o espaço
    isLoading,           // Estado de carregamento
    selectedSpaceId,     // ID do espaço selecionado
    selectedSpaceName,   // Nome do espaço selecionado
    hasSelectedSpace,    // Booleano se há espaço selecionado
  } = useSelectedSpace()

  // Usar o espaço selecionado nas suas operações
  if (!hasSelectedSpace) {
    return <div>Selecione um espaço</div>
  }

  return <div>Trabalhando no espaço: {selectedSpaceName}</div>
}
```

## Exemplos de Uso

### 1. Filtrar dados por espaço

```typescript
function TransactionsList() {
  const { selectedSpaceId, hasSelectedSpace } = useSelectedSpace()

  const { data: transactions } = useQuery({
    queryKey: ['transactions', selectedSpaceId],
    queryFn: () => getTransactionsBySpace(selectedSpaceId!),
    enabled: hasSelectedSpace,
  })

  if (!hasSelectedSpace) {
    return <NoSpaceSelected />
  }

  return <TransactionsTable transactions={transactions} />
}
```

### 2. Criar recursos vinculados ao espaço

```typescript
function CreateTransactionForm() {
  const { selectedSpaceId, hasSelectedSpace } = useSelectedSpace()

  const createMutation = useMutation({
    mutationFn: (data) => createTransaction({
      ...data,
      spaceId: selectedSpaceId, // Vincula ao espaço selecionado
    }),
  })

  if (!hasSelectedSpace) {
    return <div>Selecione um espaço para criar transações</div>
  }

  // Resto do formulário...
}
```

### 3. Navegação condicional

```typescript
function NavigationMenu() {
  const { hasSelectedSpace, selectedSpaceName } = useSelectedSpace()

  return (
    <nav>
      {hasSelectedSpace && (
        <div className="space-indicator">
          Espaço atual: {selectedSpaceName}
        </div>
      )}

      <ul>
        <li>
          <Link
            href="/dashboard"
            className={!hasSelectedSpace ? 'disabled' : ''}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/transactions"
            className={!hasSelectedSpace ? 'disabled' : ''}
          >
            Transações
          </Link>
        </li>
      </ul>
    </nav>
  )
}
```

## Persistência

O espaço selecionado é automaticamente salvo no `localStorage` e restaurado quando o usuário recarrega a página.

## Comportamento Padrão

1. **Primeiro acesso**: Se o usuário tem espaços, o primeiro será selecionado automaticamente
2. **Espaço removido**: Se o espaço selecionado for removido, o primeiro disponível será selecionado
3. **Sem espaços**: Se não há espaços, o usuário será direcionado para criar um

## Integração com APIs

Sempre que fizer chamadas para APIs que dependem do espaço, use o `selectedSpaceId`:

```typescript
// ✅ Correto
const { data } = useQuery({
  queryKey: ['data', selectedSpaceId],
  queryFn: () => fetchData(selectedSpaceId),
  enabled: !!selectedSpaceId,
})

// ❌ Incorreto - não considera o espaço selecionado
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: () => fetchAllData(),
})
```

## Componentes de Exemplo

O arquivo `src/app/admin/page.tsx` mostra um exemplo completo de como usar o contexto de espaço em uma página.
