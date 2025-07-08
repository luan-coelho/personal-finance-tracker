import { useSpace } from '@/providers/space-provider'

/**
 * Hook para acessar o espaço selecionado globalmente
 * Fornece o espaço atual e funções para trabalhar com ele
 */
export function useSelectedSpace() {
  const { selectedSpace, setSelectedSpace, isLoading } = useSpace()

  return {
    // Espaço atualmente selecionado
    selectedSpace,

    // Função para alterar o espaço selecionado
    setSelectedSpace,

    // Estado de carregamento
    isLoading,

    // ID do espaço selecionado (null se nenhum)
    selectedSpaceId: selectedSpace?.id || null,

    // Nome do espaço selecionado
    selectedSpaceName: selectedSpace?.name || null,

    // Verifica se há um espaço selecionado
    hasSelectedSpace: !!selectedSpace,
  }
}
