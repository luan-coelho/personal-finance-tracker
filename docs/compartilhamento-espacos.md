# Funcionalidade de Compartilhamento de Espaços

## Visão Geral

Esta funcionalidade permite que usuários compartilhem seus espaços financeiros com outros usuários, permitindo colaboração na gestão de transações.

## Papéis de Membros

O sistema implementa três papéis diferentes para membros de espaços:

### 1. **Owner (Proprietário)**

- É o criador original do espaço
- Tem controle total sobre o espaço
- Pode adicionar/remover membros
- Pode alterar papéis de outros membros
- Pode editar e excluir o espaço
- Pode criar, editar e excluir transações

### 2. **Editor**

- Pode visualizar o espaço e todas as transações
- Pode criar novas transações
- Pode editar e excluir transações
- **NÃO** pode editar/excluir o espaço
- **NÃO** pode gerenciar membros

### 3. **Viewer (Visualizador)**

- Pode apenas visualizar o espaço e transações
- **NÃO** pode criar, editar ou excluir transações
- **NÃO** pode editar/excluir o espaço
- **NÃO** pode gerenciar membros

## Estrutura do Banco de Dados

### Tabela: `space_members`

```sql
CREATE TABLE space_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role member_role DEFAULT 'editor' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP
);

CREATE TYPE member_role AS ENUM ('owner', 'editor', 'viewer');
```

### Relacionamentos

- Um espaço pode ter múltiplos membros
- Um usuário pode ser membro de múltiplos espaços
- O proprietário é armazenado tanto em `spaces.owner_id` quanto potencialmente em `space_members`

## APIs

### Listar Membros

```
GET /api/spaces/[id]/members
```

Retorna todos os membros de um espaço (requer acesso ao espaço).

**Resposta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "spaceId": "uuid",
      "userId": "uuid",
      "role": "editor",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": null,
      "user": {
        "id": "uuid",
        "name": "Nome do Usuário",
        "email": "email@example.com"
      }
    }
  ]
}
```

### Adicionar Membro

```
POST /api/spaces/[id]/members
```

Adiciona um novo membro ao espaço (requer ser proprietário).

**Request Body:**

```json
{
  "userId": "uuid",
  "role": "editor" // ou "viewer"
}
```

### Atualizar Papel do Membro

```
PUT /api/spaces/[id]/members/[memberId]
```

Atualiza o papel de um membro (requer ser proprietário).

**Request Body:**

```json
{
  "role": "viewer" // ou "editor"
}
```

### Remover Membro

```
DELETE /api/spaces/[id]/members/[memberId]
```

Remove um membro do espaço (requer ser proprietário).

## Componentes UI

### `SpaceMembersTable`

Componente principal para gerenciar membros de um espaço.

**Props:**

- `spaceId: string` - ID do espaço
- `isOwner: boolean` - Se o usuário atual é proprietário

**Funcionalidades:**

- Lista todos os membros
- Adiciona novos membros (se for proprietário)
- Altera papéis de membros (se for proprietário)
- Remove membros (se for proprietário)

### Página de Gerenciamento

```
/admin/spaces/[id]/members
```

Página dedicada para gerenciar membros de um espaço específico.

## Verificação de Acesso

### Função: `checkSpaceAccess`

Localização: `/src/lib/space-access.ts`

Verifica se um usuário tem acesso a um espaço e retorna informações sobre o acesso.

```typescript
interface SpaceAccessResult {
  hasAccess: boolean
  isOwner: boolean
  role?: MemberRole
  space?: Space
}
```

### Funções Auxiliares

- `canEditSpace(userEmail, spaceId)` - Verifica se pode editar (proprietário ou editor)
- `canViewSpace(userEmail, spaceId)` - Verifica se pode visualizar (qualquer acesso)

## Fluxo de Uso

### 1. Compartilhar um Espaço

1. Proprietário acessa a página de Espaços
2. Clica no menu ações (⋮) do espaço desejado
3. Seleciona "Membros"
4. Clica em "Adicionar Membro"
5. Seleciona o usuário e define o papel
6. Confirma a adição

### 2. Gerenciar Membros

1. Proprietário acessa a página de membros
2. Pode alterar o papel de um membro usando o dropdown
3. Pode remover um membro clicando no menu ações

### 3. Acessar Espaço Compartilhado

1. Usuário vê o espaço compartilhado na lista de espaços
2. Pode acessar e ver transações
3. Se for Editor, pode criar/editar transações
4. Se for Viewer, apenas visualiza

## Segurança

### Validações Implementadas

1. **API de Membros:** Verifica se o usuário é proprietário antes de permitir adicionar/remover membros
2. **API de Transações:** Verifica se o usuário tem papel de Editor ou Owner antes de permitir criar/editar
3. **API de Espaços:** Verifica se o usuário tem acesso (qualquer papel) antes de exibir dados
4. **Cascade Delete:** Quando um espaço é excluído, todos os membros são removidos automaticamente
5. **Cascade Delete:** Quando um usuário é excluído, todas as suas associações como membro são removidas

## Melhorias Futuras

### Possíveis Implementações

1. **Convites por Email:** Enviar convites para usuários que ainda não estão na plataforma
2. **Notificações:** Notificar usuários quando forem adicionados a um espaço
3. **Logs de Auditoria:** Registrar todas as ações de membros em espaços compartilhados
4. **Links de Compartilhamento:** Gerar links únicos para compartilhar espaços
5. **Permissões Granulares:** Permitir configurar permissões específicas (ex: pode ver apenas certas categorias)
6. **Limite de Membros:** Implementar limite de membros por espaço baseado no plano do usuário
7. **Histórico de Atividades:** Mostrar quem criou/editou cada transação

## Testes

### Cenários de Teste

1. ✅ Proprietário pode adicionar membros
2. ✅ Proprietário pode remover membros
3. ✅ Proprietário pode alterar papéis
4. ✅ Editor pode criar transações
5. ✅ Editor NÃO pode gerenciar membros
6. ✅ Viewer pode visualizar transações
7. ✅ Viewer NÃO pode criar/editar transações
8. ✅ Usuário sem acesso NÃO vê o espaço
9. ✅ Membro vê espaço compartilhado na lista
10. ✅ Exclusão de espaço remove todos os membros

## Migration

A migration foi gerada automaticamente pelo Drizzle ORM:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

Arquivo: `drizzle/0004_curved_moondragon.sql`

## Dependências

- `drizzle-orm` - ORM para TypeScript
- `@tanstack/react-query` - Gerenciamento de estado assíncrono
- `sonner` - Notificações toast
- `lucide-react` - Ícones
- `shadcn/ui` - Componentes UI

## Exemplo de Uso

```typescript
// Hook para listar membros
const { data: members } = useSpaceMembers(spaceId)

// Hook para adicionar membro
const addMember = useAddSpaceMember(spaceId)
await addMember.mutateAsync({
  userId: 'user-uuid',
  role: 'editor',
})

// Hook para verificar acesso
const access = await checkSpaceAccess(userEmail, spaceId)
if (access.isOwner) {
  // Permitir ações de proprietário
}
```
