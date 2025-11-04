# Script de Seed de Categorias

Este script cria categorias padrão de entrada e saída para um espaço específico.

## Categorias de Entrada (12)

- Salário
- Freelance
- Investimentos
- Dividendos
- Aluguel Recebido
- Bonificação
- Prêmio
- Reembolso
- Venda
- Mesada
- Doação Recebida
- Outros Recebimentos

## Categorias de Saída (34)

- Alimentação
- Transporte
- Moradia
- Aluguel
- Contas de Casa
- Energia Elétrica
- Água
- Internet
- Telefone
- Saúde
- Medicamentos
- Plano de Saúde
- Educação
- Lazer
- Vestuário
- Beleza
- Assinaturas
- Streaming
- Academia
- Mercado
- Restaurante
- Combustível
- Estacionamento
- Transporte Público
- Viagem
- Pet
- Impostos
- Seguros
- Manutenção
- Doação
- Presentes
- Empréstimo
- Cartão de Crédito
- Outros Gastos

## Como usar

### Opção 1: Com spaceId específico

```bash
pnpm db:seed:categories <spaceId>
```

Exemplo:

```bash
pnpm db:seed:categories 123e4567-e89b-12d3-a456-426614174000
```

### Opção 2: Sem spaceId (usa o primeiro espaço encontrado)

```bash
pnpm db:seed:categories
```

## Comportamento

- ✅ **Evita duplicatas**: Verifica se a categoria já existe antes de criar
- 📊 **Relatório detalhado**: Mostra quantas categorias foram criadas e quantas já existiam
- 🔍 **Validação**: Verifica se o espaço existe antes de criar as categorias
- ⚡ **Idempotente**: Pode ser executado múltiplas vezes sem criar duplicatas

## Exemplos de saída

```
🌱 Iniciando seed de categorias...

✅ Usando espaço: Meu Espaço (123e4567-e89b-12d3-a456-426614174000)

📍 Space ID: 123e4567-e89b-12d3-a456-426614174000

📝 Criando categorias...

✅ Criada: Salário (entrada)
✅ Criada: Freelance (entrada)
⏭️  Pulando: Alimentação (saida) - já existe
...

============================================================
🎉 Seed concluído com sucesso!
============================================================
📊 Resumo:
   • Categorias criadas: 44
   • Categorias puladas: 2
   • Total de categorias: 46
   • Categorias de entrada: 12
   • Categorias de saída: 34
============================================================
```

## Notas

- O script requer que pelo menos um espaço exista no banco de dados
- As categorias são criadas com timestamps atuais
- Categorias com o mesmo nome e tipo não serão duplicadas
