import Image from 'next/image'

interface JRGamesLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function JRGamesLogo({ className = '', size = 'md' }: JRGamesLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto', 
    lg: 'h-16 w-auto'
  }

  return (
    <div className={`${className}`}>
      <Image
        src="/jnr_2024_logo.png"
        alt="J&R Games Logo"
        width={200}
        height={64}
        className={`${sizeClasses[size]} object-contain`}
        priority
      />
    </div>
  )
}
