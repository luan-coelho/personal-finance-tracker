'use client'

import { useRouter } from 'next/navigation'

import { SpaceForm } from '@/components/space-form'
import { PageHeader } from '@/components/ui/page-header'

import { routes } from '@/lib/routes'

export default function CreateSpacePage() {
  const router = useRouter()

  function handleSuccess() {
    router.push(routes.frontend.admin.spaces.index)
  }

  function handleCancel() {
    router.back()
  }

  return (
    <>
      <PageHeader
        variant="route"
        breadcrumb={[{ label: 'Espaços', href: routes.frontend.admin.spaces.index }]}
        title="Novo espaço"
        description="Crie um espaço para separar as finanças de casa, do trabalho ou da empresa"
      />
      <SpaceForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  )
}
