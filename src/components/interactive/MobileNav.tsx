import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { mainNav } from '../../data/navigation';

interface MobileNavProps {
  currentPath?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPath = '/' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    let focusFrame: number | undefined;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      focusFrame = window.requestAnimationFrame(() => {
        drawerRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )?.focus();
      });
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      if (focusFrame !== undefined) window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
        aria-label={isOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        className="min-h-11 min-w-11 flex items-center justify-center p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--border-primary)] transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
      </button>

      {mounted && createPortal(
        <>
          {isOpen && (
            <div
              onClick={closeMenu}
              aria-hidden="true"
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] transition-opacity"
            />
          )}

          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site Navigation"
            aria-hidden={!isOpen}
            hidden={!isOpen}
            style={{ backgroundColor: '#0e121a' }}
            className={`fixed top-0 right-0 bottom-0 w-4/5 max-w-sm border-l border-[var(--border)] z-[9999] p-6 flex flex-col justify-between overscroll-contain shadow-2xl transition-transform duration-300 ease-out ${
              isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <img
                    src="/sam-up-seal.png"
                    alt="SAM-UP seal"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-display font-bold text-sm tracking-wide text-[var(--foreground)]">
                    SAM-UP
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close Navigation Menu"
                  className="min-h-11 min-w-11 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <nav className="mt-5 space-y-1" aria-label="Mobile Main Navigation">
                {mainNav.map((item) => {
                  const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex min-h-11 items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--surface-raised)] text-[var(--primary)] font-semibold border border-[var(--border-primary)]'
                          : 'text-[var(--foreground)] hover:bg-[var(--surface-raised)]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" aria-hidden="true" />
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-[var(--border)]">
              <p className="text-center text-xs text-[var(--muted-foreground)]">
                Est. Nov 27, 1984 • IMSP CAS UPLB
              </p>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
