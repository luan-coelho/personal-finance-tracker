// Tipos para melhor suporte TypeScript
export type RouteParams = Record<string, string | number>

/**
 * Rotas centralizadas da aplicação
 *
 * Este arquivo centraliza todas as rotas da aplicação (frontend e API) para facilitar
 * manutenção e refatoração. Sempre use estas rotas em vez de strings hardcoded.
 */

// Função utilitária para validar IDs
const validateId = (id: string): string => {
  if (!id || id.trim() === '') {
    throw new Error('ID é obrigatório')
  }
  return id.trim()
}

export const routes = {
  // Rotas do Frontend (páginas)
  frontend: {
    home: '/',
    admin: {
      index: '/admin',
      settings: '/admin/settings',
      users: {
        index: '/admin/users',
      },
      transactions: {
        index: '/admin/transactions',
        create: '/admin/transactions/new',
        edit: (id: string) => `/admin/transactions/${validateId(id)}/edit`,
      },
      categories: {
        index: '/admin/categories',
      },
      tags: {
        index: '/admin/tags',
      },
      spaces: {
        index: '/admin/spaces',
        create: '/admin/spaces/new',
        edit: (id: string) => `/admin/spaces/${validateId(id)}/edit`,
        members: (id: string) => `/admin/spaces/${validateId(id)}/members`,
      },
      reserves: {
        index: '/admin/reserves',
        bySpace: (spaceId: string) => `/admin/reserves?spaceId=${validateId(spaceId)}`,
        create: '/admin/reserves/new',
        edit: (id: string) => `/admin/reserves/${validateId(id)}/edit`,
        movements: (id: string) => `/admin/reserves/${validateId(id)}/movements`,
      },
      budgets: {
        index: '/admin/budgets',
        create: '/admin/budgets/new',
        edit: (id: string) => `/admin/budgets/${validateId(id)}/edit`,
        bySpace: (spaceId: string) => `/admin/budgets?spaceId=${validateId(spaceId)}`,
      },
    },

    // Autenticação
    auth: {
      signIn: '/auth/signin',
    },
  },

  // Rotas da API (backend)
  api: {
    users: {
      base: '/api/users',
      byId: (id: string) => `/api/users/${validateId(id)}`,
    },
    spaces: {
      base: '/api/spaces',
      byId: (id: string) => `/api/spaces/${validateId(id)}`,
    },
    reserves: {
      base: '/api/reserves',
      byId: (id: string) => `/api/reserves/${validateId(id)}`,
      bySpace: (spaceId: string) => `/api/reserves?spaceId=${validateId(spaceId)}`,
      movements: (reserveId: string) => `/api/reserves/${validateId(reserveId)}/movements`,
    },
    budgets: {
      base: '/api/budgets',
      byId: (id: string) => `/api/budgets/${validateId(id)}`,
      withSpending: (spaceId: string, month: string) =>
        `/api/budgets/with-spending?spaceId=${validateId(spaceId)}&month=${month}`,
      summary: (spaceId: string, month: string) => `/api/budgets/summary?spaceId=${validateId(spaceId)}&month=${month}`,
      categories: (spaceId: string, month: string) =>
        `/api/budgets/categories?spaceId=${validateId(spaceId)}&month=${month}`,
    },
  },
}

export type FrontendRoutes = typeof routes.frontend
export type ApiRoutes = typeof routes.api
