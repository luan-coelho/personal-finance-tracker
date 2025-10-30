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

  // Função para extrair iniciais de duas palavras do nome
  const getInitials = (name: string): string => {
    const words = name
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)

    if (words.length === 0) return ''
    if (words.length === 1) return words[0].charAt(0).toUpperCase()

    // Pega a primeira e última palavra
    const firstInitial = words[0].charAt(0).toUpperCase()
    const lastInitial = words[words.length - 1].charAt(0).toUpperCase()

    return firstInitial + lastInitial
  }

  const initials = session.user.name ? getInitials(session.user.name) : ''

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
      <AvatarFallback>{initials || <User className="h-4 w-4" />}</AvatarFallback>
    </Avatar>
  )
}
