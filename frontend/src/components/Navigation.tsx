import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Menu, X, Zap } from 'lucide-react';

export function Navigation() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'games', href: '/games' },
    { key: 'reservations', href: '/reservations' },
    { key: 'contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-xl font-orbitron font-bold">
            <div className="relative">
              <Zap className="w-8 h-8 text-primary animate-pulse-glow" />
              <div className="absolute inset-0 bg-primary/20 blur-md rounded-full"></div>
            </div>
            <span className="text-neon">QuestVault</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className={`font-medium transition-all duration-300 hover:text-primary ${
                  isActive(item.href)
                    ? 'text-primary text-glow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-card border-t border-border animate-slide-in-up">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  className={`px-4 py-2 font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-primary bg-muted rounded-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}