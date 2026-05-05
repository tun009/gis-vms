import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Map, MonitorPlay, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { to: '/map', icon: Map, label: 'Bản đồ' },
    { to: '/monitor', icon: MonitorPlay, label: 'Giám sát' },
    { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

interface AppShellProps {
    children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
    const { logout } = useAuth();
    const location = useLocation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-base overflow-hidden">
            {/* ─── Header ─── */}
            <header className="relative flex-shrink-0 flex items-center justify-between px-5 h-14 bg-panel border-b border-white/[0.08] z-[9999]">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-glow-brand">
                        <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
                            <rect x="0" y="2.5" width="11" height="8" rx="2" fill="white" />
                            <path d="M11 4.5L17 2v9l-6-2.5V4.5Z" fill="white" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-fg tracking-tight leading-none">GIS VMS</p>
                        <p className="text-[13px] text-fg-muted mt-0.5 hidden sm:block">Hệ thống giám sát Camera AI</p>
                    </div>
                </div>

                {/* Nav tabs */}
                <nav className="flex items-center gap-1 mr-[120px]">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${isActive
                                    ? 'bg-brand/20 text-fg border-brand/35'
                                    : 'text-fg-muted hover:text-fg-dim hover:bg-white/[0.05] border-transparent'
                                }`
                            }
                        >
                            <Icon size={15} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-2.5 relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="w-8 h-8 rounded-full overflow-hidden border border-brand/30 focus:outline-none hover:ring-2 hover:ring-brand/40 cursor-pointer transition-all"
                    >
                        <img src="/profile.png" alt="Avatar" className="w-full h-full object-cover" />
                    </button>

                    {/* User Dropdown */}
                    {isUserMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-[999]"
                                onClick={() => setIsUserMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-40 bg-[#252a35] border border-white/[0.1] rounded-lg shadow-2xl z-[1000] py-2 overflow-hidden flex flex-col">
                                <div className="px-4 py-3 border-b border-white/[0.05] mb-1">
                                    <p className="text-sm font-semibold text-white truncate">Administrator</p>
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">admin</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-3 w-full px-4 py-2 mt-1 focus:outline-none hover:bg-red-500/10 group text-left"
                                >
                                    <LogOut size={16} className="text-red-400 group-hover:text-red-300" />
                                    <span className="text-sm font-medium text-red-400 group-hover:text-red-300">Đăng xuất</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* ─── Body ─── */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
