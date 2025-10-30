# Exemplos de Iniciais nos Avatares

## Como Funciona

Quando um usuário não possui uma imagem de perfil, o avatar exibe as iniciais do nome seguindo estas regras:

### Regras de Extração de Iniciais

1. **Nome com duas ou mais palavras**: Usa a primeira letra da primeira palavra + primeira letra da última palavra
2. **Nome com uma palavra**: Usa apenas a primeira letra
3. **Nome vazio ou inválido**: Mostra o ícone de usuário padrão

## Exemplos

| Nome Completo | Iniciais Exibidas | Descrição |
|--------------|-------------------|-----------|
| João Silva | **JS** | Primeira (João) + Última (Silva) |
| Maria Santos Oliveira | **MO** | Primeira (Maria) + Última (Oliveira) |
| Pedro | **P** | Apenas uma palavra |
| Ana Carolina | **AC** | Primeira (Ana) + Última (Carolina) |
| José da Silva Junior | **JJ** | Primeira (José) + Última (Junior) |
| Carlos Eduardo Souza Lima | **CL** | Primeira (Carlos) + Última (Lima) |
| Fernanda | **F** | Apenas uma palavra |
| "" (vazio) | 👤 | Ícone de usuário padrão |

## Implementação Técnica

```typescript
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(word => word.length > 0)
  
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  
  // Pega a primeira e última palavra
  const firstInitial = words[0].charAt(0).toUpperCase()
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase()
  
  return firstInitial + lastInitial
}
```

## Componentes Atualizados

- ✅ `UserAvatarDisplay` - Avatar de outros usuários nas tabelas
- ✅ `UserAvatar` - Avatar do usuário logado

## Casos de Uso

### 1. Tabela de Transações
```
┌──────────┬──────┬─────────────┐
│ Usuário  │ Tipo │ Descrição   │
├──────────┼──────┼─────────────┤
│   JS     │ 💰   │ Salário     │
│   MO     │ 🛒   │ Compras     │
│   AC     │ 🏠   │ Aluguel     │
└──────────┴──────┴─────────────┘
```

### 2. Tabela de Orçamentos
```
┌──────────────┬───────────┬────────────┐
│ Criado por   │ Categoria │ Orçamento  │
├──────────────┼───────────┼────────────┤
│     PH       │ Alimentos │ R$ 1.000   │
│     LC       │ Transporte│ R$ 500     │
└──────────────┴───────────┴────────────┘
```

## Benefícios

1. **Identificação Rápida**: Duas letras são mais reconhecíveis que uma
2. **Padrão Comum**: Segue convenções de UI/UX modernas (Gmail, Slack, etc.)
3. **Melhor para Nomes Compostos**: Distingue melhor usuários com nomes similares
4. **Profissional**: Aparência mais completa e polida

## Comparação

### Antes (1 letra)
- João Silva → **J**
- José Silva → **J** ❌ (ambos iguais)
- Junior Silva → **J** ❌ (ambos iguais)

### Depois (2 letras)
- João Silva → **JS** ✅
- José Silva → **JS** ✅  
- Junior Silva → **JS** ⚠️ (ainda iguais, mas menos comum)

### Melhor Cenário
- João Silva → **JS** ✅
- José Santos → **JS** ⚠️
- João Oliveira → **JO** ✅ (diferente!)
