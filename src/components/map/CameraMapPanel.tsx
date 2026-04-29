import { X, Maximize2, MapPin, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../ui/StatusBadge';
import VideoPlayer from '../ui/VideoPlayer';

const manufacturerColors: Record<string, string> = {
    Dahua: 'text-brand bg-brand/15 border-brand/30',
    Hikvision: 'text-accent-light bg-accent/15 border-accent/30',
};

export default function CameraMapPanel() {
    const { state, dispatch } = useApp();
    const camera = state.selectedCamera;

    if (!camera) return null;

    const handleExpand = () => dispatch({ type: 'OPEN_DETAIL' });
    const handleClose = () => {
        dispatch({ type: 'SET_SELECTED_CAMERA', payload: null });
        dispatch({ type: 'CLOSE_DETAIL' });
    };

    return (
        <div className="bg-panel/95 backdrop-blur-md border border-white/[0.12] rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <StatusBadge status={camera.status} showLabel={false} size="sm" />
                    <span className="text-sm font-semibold text-fg truncate leading-tight">
                        {camera.name}
                    </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {/* Expand → open right detail panel */}
                    <button
                        onClick={handleExpand}
                        title="Mở chi tiết"
                        className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.07] transition-all"
                    >
                        <Maximize2 size={14} />
                    </button>
                    {/* Close panel */}
                    <button
                        onClick={handleClose}
                        title="Đóng"
                        className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.07] transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Video */}
            <div className="px-3 pb-3">
                {camera.status === 'online' ? (
                    <VideoPlayer src={camera.videoSrc} cameraName={camera.name} compact />
                ) : (
                    <div
                        className="flex flex-col items-center justify-center bg-base rounded-xl border border-white/[0.08]"
                        style={{ aspectRatio: '16/9' }}
                    >
                        <WifiOff size={20} className="text-fg-muted mb-2" />
                        <p className="text-xs text-fg-muted capitalize">{camera.status}</p>
                    </div>
                )}
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between px-3.5 pb-3">
                <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-fg-muted flex-shrink-0" />
                    <span className="text-xs text-fg-muted truncate">{camera.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0
                            ${manufacturerColors[camera.manufacturer] ?? 'text-fg-muted border-white/20'}`}>
                        {camera.manufacturer}
                    </span>
                    {camera.status === 'online' && (
                        <Wifi size={11} className="text-online" />
                    )}
                </div>
            </div>
        </div>
    );
}
