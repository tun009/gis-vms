import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import MapView from './components/map/MapView';
import CameraList from './components/camera/CameraList';
import CameraDetail from './components/camera/CameraDetail';
import MonitorGrid from './components/monitor/MonitorGrid';
import SettingsView from './components/settings/SettingsView';

function AppContent() {
    const { state } = useApp();

    const renderMain = () => {
        switch (state.activeView) {
            case 'map': return <MapView />;
            case 'monitor': return <MonitorGrid />;
            case 'settings': return <SettingsView />;
            default: return <MapView />;
        }
    };

    return (
        <AppShell
            sidebar={<CameraList />}
            detail={<CameraDetail />}
        >
            {renderMain()}
        </AppShell>
    );
}

export default function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}
