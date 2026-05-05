import { X, MapPin, Cpu, Wifi, Calendar, Activity, WifiOff, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../ui/StatusBadge';
import VideoPlayer from '../ui/VideoPlayer';

const manufacturerColors: Record<string, string> = {
    Dahua: 'text-brand bg-brand/15 border-brand/30',
    Hikvision: 'text-accent-light bg-accent/15 border-accent/30',
};

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    mono?: boolean;
}

function InfoRow({ icon, label, value, mono }: InfoRowProps) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-white/[0.06] last:border-0">
            <div className="text-fg-muted mt-0.5 flex-shrink-0 w-4 flex items-center justify-center">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-fg-muted uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-sm text-fg-dim ${mono ? 'font-mono tracking-wide' : ''} truncate`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

export default function CameraDetail() {
    const { state, dispatch } = useApp();
    const camera = state.selectedCamera;

    if (!camera || !state.isDetailOpen) return null;

    const formattedDate = new Date(camera.installedAt).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });

    return (
        <div className="flex flex-col h-full">
            {/* Header with Back button */}
            <div className="px-5 pt-5 pb-4 border-b border-white/[0.08] flex-shrink-0">
                <button
                    onClick={() => {
                        dispatch({ type: 'CLOSE_DETAIL' });
                        dispatch({ type: 'SET_SELECTED_CAMERA', payload: null });
                    }}
                    className="flex items-center gap-2 text-fg-muted hover:text-fg text-sm mb-3 transition-colors group"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Danh sách camera</span>
                </button>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium
                ${manufacturerColors[camera.manufacturer] ?? 'text-fg-muted border-white/20'}`}>
                                {camera.manufacturer}
                            </span>
                            <StatusBadge status={camera.status} />
                        </div>
                        <h2 className="text-sm font-semibold text-fg leading-snug">{camera.name}</h2>
                        <p className="text-fg-muted font-mono text-xs mt-1">{camera.ip}</p>
                    </div>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Video player */}
                {camera.status === 'online' ? (
                    <VideoPlayer src={camera.videoSrc} cameraName={camera.name} />
                ) : (
                    <div
                        className="flex flex-col items-center justify-center bg-base rounded-xl border border-white/[0.1]"
                        style={{ aspectRatio: '16/9' }}
                    >
                        <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center mb-3">
                            <WifiOff size={20} className="text-fg-muted" />
                        </div>
                        <p className="text-sm font-medium text-fg-dim">Camera không hoạt động</p>
                        <p className="text-xs text-fg-muted mt-1 capitalize">{camera.status}</p>
                    </div>
                )}

                {/* Metadata */}
                <div>
                    <p className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-2">Thông tin thiết bị</p>
                    <div className="card-linear px-1.5 py-0.5">
                        <InfoRow icon={<Activity size={14} />} label="ID Thiết bị" value={camera.id} mono />
                        <InfoRow icon={<Wifi size={14} />} label="Địa chỉ IP" value={camera.ip} mono />
                        <InfoRow icon={<Cpu size={14} />} label="Model" value={camera.model} />
                        <InfoRow icon={<MapPin size={14} />} label="Vị trí" value={camera.location} />
                        <InfoRow
                            icon={<MapPin size={14} />}
                            label="Tọa độ GPS"
                            value={`${camera.lat.toFixed(5)}, ${camera.lng.toFixed(5)}`}
                            mono
                        />
                        <InfoRow icon={<Calendar size={14} />} label="Ngày lắp đặt" value={formattedDate} />
                    </div>
                </div>
            </div>
        </div>
    );
}
