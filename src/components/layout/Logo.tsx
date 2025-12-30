import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ showText = true, size = 'md', className }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className={cn("flex items-center gap-2 hover:opacity-90 transition-opacity", className)}>
      <div className="relative">
        <GraduationCap className={`${sizeClasses[size]} text-primary`} />
      </div>
      {showText && (
        <span className={`${textClasses[size]} font-bold tracking-tight`}>
          <span className="text-foreground">LiTE</span>
          <span className="text-primary"> Academy</span>
        </span>
      )}
    </Link>
  );
}
