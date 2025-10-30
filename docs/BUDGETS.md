# Funcionalidade de Orçamentos Compartilhados

Esta documentação detalha a funcionalidade de **Orçamento Compartilhado por Categoria** implementada no sistema de gestão financeira.

## 📋 Visão Geral

A funcionalidade permite que famílias ou grupos definam limites máximos de gastos (Teto de Gastos) para cada categoria de despesa, garantindo que todos trabalhem juntos para atingir as metas financeiras mensais.

## 🎯 Características Principais

### 1. Definição do Orçamento

- **Seleção de Categoria**: Escolha categorias como "Alimentação", "Transporte", "Lazer", etc.
- **Definição do Limite**: Define um valor mensal para cada categoria
- **Período Recorrente**: Os limites são mensais e reiniciam automaticamente no primeiro dia de cada mês
- **Visão Centralizada**: Todos os membros do espaço visualizam as categorias e seus respectivos limites

### 2. Controle por Espaço

- Cada espaço tem seus próprios orçamentos independentes
- Apenas membros com permissão de edição podem criar/editar orçamentos
- Todos os membros podem visualizar os orçamentos e acompanhar o progresso

### 3. Controle Mensal

- Interface com seletor de mês/ano para navegação temporal
- Histórico completo de orçamentos mensais
- Possibilidade de criar orçamentos para meses futuros

## 🛠️ Componentes da Implementação

### Schema do Banco de Dados

```typescript
// Tabela: budgets
{
  id: uuid (PK),
  spaceId: uuid (FK -> spaces.id),
  category: varchar(255),
  amount: decimal(12,2),
  month: text (formato: "YYYY-MM"),
  createdById: uuid (FK -> users.id),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### APIs Disponíveis

#### Orçamentos Base

- `GET /api/budgets` - Listar orçamentos com filtros
- `POST /api/budgets` - Criar novo orçamento
- `GET /api/budgets/[id]` - Buscar orçamento específico
- `PUT /api/budgets/[id]` - Atualizar orçamento
- `DELETE /api/budgets/[id]` - Deletar orçamento

#### Orçamentos com Dados de Gasto

- `GET /api/budgets/with-spending` - Orçamentos com informações de gastos calculados
- `GET /api/budgets/summary` - Resumo consolidado dos orçamentos
- `GET /api/budgets/categories` - Categorias com orçamento definido

### Componentes React

#### `BudgetForm`

Formulário para criar/editar orçamentos com:

- Seleção de categoria (existente ou nova)
- Definição do valor limite
- Seleção do mês de referência
- Validação completa com Zod

#### `BudgetCard`

Card individual para cada orçamento mostrando:

- Nome da categoria
- Valor orçado vs gasto
- Valor restante
- Barra de progresso visual
- Status (dentro do orçamento, próximo do limite, excedido)
- Ações (editar, excluir)

#### `BudgetSummary`

Resumo consolidado apresentando:

- Total orçado vs total gasto
- Quantidade de categorias
- Categorias excedidas ou próximas do limite
- Barra de progresso geral
- Alertas visuais

#### `MonthSelector`

Seletor de mês/ano reutilizável com:

- Navegação por setas (anterior/próximo)
- Seletor de ano em dropdown
- Botão "Hoje" para voltar ao mês atual
- Botão "Ver Todas" para desativar filtro mensal

### Hooks Personalizados

#### `useBudgets()`

- `useBudgets(spaceId, month?)` - Lista orçamentos
- `useBudgetsWithSpending(spaceId, month)` - Orçamentos com gastos
- `useBudgetSummary(spaceId, month)` - Resumo consolidado
- `useCreateBudget()` - Criação de orçamentos
- `useUpdateBudget()` - Atualização de orçamentos
- `useDeleteBudget()` - Exclusão de orçamentos

#### `useMonthSelector()`

Hook para gerenciar seleção de mês/ano:

- Estado do mês/ano selecionado
- Funções de navegação
- Cálculo de datas início/fim do mês
- Detecção se é mês atual

## 🚀 Como Usar

### 1. Configuração Inicial

1. Acesse `/admin/setup` para executar as migrações necessárias
2. Verifique se a tabela `budgets` foi criada com sucesso

### 2. Criar Orçamentos

1. Navegue para "Orçamentos" no menu lateral
2. Selecione o mês desejado
3. Clique em "Novo Orçamento"
4. Preencha categoria e valor limite
5. Confirme a criação

### 3. Acompanhar Progresso

- O sistema calcula automaticamente os gastos por categoria
- As barras de progresso mostram o percentual utilizado
- Alertas visuais indicam categorias próximas do limite ou excedidas

### 4. Gerenciar Orçamentos

- Edite valores clicando nos três pontos do card
- Exclua orçamentos desnecessários
- Navegue entre diferentes meses para histórico

## 📊 Cálculos e Regras de Negócio

### Cálculo de Gastos

```sql
-- Gastos por categoria no mês
SELECT
  category,
  SUM(amount::numeric) as total_spent
FROM transactions
WHERE
  space_id = ?
  AND type = 'saida'
  AND date >= inicio_do_mes
  AND date <= fim_do_mes
GROUP BY category
```

### Status do Orçamento

- **Verde** (Dentro do orçamento): 0% - 79%
- **Amarelo** (Próximo do limite): 80% - 100%
- **Vermelho** (Excedido): > 100%

### Regras de Validação

- Um orçamento por categoria por mês por espaço
- Valores devem ser positivos (mínimo R$ 0,01)
- Formato do mês: "YYYY-MM"
- Apenas membros com permissão de edição podem criar/editar

## 🔒 Controle de Acesso

### Visualização

- Todos os membros do espaço podem ver os orçamentos
- Dados são filtrados por espaço automaticamente

### Edição

- Apenas proprietários e editores podem criar/editar orçamentos
- Sistema verifica permissões via `canEditSpace()`

### Segurança

- Validação de acesso em todas as APIs
- Validação de dados com Zod
- Proteção contra SQL injection com Drizzle ORM

## 🎨 Interface e UX

### Design System

- Utiliza Shadcn UI para consistência visual
- Tema responsivo que adapta a diferentes telas
- Feedbacks visuais claros para diferentes estados

### Acessibilidade

- Componentes com suporte a navegação por teclado
- Cores com contraste adequado
- Textos alternativos em elementos visuais

### Estados de Loading

- Skeleton loaders durante carregamento
- Indicadores de progresso em operações
- Feedback imediato para ações do usuário

## 🔄 Integrações

### Com Transações

- Cálculo automático de gastos baseado nas transações existentes
- Filtros por categoria sincronizados
- Atualização em tempo real dos valores

### Com Espaços

- Orçamentos isolados por espaço
- Herança de permissões do espaço
- Navegação contextual

### Com Sistema de Usuários

- Rastreamento de quem criou cada orçamento
- Logs de atividade (futuro)
- Notificações (futuro)

## 🚀 Próximas Funcionalidades

### Planejadas

- [ ] Notificações quando próximo do limite
- [ ] Orçamentos anuais e trimestrais
- [ ] Comparação entre meses
- [ ] Metas de economia por categoria
- [ ] Relatórios de performance
- [ ] Orçamentos com subcategorias
- [ ] Aprovações para orçamentos grandes

### Melhorias de UX

- [ ] Drag & drop para reorganizar categorias
- [ ] Gráficos mais interativos
- [ ] Exportação de relatórios
- [ ] Modo offline básico

## 🐛 Solução de Problemas

### Tabela não existe

Execute a página `/admin/setup` para criar as tabelas necessárias.

### Orçamentos não aparecem

Verifique se:

- O usuário tem acesso ao espaço
- O mês selecionado está correto
- Existem orçamentos criados para o período

### Valores incorretos

- Verifique se as transações estão categorizadas corretamente
- Confirme se o período de cálculo está correto
- Verifique se não há transações duplicadas

## 📝 Logs e Monitoramento

### Logs Importantes

```javascript
// Criação de orçamento
console.log('Budget created:', { budgetId, spaceId, category, amount })

// Cálculo de gastos
console.log('Spending calculated:', { category, spent, budget, percentage })

// Erros de validação
console.error('Budget validation failed:', error.message)
```

### Métricas Sugeridas

- Número de orçamentos criados por mês
- Percentual de orçamentos respeitados
- Categorias mais utilizadas
- Evolução dos gastos ao longo do tempo
