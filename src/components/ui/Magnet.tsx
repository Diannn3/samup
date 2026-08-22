import React, { useRef, useState, useEffect } from 'react';

// Source inspiration (Magnet):
// @url:`https://reactbits.dev/components/magnet`
// Repository: @url:`https://github.com/DavidHDev/react-bits`
// Adapted for SAM-UP; preserve applicable license notice (MIT + Commons Clause):
// https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md
// SAM-UP policy: primary CTA anchors only (hero + one membership CTA).
// Disabled — leaving a fully usable static anchor — on touch pointers and
// prefers-reduced-motion, with live media-query change listeners.

interface MagnetProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const Magnet: React.FC<MagnetProps> = ({
  children,
  className = '',
  strength = 18
}) => {
  const magnetRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const coarseMq = window.matchMedia('(pointer: coarse)');
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => setIsDisabled(coarseMq.matches || reducedMq.matches);
    sync();

    coarseMq.addEventListener('change', sync);
    reducedMq.addEventListener('change', sync);
    return () => {
      coarseMq.removeEventListener('change', sync);
      reducedMq.removeEventListener('change', sync);
    };
  }, []);

  // Re-center immediately if the media state flips while displaced.
  useEffect(() => {
    if (isDisabled) setPosition({ x: 0, y: 0 });
  }, [isDisabled]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!magnetRef.current || isDisabled) return;
    const rect = magnetRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    setPosition({
      x: (distanceX / (rect.width / 2)) * strength,
      y: (distanceY / (rect.height / 2)) * strength
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={magnetRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: position.x === 0 && position.y === 0 ? 'transform 0.5s ease-out' : 'transform 0.15s ease-out'
      }}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};
