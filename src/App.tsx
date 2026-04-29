import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import AppShell from './components/layout/AppShell';
import MapView from './components/map/MapView';
import CameraList from './components/camera/CameraList';
import CameraDetail from './components/camera/CameraDetail';
import MonitorGrid from './components/monitor/MonitorGrid';
import SettingsView from './components/settings/SettingsView';
import LoginPage from './components/auth/LoginPage';
import PageTransition from './components/ui/PageTransition';

// ─── Auth guard ─────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

// ─── Login route (redirect away if already logged in) ───────────────
function LoginRoute() {
    const { isAuthenticated, login } = useAuth();
    if (isAuthenticated) return <Navigate to="/map" replace />;
    return <LoginPage onLogin={login} />;
}

// ─── Page components ─────────────────────────────────────────────────
function MapPage() {
    return (
        <AppShell sidebar={<CameraList />} detail={<CameraDetail />}>
            <PageTransition><MapView /></PageTransition>
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
