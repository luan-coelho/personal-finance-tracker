'use client'

import { User } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface UserAvatarDisplayProps {
  user?: {
    id: string
    name: string
    email: string
    image: string | null
  }
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showTooltip?: boolean
}

export function UserAvatarDisplay({ user, size = 'default', className, showTooltip = true }: UserAvatarDisplayProps) {
  if (!user) {
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

  const initials = getInitials(user.name)

  const avatar = (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      <AvatarImage src={user.image || ''} alt={user.name} />
      <AvatarFallback className="text-xs">{initials || <User className="h-3 w-3" />}</AvatarFallback>
    </Avatar>
  )

  if (!showTooltip) {
    return avatar
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-semibold">{user.name}</p>
            <p className="text-muted-foreground text-xs">{user.email}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
