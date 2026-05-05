import { useState, useRef, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import AppShell from './components/layout/AppShell';
import MapView from './components/map/MapView';
import CameraList from './components/camera/CameraList';
import CameraDetail from './components/camera/CameraDetail';
import MonitorGrid from './components/monitor/MonitorGrid';
import SettingsView from './components/settings/SettingsView';
import LoginPage from './components/auth/LoginPage';
import PageTransition from './components/ui/PageTransition';
import { PanelRightOpen, PanelRightClose } from 'lucide-react';

// ─── Auth guard ─────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

// ─── Login route ────────────────────────────────────────────────────
function LoginRoute() {
    const { isAuthenticated, login } = useAuth();
    if (isAuthenticated) return <Navigate to="/map" replace />;
    return <LoginPage onLogin={login} />;
}

// ─── Right panel: CameraDetail replaces CameraList (Plan A) ─────────
function MapRightPanel({ panelWidth }: { panelWidth: number }) {
    const { state } = useApp();

    if (state.isDetailOpen && state.selectedCamera) {
        return <CameraDetail />;
    }
    return <CameraList panelWidth={panelWidth} />;
}

// ─── Constants ──────────────────────────────────────────────────────
const MIN_PANEL_RATIO = 0.15; // 15%
const MAX_PANEL_RATIO = 0.50; // 50%
const DEFAULT_PANEL_RATIO = 0.25; // 25%

// ─── Map page: resizable split layout ───────────────────────────────
function MapPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [panelRatio, setPanelRatio] = useState(DEFAULT_PANEL_RATIO);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [panelWidthPx, setPanelWidthPx] = useState(0);

    // Calculate panel pixel width for responsive grid
    useEffect(() => {
        const update = () => {
            if (containerRef.current && isPanelOpen) {
                setPanelWidthPx(containerRef.current.offsetWidth * panelRatio);
            }
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [panelRatio, isPanelOpen]);

    // ── Drag handlers ─────────────────────────────────────────────
    const handleDragStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    useEffect(() => {
        if (!isDragging) return;

        const handleDragMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const totalWidth = rect.width;
            // Panel is on the right, so panelWidth = totalWidth - mouseX
            const panelWidth = totalWidth - (e.clientX - rect.left);
            const ratio = Math.min(MAX_PANEL_RATIO, Math.max(MIN_PANEL_RATIO, panelWidth / totalWidth));
            setPanelRatio(ratio);
        };

        const handleDragEnd = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging]);

    return (
        <AppShell>
            <PageTransition>
                <div ref={containerRef} className="flex h-full relative">
                    {/* Left: Map */}
                    <div
                        className={`min-w-0 relative ${isDragging ? '' : 'transition-all duration-200'}`}
                        style={{ width: isPanelOpen ? `${(1 - panelRatio) * 100}%` : '100%' }}
                    >
                        <MapView />

                        {/* Toggle panel button — floating on map */}
                        <button
                            onClick={() => setIsPanelOpen(v => !v)}
                            className="absolute top-3 right-3 z-[1000] p-2.5 rounded-xl
                                       bg-panel/95 backdrop-blur-md border border-white/[0.12]
                                       text-fg-muted hover:text-fg hover:bg-[#6860cc]
                                       shadow-dialog transition-all"
                            title={isPanelOpen ? 'Ẩn danh sách' : 'Hiện danh sách'}
                        >
                            {isPanelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                        </button>
                    </div>

                    {/* Right: Camera panel (collapsible + resizable) */}
                    {isPanelOpen && (
                        <>
                            {/* Drag handle */}
                            <div
                                onMouseDown={handleDragStart}
                                className={`flex-shrink-0 w-1 cursor-col-resize relative group z-10
                                    ${isDragging ? 'bg-brand/40' : 'bg-white/[0.08] hover:bg-brand/30'}
                                    transition-colors`}
                            >
                                {/* Visual drag indicator */}
                                <div className={`absolute inset-y-0 -left-1 -right-1 ${isDragging ? '' : 'group-hover:bg-brand/10'} transition-colors`} />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                    w-1 h-8 rounded-full bg-white/20 group-hover:bg-brand/50 transition-colors" />
                            </div>

                            {/* Panel content */}
                            <div
                                className="min-w-0 flex flex-col bg-panel overflow-hidden"
                                style={{ width: `${panelRatio * 100}%` }}
                            >
                                <MapRightPanel panelWidth={panelWidthPx} />
                            </div>
                        </>
                    )}

                    {/* Drag overlay — prevents iframe/map capturing mouse events while dragging */}
                    {isDragging && (
                        <div className="absolute inset-0 z-[9999] cursor-col-resize" />
                    )}
                </div>
            </PageTransition>
        </AppShell>
    );
}

function MonitorPage() {
    return (
        <AppShell>
            <PageTransition><MonitorGrid /></PageTransition>
        </AppShell>
    );
}

function SettingsPage() {
    return (
        <AppShell>
            <PageTransition><SettingsView /></PageTransition>
        </AppShell>
    );
}

// ─── App ─────────────────────────────────────────────────────────────
export default function App() {
    return (
        <AuthProvider>
            <AppProvider>
                <ToastProvider>
                    <Routes>
                        <Route path="/login" element={<LoginRoute />} />
                        <Route path="/map" element={<RequireAuth><MapPage /></RequireAuth>} />
                        <Route path="/monitor" element={<RequireAuth><MonitorPage /></RequireAuth>} />
                        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                        <Route path="/" element={<Navigate to="/map" replace />} />
                        <Route path="*" element={<Navigate to="/map" replace />} />
                    </Routes>
                </ToastProvider>
            </AppProvider>
        </AuthProvider>
    );
}
