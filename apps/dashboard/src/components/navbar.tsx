'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { WalletDropdown } from '@/components/wallet-dropdown';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDocsPage = pathname?.startsWith('/docs');

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo - always visible */}
        <Link href="/" className="flex items-center gap-2.5" onClick={closeMobileMenu}>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">OpenFacilitator</span>
        </Link>

        {/* Desktop nav - hidden on mobile */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/docs"
            className={`text-sm transition-colors ${
              isDocsPage
                ? 'text-gray-900 dark:text-gray-100 font-medium'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            Docs
          </Link>
          <a
            href="https://github.com/rawgroundbeef/openfacilitator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            GitHub
          </a>

          <ThemeToggle />

          {/* Auth-aware section */}
          {isLoading ? (
            <div className="w-20 h-8 bg-muted rounded animate-pulse" />
          ) : isAuthenticated ? (
            <WalletDropdown />
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger - visible on mobile only */}
        <button
          className="md:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu - slides down when open */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link
              href="/docs"
              className={`block px-3 py-3 rounded-lg text-sm transition-colors ${
                isDocsPage
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-muted dark:text-gray-400 dark:hover:text-gray-100'
              }`}
              onClick={closeMobileMenu}
            >
              Docs
            </Link>
            <a
              href="https://github.com/rawgroundbeef/openfacilitator"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-3 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-muted dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              onClick={closeMobileMenu}
            >
              GitHub
            </a>
            
            <div className="flex items-center justify-between px-3 py-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
              <ThemeToggle />
            </div>

            <div className="pt-2 border-t border-border/50">
              {isLoading ? (
                <div className="px-3 py-3">
                  <div className="w-full h-10 bg-muted rounded animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <div className="px-3 py-3">
                  <WalletDropdown />
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-3 py-3 rounded-lg text-sm text-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
