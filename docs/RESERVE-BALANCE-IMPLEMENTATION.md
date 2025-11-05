# Implementação do Sistema de Saldo com Reservas

## Resumo

Implementação da lógica de cálculo de saldo considerando transações de reserva. Quando uma transação do tipo "reserva" é criada, ela:

1. **Subtrai do saldo geral disponível** (igual a uma saída)
2. **Adiciona o valor à reserva selecionada**
3. **Não aparece como "saída" no resumo** (é categorizada como "reserva")

## Como Funciona

### Fluxo de Transação de Reserva

Quando o usuário cria uma transação do tipo "reserva":

```
Saldo Inicial: R$ 1.000,00
Entradas: R$ 1.000,00
Saídas: R$ 0,00
Reservas: R$ 0,00

Usuário adiciona R$ 200,00 na reserva "Emergência"
↓
Saldo Final: R$ 800,00 (1000 - 200)
Entradas: R$ 1.000,00
Saídas: R$ 0,00
Reservas: R$ 200,00

Reserva "Emergência": R$ 200,00
```

### Cálculo do Saldo

**Fórmula:** `Saldo Disponível = Entradas - Saídas - Reservas`

- **Entradas**: Todo dinheiro que entra
- **Saídas**: Gastos efetivos
- **Reservas**: Dinheiro alocado em caixinhas (não é gasto, mas também não está disponível)

## Mudanças Implementadas

### 1. TransactionService (`src/services/transaction-service.ts`)

#### Método `create()`

- Adicionada transação do banco de dados para garantir atomicidade
- Quando tipo = 'reserva':
  - Busca a reserva selecionada
  - Adiciona o valor da transação ao `currentAmount` da reserva
  - Atualiza a reserva no banco

```typescript
if (data.type === 'reserva' && data.reserveId) {
  await db.transaction(async tx => {
    const [reserve] = await tx.select()...
    const newAmount = currentAmount + transactionAmount
    await tx.update(reservesTable)...
  })
}
```

#### Método `update()`

- Reverte o saldo da reserva original (se era transação de reserva)
- Aplica o valor à nova reserva (se passou a ser transação de reserva)
- Suporta mudança de tipo de transação

#### Método `delete()`

- Reverte o saldo da reserva antes de deletar a transação
- Garante que o saldo da reserva seja corrigido

#### Método `getSummary()`

- Modificado para calcular também `totalReservas`
- Fórmula de saldo atualizada: `saldo = totalEntradas - totalSaidas - totalReservas`

```typescript
const [result] = await db.select({
  totalEntradas: ...,
  totalSaidas: ...,
  totalReservas: sql<number>`
    COALESCE(SUM(CASE WHEN type = 'reserva' THEN amount::numeric ELSE 0 END), 0)
  `,
  ...
})

const saldo = totalEntradas - totalSaidas - totalReservas
```

### 2. Hooks de Transações (`src/hooks/use-transactions.ts`)

Atualizado para invalidar queries de reservas quando transações de reserva são modificadas:

```typescript
// Após criar/atualizar/deletar transação
if (variables.type === 'reserva') {
  queryClient.invalidateQueries({ queryKey: ['reserves'] })
}
```

### 3. Transaction Summary (`src/components/transaction-summary.tsx`)

- Agora usa o saldo calculado pelo backend: `const balance = summary.saldo`
- Comentário adicionado explicando que o saldo já considera reservas

### 4. Transaction Form (Já implementado anteriormente)

- Radio button para tipo "reserva" ✅
- Select de reservas ativas quando tipo = "reserva" ✅
- Validação: reserva obrigatória quando tipo = "reserva" ✅

### 5. Transactions Table (Já implementado anteriormente)

- Ícone de carteira (Wallet) para tipo "reserva" ✅
- Cor azul para transações de reserva ✅
- Label "Reserva" ✅

## Validações

### No Schema de Transação

```typescript
.refine(data => {
  // Se o tipo for 'reserva', reserveId é obrigatório
  if (data.type === 'reserva') {
    return !!data.reserveId
  }
  // Se o tipo for 'entrada' ou 'saida', category é obrigatória
  if (data.type === 'entrada' || data.type === 'saida') {
    return !!data.category
  }
  return true
})
```

### No Formulário

- Apenas reservas **ativas** são exibidas no select
- Se não houver reservas ativas, mensagem apropriada é exibida
- Campo de categoria oculto quando tipo = "reserva"
- Campo de reserva exibido apenas quando tipo = "reserva"

## Comportamento em Diferentes Operações

### Criar Transação de Reserva

1. Valida que reserveId está presente
2. Busca a reserva no banco
3. Adiciona valor ao `currentAmount` da reserva
4. Cria a transação
5. Invalida cache de transações e reservas

### Editar Transação

**Cenário 1: De reserva para reserva (mesma ou diferente)**

- Reverte valor da reserva original
- Adiciona valor à nova reserva

**Cenário 2: De entrada/saída para reserva**

- Adiciona valor à reserva selecionada

**Cenário 3: De reserva para entrada/saída**

- Reverte valor da reserva original

### Deletar Transação de Reserva

1. Busca a transação
2. Se tipo = 'reserva', reverte o valor da reserva
3. Deleta a transação
4. Invalida cache

## Exemplo Prático

```typescript
// Estado inicial
Conta: R$ 5.000,00
Reserva "Férias": R$ 0,00

// Ação 1: Criar transação de reserva
{
  type: 'reserva',
  amount: '500',
  reserveId: 'ferias-uuid',
  description: 'Guardando para viagem'
}

// Resultado
Conta: R$ 4.500,00 (5000 - 500)
Reserva "Férias": R$ 500,00 (0 + 500)
Resumo:
  - Entradas: R$ 5.000,00
  - Saídas: R$ 0,00
  - Reservas: R$ 500,00
  - Saldo: R$ 4.500,00 (5000 - 0 - 500)

// Ação 2: Criar saída normal
{
  type: 'saida',
  amount: '200',
  category: 'Alimentação',
  description: 'Supermercado'
}

// Resultado
Conta: R$ 4.300,00 (4500 - 200)
Reserva "Férias": R$ 500,00 (sem alteração)
Resumo:
  - Entradas: R$ 5.000,00
  - Saídas: R$ 200,00
  - Reservas: R$ 500,00
  - Saldo: R$ 4.300,00 (5000 - 200 - 500)
```

## Vantagens desta Abordagem

1. **Clareza Financeira**: Separação clara entre gastos (saídas) e alocações (reservas)
2. **Saldo Realista**: O saldo mostra exatamente quanto dinheiro está disponível para uso
3. **Atomicidade**: Uso de transações do DB garante consistência
4. **Reversibilidade**: Edições e exclusões revertem corretamente os saldos
5. **Cache Inteligente**: Invalidação de queries apenas quando necessário

## Melhorias Futuras

- [ ] Adicionar gráfico mostrando distribuição do saldo (disponível vs. reservado)
- [ ] Permitir transferência entre reservas
- [ ] Validar saldo disponível antes de criar transação de reserva (evitar saldo negativo)
- [ ] Histórico de movimentações por reserva
- [ ] Relatório de performance das reservas (quanto já foi reservado vs. meta)
- [ ] Notificações quando reserva atingir meta
