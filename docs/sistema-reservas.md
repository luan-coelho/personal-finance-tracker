# 🎯 Sistema de Reservas (Caixinhas) - Implementação Completa

## 📋 Visão Geral

Sistema completo de "caixinhas" ou "reservas financeiras" que permite aos usuários criar compartimentos separados para organizar seu dinheiro e registrar movimentações (depósitos e retiradas).

##✅ Funcionalidades Implementadas

### 1. **Gerenciamento de Reservas**

- ✅ Criar reservas personalizadas com nome, descrição, cor e ícone
- ✅ Definir metas financeiras opcionais
- ✅ Acompanhar saldo atual automaticamente
- ✅ Ativar/desativar reservas
- ✅ Editar e excluir reservas
- ✅ Visualização em cards com progresso

### 2. **Movimentações**

- ✅ Registrar depósitos (adicionar dinheiro)
- ✅ Registrar retiradas (retirar dinheiro)
- ✅ Histórico completo de movimentações
- ✅ Atualização automática do saldo
- ✅ Validação de saldo insuficiente
- ✅ Excluir movimentações com reversa automática

### 3. **Integração com Espaços**

- ✅ Reservas vinculadas a espaços
- ✅ Controle de acesso via membros do espaço
- ✅ Editors podem criar/editar movimentações
- ✅ Viewers apenas visualizam

## 🗄️ Estrutura do Banco de Dados

### Tabela: `reserves`

```sql
CREATE TABLE reserves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(10, 2),
  current_amount NUMERIC(10, 2) DEFAULT '0' NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'piggy-bank',
  active BOOLEAN DEFAULT true NOT NULL,
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP
);
```

### Tabela: `reserve_movements`

```sql
CREATE TABLE reserve_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type reserve_movement_type NOT NULL, -- 'deposit' ou 'withdraw'
  amount NUMERIC(10, 2) NOT NULL,
  date TIMESTAMP NOT NULL,
  description TEXT,
  reserve_id UUID NOT NULL REFERENCES reserves(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP
);

CREATE TYPE reserve_movement_type AS ENUM ('deposit', 'withdraw');
```

## 🔌 APIs Disponíveis

### Reservas

#### `GET /api/reserves?spaceId={spaceId}`

Lista todas as reservas de um espaço

**Query Params:**

- `spaceId` (required): ID do espaço

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Emergência",
      "description": "Fundo de emergência",
      "targetAmount": "10000.00",
      "currentAmount": "2500.00",
      "color": "#ef4444",
      "icon": "shield",
      "active": true,
      "spaceId": "uuid",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/reserves`

Cria uma nova reserva

**Request Body:**

```json
{
  "name": "Férias",
  "description": "Para próxima viagem",
  "targetAmount": "5000",
  "color": "#3b82f6",
  "icon": "plane",
  "spaceId": "uuid"
}
```

#### `PUT /api/reserves/[id]`

Atualiza uma reserva

#### `DELETE /api/reserves/[id]`

Exclui uma reserva

#### `PATCH /api/reserves/[id]/toggle`

Ativa/desativa uma reserva

### Movimentações

#### `GET /api/reserves/[id]/movements`

Lista movimentações de uma reserva

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "deposit",
      "amount": "500.00",
      "date": "2024-01-01T00:00:00Z",
      "description": "Depósito inicial",
      "reserveId": "uuid",
      "userId": "uuid",
      "reserve": {
        "id": "uuid",
        "name": "Emergência",
        "color": "#ef4444",
        "icon": "shield"
      }
    }
  ]
}
```

#### `POST /api/reserves/[id]/movements`

Registra uma movimentação

**Request Body:**

```json
{
  "type": "deposit", // ou "withdraw"
  "amount": "1000",
  "date": "2024-01-15T00:00:00Z",
  "description": "Depósito mensal"
}
```

**Comportamento:**

- `deposit`: Adiciona o valor ao saldo atual
- `withdraw`: Subtrai o valor do saldo atual
- Valida saldo insuficiente em retiradas
- Atualiza automaticamente `currentAmount` da reserva

#### `DELETE /api/reserves/[id]/movements/[movementId]`

Exclui uma movimentação e reverte o saldo

## 📦 Arquivos Criados

### Schemas

1. `/src/app/db/schemas/reserve-schema.ts` - Schema da tabela de reservas
2. `/src/app/db/schemas/reserve-movement-schema.ts` - Schema de movimentações

### APIs

3. `/src/app/api/reserves/route.ts` - GET e POST de reservas
4. `/src/app/api/reserves/[id]/route.ts` - GET, PUT, DELETE, PATCH individual
5. `/src/app/api/reserves/[id]/movements/route.ts` - GET e POST de movimentações
6. `/src/app/api/reserves/[id]/movements/[movementId]/route.ts` - DELETE de movimentação

### Serviços

7. `/src/services/reserve-service.ts` - Serviço para reservas
8. `/src/services/reserve-movement-service.ts` - Serviço para movimentações

### Hooks

9. `/src/hooks/use-reserves.ts` - Hooks React Query para reservas
10. `/src/hooks/use-reserve-movements.ts` - Hooks para movimentações

### Componentes

11. `/src/components/reserve-card.tsx` - Card de exibição de reserva

### Atualizações

12. `/src/app/db/schemas/relations.ts` - Relacionamentos atualizados
13. `/src/app/db/schemas/index.ts` - Exports atualizados
14. `/src/lib/routes.ts` - Rotas adicionadas

### Migrations

15. `drizzle/0005_plain_husk.sql` - Migration aplicada no banco

## 🎨 Personalização Visual

### Ícones Disponíveis

```typescript
const icons = [
  'piggy-bank',
  'wallet',
  'shield',
  'plane',
  'trending-up',
  'shopping-cart',
  'home',
  'car',
  'heart',
  'gift',
  'graduation-cap',
  'briefcase',
  'smartphone',
  'laptop',
  'droplet',
  'zap',
]
```

### Cores Disponíveis

- Vermelho: `#ef4444`
- Laranja: `#f97316`
- Amarelo: `#f59e0b`
- Verde: `#10b981`
- Azul: `#3b82f6`
- Índigo: `#6366f1`
- Roxo: `#8b5cf6`
- Rosa: `#ec4899`
- Cinza: `#6b7280`

## 🔐 Segurança e Permissões

### Verificações Implementadas

1. **Criar/Editar Reservas**: Requer permissão de Editor ou Owner no espaço
2. **Visualizar Reservas**: Requer qualquer acesso ao espaço (Owner, Editor ou Viewer)
3. **Movimentações**: Mesmo controle das reservas
4. **Exclusão**: Cascade delete configurado - ao excluir reserva, remove movimentações

### Validações

- ✅ Saldo insuficiente em retiradas
- ✅ Valores numéricos positivos
- ✅ Datas obrigatórias
- ✅ Cores em formato hexadecimal
- ✅ IDs UUID válidos

## 💡 Exemplos de Uso

### 1. Criar Reserva de Emergência

```typescript
const { mutateAsync } = useCreateReserve()

await mutateAsync({
  name: 'Emergência',
  description: 'Fundo para imprevistos',
  targetAmount: '10000',
  currentAmount: '0',
  color: '#ef4444',
  icon: 'shield',
  spaceId: 'space-uuid',
})
```

### 2. Registrar Depósito

```typescript
const { mutateAsync } = useCreateReserveMovement(spaceId)

await mutateAsync({
  type: 'deposit',
  amount: '500',
  date: new Date(),
  description: 'Depósito mensal',
  reserveId: 'reserve-uuid',
  userId: 'user-uuid',
})
// Saldo atual: 0 → 500
```

### 3. Registrar Retirada

```typescript
await mutateAsync({
  type: 'withdraw',
  amount: '200',
  date: new Date(),
  description: 'Pagamento de conta',
  reserveId: 'reserve-uuid',
  userId: 'user-uuid',
})
// Saldo atual: 500 → 300
```

## 📊 Recursos de UI

### ReserveCard Component

- Exibe nome, descrição e ícone colorido
- Mostra saldo atual formatado em BRL
- Progress bar quando tem meta definida
- Indicador de porcentagem atingida
- Badge de status (Ativa/Inativa)
- Menu de ações (Editar, Adicionar Movimentação, Excluir)
- Dialogo de confirmação para exclusão

## ✅ Status da Implementação

- ✅ **Backend Completo** - Schemas, APIs, validações
- ✅ **Serviços** - Services e hooks React Query
- ✅ **Migrations** - Banco de dados atualizado
- ✅ **Componentes** - Todos os componentes implementados
- ✅ **Páginas** - Todas as páginas criadas e funcionais
- ✅ **Formulários** - Formulários de reserva e movimentação
- ✅ **Menu de Navegação** - Link adicionado ao sidebar

## 🎉 Sistema 100% Funcional!

O sistema de reservas está completamente implementado e pronto para uso!

### Componentes Implementados

1. **ReserveCard** - Card de exibição de reserva com progresso
2. **ReserveForm** - Formulário para criar/editar reservas
3. **ReservesGrid** - Grid responsivo de cards
4. **ReservesSummary** - Resumo estatístico das reservas
5. **ReserveMovementForm** - Formulário de movimentações
6. **ReserveMovementsTable** - Tabela de histórico

### Páginas Implementadas

1. **/admin/reserves** - Listagem de reservas com resumo
2. **/admin/reserves/new** - Criar nova reserva
3. **/admin/reserves/[id]/edit** - Editar reserva existente
4. **/admin/reserves/[id]/movements** - Gerenciar movimentações

### Navegação

- Menu lateral inclui link "Reservas" com ícone de porquinho (PiggyBank)
- Todas as páginas possuem navegação intuitiva com botões de voltar
- Dialogs para ações rápidas (nova movimentação)

## 🎯 Funcionalidades Completas

✅ Criar, editar e excluir reservas  
✅ Ativar/desativar reservas  
✅ Registrar depósitos e retiradas  
✅ Visualizar histórico de movimentações  
✅ Acompanhar progresso de metas  
✅ Saldo calculado automaticamente  
✅ Validação de saldo insuficiente  
✅ Reversão automática ao excluir movimentação  
✅ Personalização visual (cores e ícones)  
✅ Resumo estatístico geral  
✅ Filtros e busca  
✅ Integração completa com espaços  
✅ Controle de permissões

## 🚀 Como Usar

### 1. Acessar Reservas

- No menu lateral, clique em "Reservas"
- Visualize o resumo geral e todas as suas reservas

### 2. Criar uma Reserva

- Clique em "Nova Reserva"
- Preencha: nome, descrição (opcional), meta (opcional)
- Escolha uma cor e ícone
- Clique em "Criar Reserva"

### 3. Adicionar Movimentação

- No card da reserva, clique em "Adicionar Movimentação" no menu (⋮)
- OU abra a reserva e clique em "Nova Movimentação"
- Escolha o tipo (Depósito ou Retirada)
- Informe valor e data
- Adicione descrição (opcional)
- Confirme

### 4. Gerenciar Movimentações

- Clique no card da reserva ou acesse via menu
- Visualize todo o histórico
- Exclua movimentações se necessário (saldo é ajustado automaticamente)

### 5. Editar Reserva

- No menu do card (⋮), clique em "Editar"
- Atualize as informações desejadas
- Salve as alterações

## 🎓 Conceitos Utilizados

- **Drizzle ORM** - Modelagem de dados e migrations
- **Zod** - Validação de schemas
- **React Query** - Cache e sincronização de dados
- **shadcn/ui** - Componentes UI (Dialog, Card, Form, Table, etc)
- **TypeScript** - Tipagem forte em todo o código
- **RESTful API** - Padrão de APIs
- **Cascade Delete** - Integridade referencial
- **React Hook Form** - Gerenciamento de formulários
- **Next.js 14** - App Router e Server Components

## 💡 Melhorias Futuras (Opcional)

Sugestões para expandir o sistema:

- 📊 **Gráficos** - Visualização da evolução do saldo ao longo do tempo
- 📅 **Movimentações Recorrentes** - Agendar depósitos automáticos
- 🔔 **Notificações** - Alertas ao atingir porcentagem da meta
- 📤 **Transferências** - Mover dinheiro entre reservas
- 📑 **Relatórios** - Exportar histórico em PDF/Excel
- 🏷️ **Tags** - Categorizar movimentações
- 🔍 **Filtros Avançados** - Busca por período, tipo, valor
- 📱 **Dashboard** - Visão geral com cards interativos
- 🎯 **Metas Compartilhadas** - Reservas colaborativas
- 📈 **Análise Preditiva** - Projeção de quando atingirá a meta

## 📝 Notas Importantes

1. **Saldo Automático**: O `currentAmount` é calculado automaticamente com base nas movimentações
2. **Exclusão Reversa**: Ao excluir uma movimentação, o valor é revertido no saldo
3. **Cores e Ícones**: Personalizáveis por reserva para fácil identificação visual
4. **Metas Opcionais**: Reservas podem ter ou não uma meta definida
5. **Multi-Space**: Cada espaço tem suas próprias reservas isoladas

---

**Status**: ✅ Sistema 100% Completo e Funcional!  
**Data de Conclusão**: 15 de outubro de 2025  
**Implementado por**: GitHub Copilot
