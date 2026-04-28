import { Map, MonitorPlay, Settings, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ViewMode } from '../../types';

const navItems: { view: ViewMode; icon: typeof Map; label: string }[] = [
    { view: 'map', icon: Map, label: 'Bản đồ' },
    { view: 'monitor', icon: MonitorPlay, label: 'Giám sát' },
    { view: 'settings', icon: Settings, label: 'Cài đặt' },
];

interface AppShellProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    detail?: React.ReactNode;
}

export default function AppShell({ children, sidebar, detail }: AppShellProps) {
    const { state, dispatch } = useApp();

    return (
        <div className="flex flex-col h-screen bg-base overflow-hidden">
            {/* ─── Header ─── */}
            <header className="flex-shrink-0 flex items-center justify-between px-4 h-12 bg-panel border-b border-white/[0.06] z-50">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center">
                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                            <rect x="0" y="2" width="10" height="8" rx="1.5" fill="white" />
                            <path d="M10 4L15 1.5v9L10 8V4Z" fill="white" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-fg tracking-tight">GIS VMS</span>
                        <span className="text-[10px] text-fg-subtle ml-1.5 hidden sm:inline">Giám sát Camera AI</span>
                    </div>
                </div>

                {/* Nav tabs */}
                <nav className="flex items-center gap-0.5">
                    {navItems.map(({ view, icon: Icon, label }) => (
                        <button
                            key={view}
                            onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: view })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${state.activeView === view
                                    ? 'bg-brand/15 text-accent-light border border-brand/25'
                                    : 'text-fg-muted hover:text-fg-dim hover:bg-white/[0.04]'
                                }`}
                        >
                            <Icon size={13} />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <button className="relative p-1.5 rounded-md text-fg-muted hover:text-fg-dim hover:bg-white/[0.04] transition-all">
                        <Bell size={14} />
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand" />
                    </button>
                    <div className="w-7 h-7 rounded-full bg-elevated border border-white/[0.12] flex items-center justify-center text-xs text-fg-dim font-medium">
                        A
                    </div>
                </div>
            </header>

            {/* ─── Body ─── */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Sidebar (map view only, when open) */}
                {sidebar && state.activeView === 'map' && (
                    <aside
                        className={`relative flex-shrink-0 flex flex-col bg-panel border-r border-white/[0.06] transition-all duration-300 ${state.isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
                            }`}
                    >
                        {state.isSidebarOpen && sidebar}
                        {/* Collapse toggle */}
                        <button
                            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-panel border border-white/[0.12] flex items-center justify-center text-fg-subtle hover:text-fg-dim hover:bg-elevated transition-all"
                        >
                            {state.isSidebarOpen ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
                        </button>
                    </aside>
                )}

                {/* Main content */}
                <main className="flex-1 min-w-0 overflow-hidden relative">
                    {children}
                </main>

                {/* Detail panel (map view only) */}
                {detail && state.activeView === 'map' && state.isDetailOpen && (
                    <aside className="flex-shrink-0 w-80 flex flex-col bg-panel border-l border-white/[0.06] overflow-hidden animate-slide-right">
                        {detail}
                    </aside>
                )}
            </div>
        </div>
    );
}
