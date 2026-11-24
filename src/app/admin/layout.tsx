import { AppLayout } from '@/components/layout/app-layout'

/**
 * Sem APIs dinâmicas (`cookies()`, `headers()`): as telas do admin são client components que buscam
 * dados pelo React Query, então o layout fica estático. Assim o Next pré-carrega a rota inteira e a
 * guarda no cache do roteador, e a navegação não espera o servidor nem mostra o `loading.tsx`.
 * O estado da sidebar (recolhida ou expandida) é lido do cookie no navegador, em `SidebarProvider`.
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AppLayout>{children}</AppLayout>
}
