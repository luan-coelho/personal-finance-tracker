# Implementação de Transações de Reserva

## Resumo

Implementação da funcionalidade de transações de reserva, permitindo que os usuários registrem movimentações diretamente em suas reservas (caixinhas).

## Mudanças Realizadas

### 1. Schema de Transação (`transaction-schema.ts`)

- ✅ Adicionado tipo `'reserva'` ao enum `transactionTypeEnum`
- ✅ Adicionado campo opcional `reserveId` na tabela `transactions` com referência à tabela `reserves`
- ✅ Tornado campo `category` opcional (nullable), já que transações de reserva não precisam de categoria
- ✅ Adicionada validação customizada:
  - Se tipo = 'reserva': `reserveId` é obrigatório
  - Se tipo = 'entrada' ou 'saida': `category` é obrigatória
- ✅ Atualizado tipo TypeScript `TransactionType` para incluir `'reserva'`

### 2. Componente TransactionForm (`transaction-form.tsx`)

- ✅ Adicionado import do hook `useReserves` para buscar reservas do espaço
- ✅ Adicionado ícone `Wallet` do lucide-react para representar reservas
- ✅ Adicionado terceiro radio button "Reserva" na seleção de tipo
- ✅ Implementada lógica condicional:
  - Quando tipo = 'reserva': exibe select de reservas ativas
  - Quando tipo = 'entrada' ou 'saida': exibe select de categorias
- ✅ Atualizada função `onSubmit` para enviar `reserveId` quando tipo = 'reserva'
- ✅ Adicionado campo `reserveId` nos valores padrão do formulário

### 3. Componente TransactionsTable (`transactions-table.tsx`)

- ✅ Adicionado ícone `Wallet` para tipo reserva
- ✅ Refatoradas funções auxiliares para suportar 3 tipos:
  - `getTypeColor()`: retorna cor azul para reservas
  - `getTypeIcon()`: retorna ícone de carteira para reservas
  - `getTypeLabel()`: retorna label "Reserva" para tipo reserva
- ✅ Atualizada formatação do valor para não mostrar sinal +/- em transações de reserva
- ✅ Aplicada cor azul para valores de transações de reserva

### 4. Componente TransactionsFilters (`transactions-filters.tsx`)

- ✅ Adicionada opção "🏦 Reservas" no filtro de tipo
- ✅ Atualizada badge de filtro ativo para mostrar "Reservas" quando filtrado por reserva

### 5. Migração do Banco de Dados

Criados arquivos:

- ✅ `drizzle/0009_add_reserve_to_transactions.sql`: script SQL para:
  - Adicionar valor 'reserva' ao enum `transaction_type`
  - Adicionar coluna `reserve_id` com foreign key para `reserves`
  - Tornar coluna `category` nullable

- ✅ `scripts/migrate-add-reserve-to-transactions.sh`: script para executar a migração

## Como Usar

### Para o Usuário Final

1. Ao criar uma nova transação, selecione o tipo "Reserva"
2. Escolha uma reserva ativa no dropdown que aparecerá
3. Preencha os demais campos (valor, data, descrição, tags)
4. A transação será registrada vinculada à reserva selecionada

### Para Executar a Migração

```bash
# Executar o script de migração
./scripts/migrate-add-reserve-to-transactions.sh

# Ou executar manualmente com Drizzle
pnpm drizzle-kit push
```

## Comportamento

- **Transações de Entrada/Saída**: Requerem categoria, afetam o saldo geral
- **Transações de Reserva**: Requerem reserva selecionada, registram movimentações específicas em uma caixinha

## Validações

- ✅ Não é possível criar transação de reserva sem selecionar uma reserva
- ✅ Não é possível criar transação de entrada/saída sem categoria
- ✅ Apenas reservas ativas são exibidas no select
- ✅ Se não houver reservas ativas, uma mensagem apropriada é exibida

## Próximos Passos (Sugeridos)

- [ ] Atualizar saldo da reserva automaticamente ao criar transação de reserva
- [ ] Criar relatório específico de movimentações por reserva
- [ ] Implementar gráficos de evolução das reservas
- [ ] Adicionar validação para não permitir saques maiores que o saldo da reserva
