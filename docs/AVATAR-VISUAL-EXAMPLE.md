# Exemplo Visual - Avatares nas Tabelas

## 📊 Tabela de Transações

```
┌────────────┬──────────┬──────────────────────┬─────────────┬──────────────┬────────────┬─────────────┐
│  Usuário   │   Tipo   │      Descrição       │  Categoria  │     Tags     │    Data    │    Valor    │
├────────────┼──────────┼──────────────────────┼─────────────┼──────────────┼────────────┼─────────────┤
│    JS 💬   │ 💰 Entrada│ Salário Mensal      │ Salário     │ -            │ 01/10/2025 │ +R$ 5.000,00│
│    MO 💬   │ 🛒 Saída │ Supermercado Carrefour│ Alimentação │ mercado      │ 02/10/2025 │ -R$ 450,00  │
│    AC 💬   │ 🏠 Saída │ Aluguel Apartamento  │ Moradia     │ fixo         │ 05/10/2025 │ -R$ 1.200,00│
│    JS 💬   │ 🚗 Saída │ Combustível Posto BR │ Transporte  │ gasolina     │ 07/10/2025 │ -R$ 280,00  │
│    PH 💬   │ 💰 Entrada│ Freelance Design     │ Freelance   │ extra        │ 10/10/2025 │ +R$ 1.500,00│
└────────────┴──────────┴──────────────────────┴─────────────┴──────────────┴────────────┴─────────────┘

Legenda:
💬 = Ao passar o mouse, mostra tooltip com nome completo e email
JS = João Silva
MO = Maria Oliveira
AC = Ana Carolina
PH = Pedro Henrique
```

## 💰 Tabela de Orçamentos

```
┌──────────────┬─────────────┬──────┬──────────┬──────────┬──────────┬──────────────┬──────────┐
│ Criado por   │  Categoria  │  Mês │ Orçamento│  Gasto   │ Restante │  Progresso   │  Status  │
├──────────────┼─────────────┼──────┼──────────┼──────────┼──────────┼──────────────┼──────────┤
│    JS 💬     │ Alimentação │ 10/25│ R$ 1.000 │ R$ 850   │ R$ 150   │ ████████░░ 85%│ ⚠️ Atenção│
│    MO 💬     │ Transporte  │ 10/25│ R$ 500   │ R$ 320   │ R$ 180   │ ██████░░░░ 64%│ ✅ Normal │
│    AC 💬     │ Lazer       │ 10/25│ R$ 300   │ R$ 350   │-R$ 50    │ ██████████105%│ 🔴 Excedido│
│    PH 💬     │ Educação    │ 10/25│ R$ 800   │ R$ 450   │ R$ 350   │ █████░░░░░ 56%│ ✅ Normal │
└──────────────┴─────────────┴──────┴──────────┴──────────┴──────────┴──────────────┴──────────┘
```

## 🎨 Aparência dos Avatares

### Com Imagem

```
┌─────────────┐
│  ┌───────┐  │
│  │ 📷    │  │  ← Foto do usuário
│  │  👤   │  │
│  └───────┘  │
└─────────────┘
```

### Sem Imagem (Fallback com Iniciais)

```
┌─────────────┐
│  ┌───────┐  │
│  │  JS   │  │  ← Iniciais em texto
│  │       │  │     (fundo colorido)
│  └───────┘  │
└─────────────┘
```

### Tooltip ao Passar o Mouse

```
      ┌─────────────────────────┐
      │ João Silva              │  ← Nome completo
      │ joao.silva@email.com    │  ← Email
      └─────────────────────────┘
            ↓
        ┌───────┐
        │  JS   │  ← Avatar
        └───────┘
```

## 📱 Responsividade - Tamanhos

### Small (sm) - 24x24px

```
┌──────┐
│  JS  │  ← Usado em tabelas compactas
└──────┘
```

### Default - 32x32px

```
┌────────┐
│   JS   │  ← Padrão para tabelas normais
└────────┘
```

### Large (lg) - 40x40px

```
┌──────────┐
│    JS    │  ← Usado em headers, perfis
└──────────┘
```

## 🎯 Casos Práticos

### Espaço Individual (só o proprietário)

```
Todas as transações mostram o mesmo avatar (do proprietário)
┌──────────┬─────────────────┐
│ Usuário  │ Descrição       │
├──────────┼─────────────────┤
│   JS     │ Salário         │
│   JS     │ Mercado         │
│   JS     │ Combustível     │
└──────────┴─────────────────┘
```

### Espaço Compartilhado (múltiplos membros)

```
Cada transação mostra quem a criou
┌──────────┬─────────────────┐
│ Usuário  │ Descrição       │
├──────────┼─────────────────┤
│   JS     │ Salário João    │
│   MO     │ Compras Maria   │
│   AC     │ Aluguel (Ana)   │
│   JS     │ Gasolina João   │
└──────────┴─────────────────┘
```

## 💡 Benefícios Visuais

1. **Identificação Rápida**: Cores e letras diferentes para cada pessoa
2. **Escaneabilidade**: Fácil visualizar quem fez o quê
3. **Profissional**: Aparência moderna e polida
4. **Acessível**: Funciona com e sem imagens

## 🔄 Comparação: Antes vs Depois

### ANTES

```
┌─────────────────────────────┐
│ Descrição       │ Valor     │  ← Sem informação do usuário
├─────────────────┼───────────┤
│ Salário         │ +R$ 5.000 │
│ Mercado         │ -R$ 450   │
│ Aluguel         │ -R$ 1.200 │
└─────────────────┴───────────┘
```

### DEPOIS

```
┌──────────┬─────────────────┬───────────┐
│ Usuário  │ Descrição       │ Valor     │  ← Com avatar!
├──────────┼─────────────────┼───────────┤
│   JS 💬  │ Salário         │ +R$ 5.000 │
│   MO 💬  │ Mercado         │ -R$ 450   │
│   AC 💬  │ Aluguel         │ -R$ 1.200 │
└──────────┴─────────────────┴───────────┘
```
