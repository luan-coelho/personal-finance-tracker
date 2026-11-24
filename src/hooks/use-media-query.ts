import { useEffect, useState } from 'react'

/**
 * Acompanha uma media query no cliente. No servidor (e na hidratação) vale `false`; use só para
 * comportamento (qual consulta fazer), nunca para decidir o que renderizar — isso é com CSS.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Abaixo de `md` (768px): listas em `ListItem` e "Carregar mais" no lugar da paginação. */
export const PHONE_QUERY = '(max-width: 767.98px)'
