import { X, MapPin, Cpu, Wifi, Calendar, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../ui/StatusBadge';
import VideoPlayer from '../ui/VideoPlayer';

const manufacturerColors: Record<string, string> = {
    Dahua: 'text-brand bg-brand/10 border-brand/20',
    Hikvision: 'text-accent-light bg-accent/10 border-accent/20',
};

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    mono?: boolean;
}

function InfoRow({ icon, label, value, mono }: InfoRowProps) {
    return (
        <div className="flex items-start gap-2.5 py-2 border-b border-white/[0.05] last:border-0">
            <div className="text-fg-subtle mt-0.5 flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-fg-subtle uppercase tracking-wider mb-0.5">{label}</p>
                <p className={`text-sm text-fg-dim ${mono ? 'font-mono text-xs tracking-wide' : ''} truncate`}>{value}</p>
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
        <div className="flex flex-col h-full animate-slide-right">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-2 py-px rounded border font-medium ${manufacturerColors[camera.manufacturer] ?? ''}`}>
                                {camera.manufacturer}
                            </span>
                            <StatusBadge status={camera.status} />
                        </div>
                        <h2 className="text-sm font-medium text-fg leading-tight">{camera.name}</h2>
                        <p className="text-fg-subtle font-mono text-[11px] mt-0.5">{camera.ip}</p>
                    </div>
                    <button
                        onClick={() => dispatch({ type: 'CLOSE_DETAIL' })}
                        className="p-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-fg-muted hover:text-fg-dim hover:bg-white/[0.06] transition-all flex-shrink-0"
                    >
                        <X size={13} />
                    </button>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {/* Video player */}
                {camera.status === 'online' ? (
                    <VideoPlayer src={camera.videoSrc} cameraName={camera.name} />
                ) : (
                    <div
                        className="flex flex-col items-center justify-center bg-base rounded-lg border border-white/[0.08]"
                        style={{ aspectRatio: '16/9' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center mb-2">
                            <Wifi size={18} className="text-fg-subtle" />
                        </div>
                        <p className="text-sm text-fg-muted">Camera không hoạt động</p>
                        <p className="text-xs text-fg-subtle mt-1 capitalize">{camera.status}</p>
                    </div>
                )}

                {/* Metadata */}
                <div className="card-linear p-1">
                    <InfoRow icon={<Activity size={13} />} label="ID Thiết bị" value={camera.id} mono />
                    <InfoRow icon={<Wifi size={13} />} label="Địa chỉ IP" value={`${camera.ip}:${camera.rtspUrl.split(':')[2]?.split('/')[0] ?? '554'}`} mono />
                    <InfoRow icon={<Cpu size={13} />} label="Model" value={camera.model} />
                    <InfoRow icon={<MapPin size={13} />} label="Vị trí" value={camera.location} />
                    <InfoRow
                        icon={<MapPin size={13} />}
                        label="Tọa độ"
                        value={`${camera.lat.toFixed(5)}, ${camera.lng.toFixed(5)}`}
                        mono
                    />
                    <InfoRow icon={<Calendar size={13} />} label="Lắp đặt" value={formattedDate} />
                </div>

                {/* Capabilities */}
                <div>
                    <p className="text-[10px] text-fg-subtle uppercase tracking-wider mb-2">Tính năng AI</p>
                    <div className="flex flex-wrap gap-1.5">
                        {camera.capabilities.map((cap) => (
                            <span
                                key={cap}
                                className="text-[11px] px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-fg-dim"
                            >
                                {cap}
                            </span>
                        ))}
                    </div>
                </div>

                {/* RTSP URL */}
                <div>
                    <p className="text-[10px] text-fg-subtle uppercase tracking-wider mb-1.5">RTSP Stream URL</p>
                    <div className="bg-base rounded-md border border-white/[0.08] px-3 py-2">
                        <p className="text-[11px] font-mono text-fg-subtle break-all leading-relaxed">
                            {camera.rtspUrl}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
