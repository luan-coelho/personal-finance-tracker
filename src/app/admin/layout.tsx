import { cookies } from 'next/headers'

import { AppLayout } from '@/components/layout/app-layout'

// Mesmo nome usado em `src/components/ui/sidebar.tsx` para persistir o estado da sidebar.
const SIDEBAR_COOKIE_NAME = 'sidebar_state'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== 'false'

  return <AppLayout defaultOpen={defaultOpen}>{children}</AppLayout>
}
