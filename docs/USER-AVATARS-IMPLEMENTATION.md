# Avatares de Usuário em Transações e Orçamentos

## Descrição das Mudanças

Esta implementação adiciona a exibição de avatares dos usuários nas tabelas de transações e orçamentos, especialmente útil para espaços compartilhados com múltiplos membros.

## Arquivos Modificados

### 1. Schema do Usuário

**Arquivo**: `src/app/db/schemas/user-schema.ts`

- Adicionada coluna `image` (TEXT) para armazenar a URL da foto do usuário
- Atualizado o schema Zod para incluir o campo `image`

### 2. Schemas de Transação e Orçamento

**Arquivos**:

- `src/app/db/schemas/transaction-schema.ts`
- `src/app/db/schemas/budget-schema.ts`

Novos tipos criados:

- `TransactionWithUser`: Transação com dados do usuário incluídos
- `BudgetWithSpendingAndUser`: Orçamento com gastos e dados do usuário criador

### 3. Serviços

**Arquivos**:

- `src/services/transaction-service.ts`
- `src/services/budget-service.ts`

Modificações:

- Método `findMany()` do TransactionService agora retorna `TransactionWithUser[]` com dados do usuário via LEFT JOIN
- Método `findManyWithSpending()` do BudgetService agora retorna `BudgetWithSpendingAndUser[]` com dados do criador

### 4. Componentes

#### Novo Componente

**Arquivo**: `src/components/user-avatar-display.tsx`

Componente reutilizável que exibe:

- Avatar do usuário com imagem (se disponível)
- Fallback com **iniciais de duas palavras** do nome (primeira + última palavra)
- Tooltip com nome e email do usuário (opcional)
- Três tamanhos disponíveis: `sm`, `default`, `lg`

**Exemplos de iniciais:**

- "João Silva" → **JS**
- "Maria Santos Oliveira" → **MO**
- "Pedro" → **P** (apenas uma palavra)

Para mais exemplos, veja: [Avatar Initials Examples](./AVATAR-INITIALS-EXAMPLES.md)

#### Tabelas Atualizadas

**Arquivos**:

- `src/components/transactions-table.tsx`
- `src/components/budgets-table.tsx`

Mudanças:

- Nova coluna "Usuário" na tabela de transações
- Nova coluna "Criado por" na tabela de orçamentos
- Integração do componente `UserAvatarDisplay`

### 5. Hooks

**Arquivos**:

- `src/hooks/use-transactions.ts`
- `src/hooks/use-budgets.ts`

Atualizações de tipos:

- Hooks agora retornam os novos tipos com informações do usuário
- `useTransactions()` retorna `TransactionWithUser[]`
- `useBudgetsWithSpending()` retorna `BudgetWithSpendingAndUser[]`

## Migração do Banco de Dados

**Arquivo**: `scripts/add-user-image-column.sql`

Execute este script SQL para adicionar a coluna `image` à tabela `users`:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;
COMMENT ON COLUMN users.image IS 'URL da foto do perfil do usuário';
```

## Como Usar

### Exibir Avatar do Usuário

```tsx
import { UserAvatarDisplay } from '@/components/user-avatar-display'

// Exemplo básico
<UserAvatarDisplay
  user={transaction.user}
  size="sm"
/>

// Com tooltip desativado
<UserAvatarDisplay
  user={budget.createdBy}
  size="default"
  showTooltip={false}
/>

// Avatar grande com classe customizada
<UserAvatarDisplay
  user={user}
  size="lg"
  className="ring-2 ring-primary"
/>
```

### Propriedades do Componente

| Propriedade   | Tipo                        | Padrão      | Descrição                                 |
| ------------- | --------------------------- | ----------- | ----------------------------------------- |
| `user`        | `UserInfo \| undefined`     | -           | Dados do usuário (id, name, email, image) |
| `size`        | `'sm' \| 'default' \| 'lg'` | `'default'` | Tamanho do avatar                         |
| `className`   | `string`                    | -           | Classes CSS adicionais                    |
| `showTooltip` | `boolean`                   | `true`      | Exibir tooltip com info do usuário        |

## Benefícios

1. **Identificação Visual**: Usuários podem facilmente identificar quem criou cada transação ou orçamento
2. **Colaboração**: Melhora a experiência em espaços compartilhados
3. **Transparência**: Maior clareza sobre a autoria das operações financeiras
4. **UX Aprimorada**: Interface mais amigável e informativa

## Próximos Passos (Sugestões)

- [ ] Adicionar funcionalidade de upload de foto de perfil
- [ ] Implementar cache de avatares
- [ ] Adicionar filtro por usuário nas tabelas
- [ ] Implementar avatar em outros componentes (cards, formulários, etc.)
