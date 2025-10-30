# 🏢 Orçamentos Compartilhados em Espaços

## 📋 Visão Geral

Os orçamentos no sistema de finanças pessoais são **compartilhados entre todos os membros de um espaço**. Isso significa que:

- ✅ Todos os membros de um espaço podem **visualizar** os orçamentos
- ✅ Membros com permissão de **editor** ou **owner** podem **criar/editar/excluir** orçamentos
- ✅ Membros com permissão de **viewer** podem apenas **visualizar** orçamentos
- ✅ Os orçamentos são isolados por espaço (membros de outros espaços não têm acesso)

## 🔐 Sistema de Permissões

### Papéis de Membros

1. **Owner (Dono)**
   - Criador do espaço
   - Acesso total: visualizar, criar, editar e excluir orçamentos
   - Gerenciar membros do espaço

2. **Editor**
   - Membro convidado com permissões de edição
   - Pode visualizar, criar, editar e excluir orçamentos
   - Não pode gerenciar membros

3. **Viewer (Visualizador)**
   - Membro convidado apenas para visualização
   - Pode apenas visualizar orçamentos
   - Não pode criar, editar ou excluir

## 🔍 Como Funciona

### 1. Verificação de Acesso

Todas as operações com orçamentos verificam automaticamente se o usuário tem acesso ao espaço:

```typescript
// Verificar se usuário pode visualizar (qualquer membro)
const hasAccess = await canViewSpace(userEmail, spaceId)

// Verificar se usuário pode editar (owner ou editor)
const canEdit = await canEditSpace(userEmail, spaceId)
```

### 2. Fluxo de Acesso

#### Visualização (GET)

```
Usuário → API → Verificar se é membro do espaço → Retornar orçamentos
```

#### Criação/Edição/Exclusão (POST/PUT/DELETE)

```
Usuário → API → Verificar se é owner/editor → Executar operação
```

### 3. Estrutura de Dados

```typescript
Budget {
  id: string
  spaceId: string          // ← Liga o orçamento ao espaço
  category: string
  amount: decimal
  month: string
  createdById: string      // ← Quem criou (para auditoria)
  createdAt: timestamp
  updatedAt: timestamp
}

SpaceMember {
  id: string
  spaceId: string          // ← Liga o membro ao espaço
  userId: string           // ← Usuário que é membro
  role: 'owner' | 'editor' | 'viewer'
  createdAt: timestamp
}
```

## 🎯 Casos de Uso

### Caso 1: Família Compartilhando Orçamento

**Cenário:**

- João cria o espaço "Família Silva"
- Adiciona Maria como **editor**
- Adiciona Pedro como **viewer**

**Resultado:**

- João e Maria podem criar/editar orçamentos (ex: "Supermercado R$ 1.500")
- Pedro pode apenas visualizar os orçamentos
- Todos veem os mesmos dados

### Caso 2: Empresa com Múltiplos Departamentos

**Cenário:**

- Ana cria o espaço "Departamento TI"
- Adiciona Carlos como **editor**
- Adiciona Beatriz como **viewer**

**Resultado:**

- Ana e Carlos gerenciam orçamentos (ex: "Software R$ 10.000")
- Beatriz acompanha os gastos
- Dados isolados de outros departamentos

## 🛡️ Segurança Implementada

### 1. Autenticação

```typescript
const session = await auth()
if (!session?.user?.email) {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
}
```

### 2. Verificação de Membro

```typescript
// Verifica se usuário é owner, editor ou viewer do espaço
const hasAccess = await canViewSpace(session.user.email, spaceId)
if (!hasAccess) {
  return NextResponse.json({ error: 'Acesso negado ao espaço' }, { status: 403 })
}
```

### 3. Verificação de Permissão de Edição

```typescript
// Verifica se usuário é owner ou editor
const canEdit = await canEditSpace(session.user.email, spaceId)
if (!canEdit) {
  return NextResponse.json({ error: 'Sem permissão para editar' }, { status: 403 })
}
```

## 📊 Rotas da API

### GET `/api/budgets`

**Permissão:** Qualquer membro (viewer, editor, owner)

```typescript
// Lista orçamentos do espaço
// Requer: spaceId
// Verifica: canViewSpace
```

### GET `/api/budgets/[id]`

**Permissão:** Qualquer membro do espaço do orçamento

```typescript
// Busca orçamento específico
// Verifica: canViewSpace do spaceId do orçamento
```

### GET `/api/budgets/with-spending`

**Permissão:** Qualquer membro

```typescript
// Lista orçamentos com cálculo de gastos
// Requer: spaceId, month
// Verifica: canViewSpace
```

### GET `/api/budgets/summary`

**Permissão:** Qualquer membro

```typescript
// Resumo estatístico dos orçamentos
// Requer: spaceId, month
// Verifica: canViewSpace
```

### GET `/api/budgets/categories`

**Permissão:** Qualquer membro

```typescript
// Lista categorias com orçamento
// Requer: spaceId, month
// Verifica: canViewSpace
```

### POST `/api/budgets`

**Permissão:** Owner ou Editor

```typescript
// Cria novo orçamento
// Requer: spaceId, category, amount, month
// Verifica: canEditSpace
```

### PUT `/api/budgets/[id]`

**Permissão:** Owner ou Editor do espaço

```typescript
// Atualiza orçamento existente
// Verifica: canEditSpace do spaceId do orçamento
```

### DELETE `/api/budgets/[id]`

**Permissão:** Owner ou Editor do espaço

```typescript
// Exclui orçamento
// Verifica: canEditSpace do spaceId do orçamento
```

## 🎨 Interface do Usuário

### Visualização por Espaço Ativo

O sistema usa o **espaço ativo selecionado** para filtrar os orçamentos:

```typescript
const { selectedSpace } = useSelectedSpace()

// Todos os orçamentos são filtrados pelo espaço ativo
const { data: budgets } = useBudgetsWithSpending(selectedSpace?.id, month)
```

### Seletor de Espaço

O usuário pode alternar entre seus espaços:

```
┌─────────────────────────┐
│ Espaço: Família Silva ▼│  ← Seletor
└─────────────────────────┘
```

Ao trocar de espaço:

1. Os orçamentos são recarregados automaticamente
2. Apenas os orçamentos do novo espaço são exibidos
3. Permissões são recalculadas

## ✅ Validações e Regras

### 1. Orçamento Único por Categoria/Mês

```typescript
// Não pode criar dois orçamentos para "Supermercado" no mesmo mês
const existingBudget = await BudgetService.findByCategoryAndMonth(spaceId, category, month)
```

### 2. Isolamento de Dados

- Orçamentos só são visíveis para membros do espaço
- Queries sempre filtram por `spaceId`
- Impossível acessar orçamentos de outros espaços

### 3. Auditoria

- `createdById` registra quem criou o orçamento
- `createdAt` e `updatedAt` registram quando
- Histórico de quem fez cada alteração

## 🔄 Sincronização entre Membros

Todos os membros veem os mesmos dados em tempo real:

1. **João cria** orçamento "Supermercado R$ 1.500"
2. **Sistema salva** no banco de dados
3. **Maria e Pedro** veem o novo orçamento automaticamente (ao recarregar)

### Cache e Atualização

```typescript
// Ao criar/editar/excluir, o cache é invalidado
queryClient.invalidateQueries({ queryKey: budgetKeys.all })

// Todos os componentes que usam os dados são atualizados
```

## 🧪 Como Testar

### Teste 1: Membro Pode Ver Orçamentos

1. Crie um espaço como usuário A
2. Adicione usuário B como editor
3. Usuário A cria um orçamento
4. **Resultado:** Usuário B vê o orçamento

### Teste 2: Viewer Não Pode Editar

1. Adicione usuário C como viewer
2. Usuário C tenta criar/editar orçamento
3. **Resultado:** Ação bloqueada (403 Forbidden)

### Teste 3: Isolamento de Espaços

1. Usuário A tem dois espaços: "Pessoal" e "Trabalho"
2. Cria orçamentos em "Pessoal"
3. Alterna para espaço "Trabalho"
4. **Resultado:** Não vê os orçamentos de "Pessoal"

### Teste 4: Compartilhamento em Tempo Real

1. Usuário A e B no mesmo espaço
2. Usuário A cria orçamento
3. Usuário B recarrega a página
4. **Resultado:** Usuário B vê o novo orçamento

## 📝 Próximas Melhorias

1. **Notificações em Tempo Real**
   - WebSockets para atualização automática
   - Notificar membros sobre novos orçamentos

2. **Histórico de Alterações**
   - Log completo de quem alterou o quê
   - Auditoria detalhada

3. **Comentários em Orçamentos**
   - Membros podem comentar sobre gastos
   - Discussões sobre categoria

4. **Aprovação de Orçamentos**
   - Workflow de aprovação
   - Owner aprova orçamentos criados por editors

## 🎉 Conclusão

✅ **O sistema está 100% funcional para compartilhamento de orçamentos entre membros de um espaço!**

- Todos os membros veem os mesmos orçamentos
- Permissões são verificadas em todas as operações
- Dados são isolados por espaço
- Sistema seguro e escalável
