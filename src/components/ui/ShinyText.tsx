import React from 'react';

interface ShinyTextProps {
  text: string;
  className?: string;
  variant?: 'gold' | 'silver';
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  className = '',
  variant = 'gold'
}) => {
  const animClass = variant === 'gold' ? 'animate-shiny-gold' : 'animate-shiny-text';

  return (
    <span className={`inline-block font-bold ${animClass} ${className}`}>
      {text}
    </span>
  );
};
