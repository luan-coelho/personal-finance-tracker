'use client'

import { Loader2, Plus } from 'lucide-react'
import { FormEvent, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useCreateOrganizationTask } from '@/hooks/use-organization-tasks'

interface OrganizationQuickCaptureProps {
  spaceId: string
  placeholder?: string
}

export function OrganizationQuickCapture({
  spaceId,
  placeholder = 'Adicionar tarefa compartilhada...',
}: OrganizationQuickCaptureProps) {
  const [title, setTitle] = useState('')
  const createTask = useCreateOrganizationTask()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = title.trim()
    if (!spaceId || !trimmed || createTask.isPending) return

    await createTask.mutateAsync({
      spaceId,
      title: trimmed,
      status: 'pending',
      visibility: 'shared',
      recurrenceType: 'none',
      recurrenceInterval: 1,
      recurrenceDaysOfWeek: [],
      labelIds: [],
    })
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={title}
        onChange={event => setTitle(event.target.value)}
        placeholder={placeholder}
        disabled={createTask.isPending}
        className="h-10 min-w-0 flex-1"
      />
      <Button type="submit" size="icon" disabled={!title.trim() || createTask.isPending} aria-label="Adicionar tarefa">
        {createTask.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
      </Button>
    </form>
  )
}
