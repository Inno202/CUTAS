import React, { useState, useEffect, useRef } from 'react';
import { User, TabId } from '../types';
import crestImage from '../assets/images/cutas_society_crest_1792291983112.jpg';
import { 
  Menu, X, Shield, LogOut, ChevronDown, Lock, User as UserIcon,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  users: User[];
  onSwitchUser: (userId: string | null) => void;
  onNavigateLogin?: (returnTab?: TabId) => void;
  onNavigateRegister?: () => void;
  onNavigateProfile?: () => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onOpenChangePassword?: () => void;
  onOpenDeleteAccount?: () => void;
}

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

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  users,
  onSwitchUser,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateProfile,
}) => {
  // Mobile drawer open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop active dropdown state: 'about' | 'research' | 'opportunities' | null
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState<string | null>(null);

  // Desktop avatar dropdown
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);

  // Switch role submenu inside avatar dropdown
  const [switchRoleSubmenuOpen, setSwitchRoleSubmenuOpen] = useState(false);

  // Mobile accordion state (which group is expanded: 'about' | 'research' | 'opportunities' | null)
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState<string | null>(null);

  // Logout confirmation modal
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Nav Groups definition
  const navGroups: NavGroup[] = [
    {
      id: 'about',
      label: 'About',
      items: [
        { id: 'about', label: 'About Us' },
        { id: 'leaders', label: 'Leaders & Admins' },
        { id: 'scholars', label: 'Scholars Directory' },
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

  // Helper to determine which group owns the active tab
  const getActiveGroupId = (tab: TabId): string | null => {
    for (const group of navGroups) {
      if (group.items.some(item => item.id === tab)) {
        return group.id;
      }
    }
    return null;
  };

  const activeGroupId = getActiveGroupId(activeTab);

  // Expand the active group accordion by default on mobile
  useEffect(() => {
    if (activeGroupId) {
      setMobileAccordionOpen(activeGroupId);
    }
  }, [activeGroupId]);

  // Click outside listener for desktop dropdowns
  const navContainerRef = useRef<HTMLDivElement>(null);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (navContainerRef.current && !navContainerRef.current.contains(target)) {
        setDesktopDropdownOpen(null);
      }
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(target)) {
        setAvatarDropdownOpen(false);
        setSwitchRoleSubmenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDesktopDropdownOpen(null);
        setAvatarDropdownOpen(false);
        setSwitchRoleSubmenuOpen(false);
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

    if (authRequired && !currentUser) {
      if (onNavigateLogin) {
        onNavigateLogin(tabId);
      } else {
        setActiveTab('login');
      }
      return;
    }

    setActiveTab(tabId);
  };

  const handleLogoutAction = () => {
    setIsLogoutConfirmOpen(false);
    setAvatarDropdownOpen(false);
    setMobileMenuOpen(false);
    onSwitchUser(null);
    setActiveTab('landing');
  };

  return (
    <>
      <header className="w-full bg-[#255190] text-white shadow-sm sticky top-0 z-40 select-none">
        {/* Top Strip: 6px accent strip */}
        <div className="h-[6px] w-full bg-[#FDB813]" />

        {/* Level 1: Desktop Utility Row (small, uppercase, letter-spaced, dividers using --cut-line) */}
        <div className="hidden lg:block border-b border-white/20 text-[11px] uppercase tracking-wider font-semibold">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-white/90">
            <div className="text-[10px] text-white/70 tracking-normal normal-case">
              Central University of Technology, Free State · Academic Society Portal
            </div>

            <div className="flex items-center space-x-3 text-white">
              {currentUser ? (
                <>
                  <button
                    onClick={() => {
                      if (onNavigateProfile) onNavigateProfile();
                      else setActiveTab('profile');
                    }}
                    className={`hover:text-[#FDB813] transition-colors cursor-pointer flex items-center gap-1 ${
                      activeTab === 'profile' ? 'text-[#FDB813]' : ''
                    }`}
                  >
                    <UserIcon className="w-3 h-3" />
                    <span>My Profile</span>
                  </button>
                  <span className="text-white/40">|</span>
                  <button
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="hover:text-red-300 text-white/80 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3 text-red-300" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (onNavigateLogin) onNavigateLogin();
                      else setActiveTab('login');
                    }}
                    className="hover:text-[#FDB813] transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                  <span className="text-white/40">|</span>
                  <button
                    onClick={() => {
                      if (onNavigateRegister) onNavigateRegister();
                      else setActiveTab('register');
                    }}
                    className="hover:text-[#FDB813] transition-colors cursor-pointer"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Level 2: Main Row (Logo, Navigation Groups, Right Side Profile/Auth) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: Crest + Short Name "CUT Academic Society" */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleNavClick('landing')}
                className="flex items-center space-x-3 text-left cursor-pointer group flex-shrink-0"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <img
                    src={crestImage}
                    alt="CUT Academic Society Crest"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm sm:text-base leading-tight tracking-tight">
                    CUT Academic Society
                  </span>
                  <span className="text-[10px] text-white/70 uppercase tracking-wider block mt-0.5">
                    Central University of Technology
                  </span>
                </div>
              </button>

              {/* Desktop Nav Items (>= 1024px): Home + 3 Groups */}
              <nav
                ref={navContainerRef}
                className="hidden lg:flex items-center space-x-2 text-xs font-semibold whitespace-nowrap"
              >
                {/* Home direct link */}
                <button
                  onClick={() => handleNavClick('landing')}
                  className={`px-3 py-2 uppercase tracking-wide transition-colors cursor-pointer border-b-2 ${
                    activeTab === 'landing'
                      ? 'border-[#FDB813] text-white font-bold'
                      : 'border-transparent text-white/90 hover:text-white hover:border-[#FDB813]/60'
                  }`}
                >
                  Home
                </button>

                {/* Groups as dropdowns */}
                {navGroups.map((group) => {
                  const isGroupActive = activeGroupId === group.id;
                  const isOpen = desktopDropdownOpen === group.id;

                  return (
                    <div key={group.id} className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDesktopDropdownOpen(isOpen ? null : group.id);
                          setAvatarDropdownOpen(false);
                        }}
                        aria-expanded={isOpen}
                        className={`px-3 py-2 uppercase tracking-wide transition-colors cursor-pointer flex items-center gap-1 border-b-2 ${
                          isGroupActive
                            ? 'border-[#FDB813] text-white font-bold'
                            : 'border-transparent text-white/90 hover:text-white hover:border-[#FDB813]/60'
                        }`}
                      >
                        <span>{group.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isOpen && (
                        <div className="absolute left-0 mt-1 w-60 bg-white rounded-[6px] shadow-lg border border-slate-200 py-1.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                          {group.items.map((item) => {
                            const isItemActive = activeTab === item.id;
                            const isLocked = item.authRequired && !currentUser;

                            return (
                              <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id, item.authRequired)}
                                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                  isItemActive
                                    ? 'bg-blue-50 text-[#255190] font-bold border-l-2 border-[#255190]'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span className="truncate">{item.label}</span>
                                {isLocked && (
                                  <span title="Sign in required">
                                    <Lock className="w-3.5 h-3.5 text-slate-400 ml-2 flex-shrink-0" />
                                  </span>
                                )}
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

            {/* Right Side: Desktop Controls */}
            <div className="hidden lg:flex items-center space-x-3">
              {currentUser ? (
                /* Logged in: ONE avatar button (initials) only with dropdown */
                <div ref={avatarDropdownRef} className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvatarDropdownOpen(!avatarDropdownOpen);
                      setDesktopDropdownOpen(null);
                    }}
                    className="w-10 h-10 rounded-full bg-[#FDB813] text-slate-900 font-bold flex items-center justify-center text-xs shadow-xs hover:ring-2 hover:ring-white/40 cursor-pointer transition-all active:scale-95"
                    aria-label="User Account Menu"
                    aria-expanded={avatarDropdownOpen}
                  >
                    {currentUser.firstName[0]}{currentUser.lastName[0]}
                  </button>

                  {/* Avatar Dropdown */}
                  {avatarDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-[6px] shadow-xl border border-slate-200 py-2 text-slate-800 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                      {/* Name, role, and category */}
                      <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/60">
                        <div className="font-bold text-[#255190] text-xs truncate">
                          {currentUser.title} {currentUser.firstName} {currentUser.lastName}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                          {currentUser.role.replace('_', ' ')}
                          {currentUser.category && ` · ${currentUser.category.replace('_', ' ')}`}
                        </div>
                      </div>

                      <div className="py-1">
                        {/* My Profile */}
                        <button
                          onClick={() => {
                            setAvatarDropdownOpen(false);
                            if (onNavigateProfile) onNavigateProfile();
                            else setActiveTab('profile');
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-medium"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-[#255190]" />
                          <span>My Profile</span>
                        </button>

                        {/* Administrator Dashboard (Admins only) */}
                        {currentUser.role !== 'SCHOLAR' && (
                          <button
                            onClick={() => {
                              setAvatarDropdownOpen(false);
                              setActiveTab('admin_dashboard');
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-medium"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#255190]" />
                            <span>Administrator Dashboard</span>
                          </button>
                        )}

                        {/* Switch Role (Only if user has more than 1 role or roster available) */}
                        {users.length > 1 && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSwitchRoleSubmenuOpen(!switchRoleSubmenuOpen);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer font-medium"
                            >
                              <span className="flex items-center gap-2.5">
                                <Shield className="w-3.5 h-3.5 text-amber-700" />
                                <span>Switch Role</span>
                              </span>
                              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${switchRoleSubmenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {switchRoleSubmenuOpen && (
                              <div className="bg-slate-50 p-1.5 space-y-1 border-y border-slate-100 max-h-40 overflow-y-auto">
                                {users.map((u) => (
                                  <button
                                    key={u.id}
                                    onClick={() => {
                                      setAvatarDropdownOpen(false);
                                      setSwitchRoleSubmenuOpen(false);
                                      onSwitchUser(u.id);
                                    }}
                                    className={`w-full text-left px-2 py-1 rounded-[4px] text-[11px] flex items-center justify-between cursor-pointer ${
                                      u.id === currentUser.id
                                        ? 'bg-[#255190] text-white font-bold'
                                        : 'text-slate-700 hover:bg-white'
                                    }`}
                                  >
                                    <span className="truncate">{u.firstName} {u.lastName}</span>
                                    <span className="text-[9px] uppercase opacity-75">{u.role}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 my-1"></div>

                      {/* Log Out (muted red text, confirmation modal) */}
                      <button
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
                /* Logged out: Sign in (outlined) and Register (solid accent) buttons */
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (onNavigateLogin) onNavigateLogin();
                      else setActiveTab('login');
                    }}
                    className="h-9 px-4 rounded-[4px] border border-white/60 hover:bg-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => {
                      if (onNavigateRegister) onNavigateRegister();
                      else setActiveTab('register');
                    }}
                    className="h-9 px-4 rounded-[4px] bg-[#FDB813] hover:bg-[#e5a610] text-slate-900 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button (< 1024px) */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:bg-white/10 rounded-[4px] cursor-pointer"
                aria-label="Toggle navigation drawer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TABLET / MOBILE DRAWER (< 1024px) */}
        {/* ============================================================== */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-[#183765] text-white h-full flex flex-col shadow-2xl border-l border-white/10 animate-in slide-in-from-right duration-200">
              {/* 1. Header: Logo and Close (X) */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-[#255190]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-[4px] bg-white p-0.5 flex items-center justify-center shadow-xs">
                    <img src={crestImage} alt="CUTAS Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs block text-white">CUT Academic Society</span>
                    <span className="text-[10px] text-white/70 block">Central University of Technology</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white rounded-[4px] hover:bg-white/10 cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 2. Logged In Only: Compact Identity Strip */}
                {currentUser && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onNavigateProfile) onNavigateProfile();
                      else setActiveTab('profile');
                    }}
                    className="w-full p-2.5 rounded-[4px] bg-white/10 hover:bg-white/15 border border-white/10 flex items-center space-x-3 text-left transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#FDB813] text-slate-900 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-white truncate">
                        {currentUser.title} {currentUser.firstName} {currentUser.lastName}
                      </div>
                      <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold truncate">
                        {currentUser.role.replace('_', ' ')}
                        {currentUser.category && ` · ${currentUser.category.replace('_', ' ')}`}
                      </div>
                    </div>
                  </button>
                )}

                {/* 3. Navigation Accordion Groups */}
                <div className="space-y-1 text-xs">
                  {/* Home direct link */}
                  <button
                    onClick={() => handleNavClick('landing')}
                    className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                      activeTab === 'landing'
                        ? 'bg-[#FDB813] text-slate-900 font-bold'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <span>Home</span>
                  </button>

                  {/* Accordion Groups (One open at a time) */}
                  {navGroups.map((group) => {
                    const isGroupOpen = mobileAccordionOpen === group.id;
                    const hasActiveChild = group.items.some(i => i.id === activeTab);

                    return (
                      <div key={group.id} className="rounded-[4px] overflow-hidden border border-white/5">
                        <button
                          onClick={() => setMobileAccordionOpen(isGroupOpen ? null : group.id)}
                          className={`w-full text-left px-3 py-2.5 flex items-center justify-between font-semibold transition-colors cursor-pointer ${
                            hasActiveChild
                              ? 'bg-white/15 text-white'
                              : 'text-white/90 hover:bg-white/10'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{group.label}</span>
                            {hasActiveChild && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FDB813]" />
                            )}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isGroupOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Accordion Children */}
                        {isGroupOpen && (
                          <div className="bg-black/20 py-1 pl-3 pr-2 space-y-1">
                            {group.items.map((item) => {
                              const isChildActive = activeTab === item.id;
                              const isLocked = item.authRequired && !currentUser;

                              return (
                                <button
                                  key={item.id}
                                  onClick={() => handleNavClick(item.id, item.authRequired)}
                                  className={`w-full text-left px-3 py-2 rounded-[4px] text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                    isChildActive
                                      ? 'bg-[#FDB813] text-slate-900 font-bold'
                                      : 'text-white/80 hover:text-white hover:bg-white/10'
                                  }`}
                                >
                                  <span className="truncate">{item.label}</span>
                                  {isLocked && (
                                    <Lock className="w-3.5 h-3.5 text-white/50 ml-1.5 flex-shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 4. Logged in Only: My Profile & Admin Dashboard */}
                {currentUser && (
                  <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onNavigateProfile) onNavigateProfile();
                        else setActiveTab('profile');
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold transition-colors cursor-pointer flex items-center gap-2.5 ${
                        activeTab === 'profile'
                          ? 'bg-[#FDB813] text-slate-900 font-bold'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>My Profile</span>
                    </button>

                    {currentUser.role !== 'SCHOLAR' && (
                      <button
                        onClick={() => handleNavClick('admin_dashboard')}
                        className={`w-full text-left px-3 py-2.5 rounded-[4px] font-semibold transition-colors cursor-pointer flex items-center gap-2.5 ${
                          activeTab === 'admin_dashboard'
                            ? 'bg-[#FDB813] text-slate-900 font-bold'
                            : 'text-white/90 hover:bg-white/10'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Administrator Dashboard</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 5 & 6. Pinned at Bottom of Drawer */}
              <div className="p-4 border-t border-white/10 flex-shrink-0 bg-[#142e54]">
                {currentUser ? (
                  /* Pinned Log Out button: outlined, muted red text and border */
                  <button
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-[4px] border border-red-400/40 text-red-300 hover:text-red-200 hover:border-red-400/70 hover:bg-red-950/20 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Log Out</span>
                  </button>
                ) : (
                  /* Pinned Sign In (outlined) & Register (solid accent) buttons */
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onNavigateLogin) onNavigateLogin();
                        else setActiveTab('login');
                      }}
                      className="w-full h-11 flex items-center justify-center rounded-[4px] border border-white/60 hover:bg-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onNavigateRegister) onNavigateRegister();
                        else setActiveTab('register');
                      }}
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

      {/* Confirmation Modal for Logging Out */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-slate-300 shadow-xl max-w-sm w-full p-5 space-y-4 text-slate-800">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Confirm Log Out</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to end your active session and return to visitor mode?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[4px] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogoutAction}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-[4px] text-xs font-bold cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
