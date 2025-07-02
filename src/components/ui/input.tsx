import { AlertCircle } from 'lucide-react'
import * as React from 'react'
import { FieldError } from 'react-hook-form'

import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showValidationIcon?: boolean
  error?: FieldError
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ value, className, type, showValidationIcon = false, error, ...props }, ref) => {
    const hasError = error !== undefined && error !== null

    // Mostrar ícone de erro quando há erro
    const showErrorIcon = showValidationIcon && hasError

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:ring-primary flex h-10 w-full rounded-sm border border-zinc-300 bg-transparent px-3 py-1 text-sm transition-colors outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-sm',
            hasError ? 'border-destructive' : 'dark:border-input border-zinc-300',
            showErrorIcon ? 'pr-10' : '',
            className,
          )}
          value={value}
          ref={ref}
          {...props}
        />
        {showErrorIcon && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <AlertCircle className="text-destructive size-4" />
          </div>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
