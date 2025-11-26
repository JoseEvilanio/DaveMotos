import { ButtonHTMLAttributes, ReactNode } from 'react'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  iconPosition?: 'left' | 'right'
}

export default function PrimaryButton({
  label,
  onClick,
  size = 'md',
  icon,
  variant = 'primary',
  loading = false,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}: PrimaryButtonProps) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger'
  }
  const sizeText = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  const disabledClasses = 'opacity-50 cursor-not-allowed'

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        btn inline-flex items-center justify-center gap-2
        ${sizeText[size]}
        ${variantClasses[variant]}
        ${(disabled || loading) ? disabledClasses : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {iconPosition === 'left' && icon && !loading && icon}
      {label}
      {iconPosition === 'right' && icon && !loading && icon}
    </button>
  )
}
