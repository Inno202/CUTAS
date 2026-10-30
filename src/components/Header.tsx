import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronDown, Lock, LogOut, Menu, Shield, User as UserIcon, X } from 'lucide-react';
import wordmark from '../assets/images/cutas-wordmark.svg';
import { isAdmin, useAuth } from '../context/AuthContext';
import { navigate } from '../router';
import type { TabId } from '../types';
import { CATEGORY_LABELS, ROLE_LABELS } from '../constants';
import { fullName, initials } from '../utils/format';
import { Avatar } from './Avatar';
import { btnSecondary, Modal, Spinner } from './ui';

interface NavGroupItem {
  id: TabId;
  label: string;
  authRequired?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavGroupItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'about',
    label: 'About',
    items: [
      { id: 'about', label: 'About Us' },
      { id: 'leaders', label: 'Leaders & Admins' },
      { id: 'scholars', label: 'Scholars Directory', authRequired: true },
    ],
  },
  {
    id: 'research',
    label: 'My Research',
    items: [
      { id: 'studies', label: 'Study Details', authRequired: true },
      { id: 'publications', label: 'Publications', authRequired: true },
      { id: 'challenges', label: 'Challenges & Solutions', authRequired: true },
      { id: 'growth', label: 'Growth Plan', authRequired: true },
      { id: 'awards', label: 'Awards', authRequired: true },
    ],
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    items: [
      { id: 'funding', label: 'Funding Available' },
      { id: 'workshops', label: 'Workshops & Seminars' },
    ],
  },
];

const activeGroupOf = (tab: TabId) => NAV_GROUPS.find((g) => g.items.some((i) => i.id === tab))?.id ?? null;

export const Header: React.FC<{ activeTab: TabId }> = ({ activeTab }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState<string | null>(null);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState<string | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const activeGroupId = activeGroupOf(activeTab);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeGroupId) setMobileAccordionOpen(activeGroupId);
  }, [activeGroupId]);

  // Close menus when the page changes.
  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopDropdownOpen(null);
    setAvatarDropdownOpen(false);
  }, [activeTab]);

  // Lock page scroll behind the mobile drawer.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (navContainerRef.current && !navContainerRef.current.contains(target)) setDesktopDropdownOpen(null);
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(target)) setAvatarDropdownOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDesktopDropdownOpen(null);
        setAvatarDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavClick = (tabId: TabId, authRequired?: boolean) => {
    setDesktopDropdownOpen(null);
    setMobileMenuOpen(false);
    if (authRequired && !user) {
      navigate('login', { next: tabId });
      return;
    }
    navigate(tabId);
  };

  const handleLogoutAction = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    setIsLogoutConfirmOpen(false);
    setAvatarDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('landing');
  };

  const roleLine = user
    ? `${ROLE_LABELS[user.role]}${user.role === 'SCHOLAR' ? ` · ${CATEGORY_LABELS[user.category]}` : ''}`
    : '';
  const userInitials = user ? initials(user.firstName, user.lastName, user.username[0]?.toUpperCase()) : '';

  return (
    <>
      <header className="w-full bg-[#255190] text-white shadow-sm sticky top-0 z-40 select-none">
        <div className="h-[6px] w-full bg-[#FDB813]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
            <div className="flex items-center gap-4 xl:gap-6 min-w-0">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('landing');
                }}
                className="flex items-center space-x-3 text-left cursor-pointer group flex-shrink-0 min-w-0"
              >
                <div className="h-9 sm:h-10 rounded-[4px] bg-white px-2.5 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <img src={wordmark} alt="CUTAS" className="h-4 sm:h-5 w-auto" width={92} height={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-semibold text-sm sm:text-base leading-tight tracking-tight truncate">
                    CUT Academic Society
                  </span>
                  <span className="text-[10px] text-white/70 uppercase tracking-wider block mt-0.5 truncate">
                    Central University of Technology
                  </span>
                </div>
              </a>

              <nav ref={navContainerRef} aria-label="Main" className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-xs font-semibold whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleNavClick('landing')}
                  aria-current={activeTab === 'landing' ? 'page' : undefined}
                  className={`px-3 py-2 uppercase tracking-wide transition-colors cursor-pointer border-b-2 ${
                    activeTab === 'landing'
                      ? 'border-[#FDB813] text-white font-bold'
                      : 'border-transparent text-white/90 hover:text-white hover:border-[#FDB813]/60'
                  }`}
                >
                  Home
                </button>

                {NAV_GROUPS.map((group) => {
                  const isGroupActive = activeGroupId === group.id;
                  const isOpen = desktopDropdownOpen === group.id;
                  return (
                    <div key={group.id} className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDesktopDropdownOpen(isOpen ? null : group.id);
                          setAvatarDropdownOpen(false);
                        }}
                        aria-expanded={isOpen}
                        aria-haspopup="menu"
                        className={`px-3 py-2 uppercase tracking-wide transition-colors cursor-pointer flex items-center gap-1 border-b-2 ${
                          isGroupActive
                            ? 'border-[#FDB813] text-white font-bold'
                            : 'border-transparent text-white/90 hover:text-white hover:border-[#FDB813]/60'
                        }`}
                      >
                        <span>{group.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen && (
                        <div role="menu" className="absolute left-0 mt-1 w-60 bg-white rounded-[6px] shadow-lg border border-slate-200 py-1.5 z-50 text-slate-800">
                          {group.items.map((item) => {
                            const isItemActive = activeTab === item.id;
                            const isLocked = item.authRequired && !user;
                            return (
                              <button
                                type="button"
                                role="menuitem"
                                key={item.id}
                                onClick={() => handleNavClick(item.id, item.authRequired)}
                                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                  isItemActive
                                    ? 'bg-blue-50 text-[#255190] font-bold border-l-2 border-[#255190]'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span className="truncate">{item.label}</span>
                                {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400 ml-2 flex-shrink-0" aria-label="Sign in required" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
              {user ? (
                <div ref={avatarDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvatarDropdownOpen(!avatarDropdownOpen);
                      setDesktopDropdownOpen(null);
                    }}
                    className="rounded-full hover:ring-2 hover:ring-white/40 cursor-pointer transition-all active:scale-95"
                    aria-label="Account menu"
                    aria-expanded={avatarDropdownOpen}
                    aria-haspopup="menu"
                  >
                    <Avatar name={fullName(user)} initialsText={userInitials} pictureUrl={user.pictureUrl} size="sm" tone="gold" className="w-10 h-10" />
                  </button>

                  {avatarDropdownOpen && (
                    <div role="menu" className="absolute right-0 mt-2 w-64 bg-white rounded-[6px] shadow-xl border border-slate-200 py-2 text-slate-800 z-50 text-xs">
                      <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/60">
                        <div className="font-bold text-[#255190] text-xs truncate">{fullName(user)}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">{roleLine}</div>
                      </div>
                      <div className="py-1">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => handleNavClick('profile')}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-medium"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-[#255190]" />
                          <span>My Profile</span>
                        </button>
                        {isAdmin(user) && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleNavClick('admin_dashboard')}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-medium"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#255190]" />
                            <span>Administrator Console</span>
                          </button>
                        )}
                      </div>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAvatarDropdownOpen(false);
                          setIsLogoutConfirmOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-red-700 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => navigate('login')}
                    className="h-9 px-4 rounded-[4px] border border-white/60 hover:bg-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('register')}
                    className="h-9 px-4 rounded-[4px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            <div className="lg:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 -mr-2 text-white hover:bg-white/10 rounded-[4px] cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tablet / mobile drawer (< 1024px) */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMobileMenuOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="w-full max-w-sm bg-[#183765] text-white h-[100dvh] flex flex-col shadow-2xl border-l border-white/10"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-[#255190]">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="h-8 rounded-[4px] bg-white px-2 flex items-center justify-center shadow-xs flex-shrink-0">
                    <img src={wordmark} alt="CUTAS" className="h-4 w-auto" width={74} height={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-xs block text-white truncate">CUT Academic Society</span>
                    <span className="text-[10px] text-white/70 block truncate">Central University of Technology</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-white/80 hover:text-white rounded-[4px] hover:bg-white/10 cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav aria-label="Main" className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
                {user && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('profile')}
                    className="w-full p-2.5 rounded-[4px] bg-white/10 hover:bg-white/15 border border-white/10 flex items-center space-x-3 text-left transition-colors cursor-pointer"
                  >
                    <Avatar name={fullName(user)} initialsText={userInitials} pictureUrl={user.pictureUrl} size="sm" tone="gold" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-white truncate">{fullName(user)}</div>
                      <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold truncate">{roleLine}</div>
                    </div>
                  </button>
                )}

                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleNavClick('landing')}
                    className={`w-full text-left px-3 py-3 rounded-[4px] font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                      activeTab === 'landing' ? 'bg-[#FDB813] text-slate-900 font-bold' : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <span>Home</span>
                  </button>

                  {NAV_GROUPS.map((group) => {
                    const isGroupOpen = mobileAccordionOpen === group.id;
                    const hasActiveChild = group.items.some((i) => i.id === activeTab);
                    return (
                      <div key={group.id} className="rounded-[4px] overflow-hidden border border-white/5">
                        <button
                          type="button"
                          onClick={() => setMobileAccordionOpen(isGroupOpen ? null : group.id)}
                          aria-expanded={isGroupOpen}
                          className={`w-full text-left px-3 py-3 flex items-center justify-between font-semibold transition-colors cursor-pointer ${
                            hasActiveChild ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{group.label}</span>
                            {hasActiveChild && <span className="w-1.5 h-1.5 rounded-full bg-[#FDB813]" />}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isGroupOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isGroupOpen && (
                          <div className="bg-black/20 py-1 pl-3 pr-2 space-y-1">
                            {group.items.map((item) => {
                              const isChildActive = activeTab === item.id;
                              const isLocked = item.authRequired && !user;
                              return (
                                <button
                                  type="button"
                                  key={item.id}
                                  onClick={() => handleNavClick(item.id, item.authRequired)}
                                  className={`w-full text-left px-3 py-2.5 rounded-[4px] text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                    isChildActive ? 'bg-[#FDB813] text-slate-900 font-bold' : 'text-white/80 hover:text-white hover:bg-white/10'
                                  }`}
                                >
                                  <span className="truncate">{item.label}</span>
                                  {isLocked && <Lock className="w-3.5 h-3.5 text-white/50 ml-1.5 flex-shrink-0" aria-label="Sign in required" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {user && (
                  <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleNavClick('profile')}
                      className={`w-full text-left px-3 py-3 rounded-[4px] font-semibold transition-colors cursor-pointer flex items-center gap-2.5 ${
                        activeTab === 'profile' ? 'bg-[#FDB813] text-slate-900 font-bold' : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>My Profile</span>
                    </button>
                    {isAdmin(user) && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('admin_dashboard')}
                        className={`w-full text-left px-3 py-3 rounded-[4px] font-semibold transition-colors cursor-pointer flex items-center gap-2.5 ${
                          activeTab === 'admin_dashboard' ? 'bg-[#FDB813] text-slate-900 font-bold' : 'text-white/90 hover:bg-white/10'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Administrator Console</span>
                      </button>
                    )}
                  </div>
                )}
              </nav>

              <div className="p-4 border-t border-white/10 flex-shrink-0 bg-[#142e54] pb-[max(1rem,env(safe-area-inset-bottom))]">
                {user ? (
                  <button
                    type="button"
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-[4px] border border-red-400/40 text-red-300 hover:text-red-200 hover:border-red-400/70 hover:bg-red-950/20 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Log Out</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleNavClick('login')}
                      className="w-full h-11 flex items-center justify-center rounded-[4px] border border-white/60 hover:bg-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('register')}
                      className="w-full h-11 flex items-center justify-center rounded-[4px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <Modal
        open={isLogoutConfirmOpen}
        title={
          <span className="flex items-center gap-2 text-slate-900">
            <AlertCircle className="w-5 h-5 text-red-600" /> Confirm Log Out
          </span>
        }
        onClose={() => setIsLogoutConfirmOpen(false)}
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setIsLogoutConfirmOpen(false)} className={btnSecondary} disabled={loggingOut}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogoutAction}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-[4px] text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              {loggingOut && <Spinner className="w-3.5 h-3.5" />}
              Log Out
            </button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to end your session? You will need your password to sign in again.
        </p>
      </Modal>
    </>
  );
};
