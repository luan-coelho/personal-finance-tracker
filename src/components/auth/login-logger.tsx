'use client'

import { logSuccessfulSignIn } from '@/actions/auth-actions'
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'

/**
 * Componente para detectar e registrar logs de login bem-sucedido
 * Deve ser incluído no layout principal para funcionar em todas as páginas
 */
export function LoginLogger() {
  const { data: session, status } = useSession()
  const hasLoggedRef = useRef(false)

  useEffect(() => {
    // Verificar se é um novo login e ainda não foi registrado
    if (status === 'authenticated' && session && !hasLoggedRef.current) {
      hasLoggedRef.current = true

      // Registrar log de login bem-sucedido
      logSuccessfulSignIn().catch(error => {
        console.error('Erro ao registrar log de login:', error)
      })
    }
  }, [session, status])

  // Componente não renderiza nada visualmente
  return null
}
