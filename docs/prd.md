# 🧾 PRD – Aplicativo de Gestão de Finanças Pessoais

### 🎯 Visão Geral

Aplicação web que permite a gestão de finanças pessoais e compartilhadas, com funcionalidades para registro de transações (entradas e saídas), categorização, tags, filtros e visualização gráfica. O sistema também permite a organização das finanças em **espaços distintos** (ex: Casa, Trabalho, Empresa), além de acesso multiusuário para compartilhamento com a esposa ou outros participantes.

---

## ⚙️ Funcionalidades Principais

### 🔐 1. Autenticação e Acesso

- Cadastro e login de usuários.
- Login com Google (via Auth.js).
- Gerenciamento de sessão com cookies seguros.
- Permitir múltiplos usuários por espaço.

### 🧩 2. Espaços (Workspaces)

- Criar e gerenciar múltiplos espaços financeiros: “Casa”, “Empresa”, “Freelancer”, etc.
- Cada espaço possui suas próprias transações, categorias e tags.
- Convite de usuários por e-mail para acessar um espaço específico.

### 💸 3. Transações

- Adição de transações com os campos:
  - Tipo: Entrada ou Saída
  - Valor (decimal)
  - Data
  - Descrição
  - Categoria
  - Tags (múltiplas)

- Vinculação das transações a um espaço.
- Listagem, edição e exclusão de transações.
- Marcação futura para transações recorrentes (mensal, anual, etc).

### 🏷️ 4. Categorias e Tags

- Categorias personalizáveis por espaço.
- Tags livres para uso em filtros.
- Edição e exclusão de categorias e tags.

### 📊 5. Painel e Gráficos

- Gráfico de pizza: despesas por categoria.
- Gráfico de barras: evolução mensal de entradas e saídas.
- Indicadores de saldo total, total de entradas e saídas no período.
- Filtros por:
  - Data (intervalo ou mês)
  - Categoria
  - Tags
  - Tipo (entrada/saída)

### 🤝 6. Acesso Compartilhado

- Permitir que outros usuários participem de um espaço.

### 🧑‍🎨 7. Interface (UI/UX)

- Interface responsiva, limpa e intuitiva.
- Utilização de TailwindCSS + shadcn/ui.
- Dark Mode.
- Dashboard acessível e amigável.

---

## 🧪 Stack Técnica

| Camada         | Tecnologia               |
| -------------- | ------------------------ |
| Framework      | Next.js (App Router)     |
| ORM            | Drizzle ORM              |
| Banco de Dados | PostgreSQL (Neon)        |
| Autenticação   | NextAuth.js (com Google) |
| UI             | TailwindCSS + shadcn/ui  |
| Gráficos       | Recharts ou Chart.js     |
| Deploy         | Vercel                   |

---

## 📋 Tarefas (Backlog por Módulo)

### 🔐 Autenticação

- [x] Configurar NextAuth (Google e Email/Senha)
- [x] Criar modelo `User`

### 🧩 Espaços

- [x] Criar modelo `Space`
- [x] Página de criação/edição de espaços
- [x] Listagem e troca entre espaços ativos

### 💳 Transações

- [x] Criar modelo `Transaction`
- [x] Formulário de criação/edição
- [x] CRUD completo com validação (Zod)
- [x] Paginação e ordenação por data
- [x] Conectar transações ao espaço ativo

### 🏷️ Categorias e Tags

- [x] Criar modelos `Category`, `Tag`
- [x] Interface de gerenciamento (CRUD)
- [x] Filtros por categoria e tags

### 📊 Gráficos e Dashboard

- [ ] API para totais e saldo
- [ ] Gráfico de pizza (despesas por categoria)
- [ ] Gráfico de barras (mensal)
- [ ] Painel com indicadores de saldo e filtros

### 🤝 Multiusuário

- [ ] Convite de usuários por e-mail
- [ ] Tela de gerenciamento de membros por espaço

### 🛠️ Infraestrutura e DevOps

- [ ] Scripts de seed (categorias padrão)
