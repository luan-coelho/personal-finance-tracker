'use client'

import { User } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProps {
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export function UserAvatar({ className, size = 'default' }: UserAvatarProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  const sizeClasses = {
    sm: 'h-6 w-6',
    default: 'h-8 w-8',
    lg: 'h-10 w-10',
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
      <AvatarFallback>
        {session.user.name ? session.user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  )
}
