// src/app/components/Navbar.tsx
import React, { memo, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { LanguageToggle } from '../../components/LanguageToggle';
import {
  Settings,
  LogOut,
  User,
  Home,
  LayoutDashboard,
  CreditCard,
  Send,
  Menu,
  X,
  Loader2,
} from 'lucide-react';

const NavLink = memo(({
  to,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick?: () => void;
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-sm flex items-center gap-1 transition-colors ${
        isActive ? 'text-[#FF7F50]' : 'text-white/70 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
});
NavLink.displayName = 'NavLink';

const MobileNavLink = memo(({
  to,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick?: () => void;
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
        isActive
          ? 'bg-[#FF7F50]/10 text-[#FF7F50]'
          : 'text-white/70 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
});
MobileNavLink.displayName = 'MobileNavLink';

const Navbar = memo(() => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    const result = await logout();
    setIsLoggingOut(false);
    if (result?.success) {
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
  }, [logout, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, protected: true },
    { path: '/cards', label: t('nav.cards'), icon: CreditCard, protected: true },
    { path: '/transfer', label: t('nav.transfer'), icon: Send, protected: true },
    { path: '/settings', label: t('nav.settings'), icon: Settings, protected: true },
  ];

  const filteredLinks = navLinks.filter(link =>
    !link.protected || (link.protected && user)
  );

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <span className="text-[#FF7F50]">Pennywise</span>
            </Link>
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-[#FF7F50] animate-spin" />
              <span className="text-sm text-white/50 hidden sm:inline">
                {t('common.loading')}
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <span className="text-[#FF7F50]">Pennywise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {filteredLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  label={link.label}
                  icon={link.icon}
                  isActive={active}
                />
              );
            })}

            {user ? (
              /* ✅ RTL Fix: ml-4 pl-4 border-l changed to ms-4 ps-4 border-s */
              <div className="flex items-center gap-4 ms-4 ps-4 border-s border-white/10">
                <LanguageToggle />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#FF7F50]/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[#FF7F50]" />
                  </div>
                  <span className="text-sm text-white/70">
                    {user?.user_metadata?.full_name || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-white/70 hover:text-white transition-colors text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  {isLoggingOut ? t('common.loading') : t('nav.logout')}
                </button>
              </div>
            ) : (
              /* ✅ RTL Fix: ml-4 pl-4 border-l changed to ms-4 ps-4 border-s */
              <div className="flex items-center gap-3 ms-4 ps-4 border-s border-white/10">
                <LanguageToggle />
                <Link
                  to="/login"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#FF7F50] hover:bg-[#ff8f66] text-black font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-[0_4px_20px_rgba(255,127,80,0.2)]"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
          <div className="px-4 py-4 space-y-2">
            {filteredLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <MobileNavLink
                  key={link.path}
                  to={link.path}
                  label={link.label}
                  icon={link.icon}
                  isActive={active}
                  onClick={closeMobileMenu}
                />
              );
            })}

            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 border-t border-white/5 mt-2 pt-4">
                  <div className="w-8 h-8 rounded-full bg-[#FF7F50]/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#FF7F50]" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-white/50">{user?.email}</p>
                  </div>
                </div>
                <div className="px-4 pt-2">
                  <LanguageToggle />
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  {isLoggingOut ? t('common.loading') : t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <div className="px-1">
                  <LanguageToggle />
                </div>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-sm bg-[#FF7F50] text-black font-semibold hover:bg-[#ff8f66] transition-all"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;