# Configuração Automática do Banco de Dados

Este projeto foi configurado para detectar automaticamente o ambiente e usar a configuração de banco de dados apropriada:

## Ambientes Suportados

### 🔧 Desenvolvimento Local

- **Detecção**: `NODE_ENV=development` ou `NODE_ENV` não definido
- **Banco**: PostgreSQL rodando em container Docker
- **Driver**: `drizzle-orm/node-postgres`
- **URL**: `postgresql://username:password@localhost:5432/database_name`

### 🚀 Produção (Vercel)

- **Detecção**: `NODE_ENV=production`
- **Banco**: Neon Database
- **Driver**: `drizzle-orm/neon-http` com `@neondatabase/serverless`
- **URL**: Neon connection string

## Configuração das Variáveis de Ambiente

### Para Desenvolvimento Local

```bash
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### Para Produção

```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@hostname/database_name?sslmode=require
```

## Como Funciona

O arquivo `src/app/db/index.ts` detecta automaticamente o ambiente através da variável `NODE_ENV` e aplica a configuração apropriada:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined

if (isDevelopment) {
  // Usa drizzle-orm/node-postgres para desenvolvimento
} else {
  // Usa drizzle-orm/neon-http para produção
}
```

## Vantagens

- ✅ Não é necessário comentar/descomentar código manualmente
- ✅ Configuração automática baseada no ambiente
- ✅ Mesma base de código funciona em desenvolvimento e produção
- ✅ Fácil manutenção e deploy

## Scripts NPM

Os scripts já estão configurados com as variáveis de ambiente apropriadas:

```bash
npm run dev        # Desenvolvimento com NODE_ENV implícito
npm run build      # Build para produção
npm run start      # Start em produção
```
