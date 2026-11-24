'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Icon } from '@/components/ui/icon'
import { getInitials, type UserAvatarSize, userAvatarSizeClasses } from '@/components/user-avatar-display'

import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  className?: string
  size?: UserAvatarSize
}

/** Avatar de iniciais do usuário logado, em `primary-soft` (conta da sidebar). */
export function UserAvatar({ className, size = 'default' }: UserAvatarProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  const initials = getInitials(session.user.name)

  return (
    <Avatar className={cn('rounded-full', userAvatarSizeClasses[size], className)}>
      <AvatarFallback className="bg-primary-soft text-primary-soft-fg rounded-full leading-none font-semibold">
        {initials || <Icon name="user" size={16} />}
      </AvatarFallback>
    </Avatar>
  )
}
