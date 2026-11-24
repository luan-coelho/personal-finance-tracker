'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icon } from '@/components/ui/icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

export type UserAvatarSize = 'sm' | 'default' | 'lg'

/** Radar Avatar: 24 (10px), 32 `control-sm` (12px), 36 na conta da sidebar (12px). */
export const userAvatarSizeClasses: Record<UserAvatarSize, string> = {
  sm: 'size-6 text-[10px]',
  default: 'size-control-sm text-xs',
  lg: 'size-9 text-xs',
}

/** Duas iniciais: primeira e última palavra do nome. */
export function getInitials(name?: string | null): string {
  const words = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)

  if (words.length === 0) return ''
  if (words.length === 1) return words[0].charAt(0).toUpperCase()

  return words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase()
}

interface UserAvatarDisplayProps {
  user?: {
    id: string
    name: string
    email: string
    image: string | null
  }
  size?: UserAvatarSize
  className?: string
  showTooltip?: boolean
}

export function UserAvatarDisplay({ user, size = 'default', className, showTooltip = true }: UserAvatarDisplayProps) {
  if (!user) {
    return null
  }

  const initials = getInitials(user.name)

  const avatar = (
    <Avatar className={cn('rounded-full', userAvatarSizeClasses[size], className)}>
      <AvatarImage src={user.image || undefined} alt={user.name} className="object-cover" />
      <AvatarFallback className="bg-primary-soft text-primary-soft-fg rounded-full leading-none font-semibold">
        {initials || <Icon name="user" size={size === 'sm' ? 12 : 16} />}
      </AvatarFallback>
    </Avatar>
  )

  if (!showTooltip) {
    return avatar
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col">
          <span className="font-semibold">{user.name}</span>
          <span className="text-xs">{user.email}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
