import React, { useRef, useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FrostedGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tag?: string;
  title?: string;
  subtitle?: string;
  href?: string;
  children?: React.ReactNode;
  className?: string;
  showArrow?: boolean;
  spotlightColor?: string;
}

export const FrostedGlassCard: React.FC<FrostedGlassCardProps> = ({
  tag,
  title,
  subtitle,
  href,
  children,
  className = '',
  showArrow = true,
  spotlightColor = 'rgba(240, 204, 78, 0.14)',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isTouch) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const cardContent = (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`frosted-glass-card group p-6 sm:p-7 flex flex-col justify-between ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 75%)`
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full">
        {/* Top Row: Tag Badge & Top-Right Arrow */}
        {(tag || showArrow) && (
          <div className="flex items-center justify-between gap-2 mb-3">
            {tag && (
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[var(--primary)] px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                {tag}
              </span>
            )}
            {showArrow && (
              <ArrowUpRight
                className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ml-auto shrink-0"
                aria-hidden="true"
              />
            )}
          </div>
        )}

        {/* Title & Subtitle */}
        {title && (
          <h3 className="font-display font-bold text-xl sm:text-2xl text-[var(--foreground)] group-hover:text-white transition-colors tracking-tight leading-snug">
            {title}
          </h3>
        )}

        {subtitle && (
          <p className="text-sm text-[var(--foreground)]/80 mt-2 leading-relaxed font-normal">
            {subtitle}
          </p>
        )}

        {/* Custom Nested Children */}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block no-underline focus-visible:outline-none">
        {cardContent}
      </a>
    );
  }

  return cardContent;
};
