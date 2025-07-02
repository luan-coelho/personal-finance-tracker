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
        create: '/admin/users/novo',
        edit: (id: string) => `/admin/users/${validateId(id)}/editar`,
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
  },
}

export type FrontendRoutes = typeof routes.frontend
export type ApiRoutes = typeof routes.api
