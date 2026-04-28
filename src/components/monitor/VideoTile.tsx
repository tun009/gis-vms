import { Wifi, WifiOff, Maximize2, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Camera } from '../../types';
import VideoPlayer from '../ui/VideoPlayer';

interface VideoTileProps {
    camera: Camera;
    compact?: boolean;
}

const manufacturerColors: Record<string, string> = {
    Dahua: 'bg-brand/20 text-brand border-brand/30',
    Hikvision: 'bg-accent/20 text-accent-light border-accent/30',
};

export default function VideoTile({ camera, compact = false }: VideoTileProps) {
    const { dispatch } = useApp();

    const handleViewDetail = () => {
        dispatch({ type: 'SET_SELECTED_CAMERA', payload: camera });
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'map' });
    };

    if (camera.status !== 'online') {
        return (
            <div className="relative rounded-lg overflow-hidden border border-white/[0.08] bg-base flex flex-col items-center justify-center group"
                style={{ aspectRatio: '16/9' }}>
                <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center mb-2">
                    <WifiOff size={18} className="text-fg-subtle" />
                </div>
                <p className="text-xs text-fg-muted font-medium">Camera không hoạt động</p>
                <p className="text-[10px] text-fg-subtle mt-1 capitalize">{camera.status}</p>

                {/* Bottom bar */}
                <div className="absolute bottom-0 inset-x-0 px-2.5 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[11px] text-fg-muted truncate">{camera.name}</p>
                </div>

                {/* Offline badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cam-offline" />
                    <span className="text-[10px] text-fg-muted font-mono">OFFLINE</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative rounded-lg overflow-hidden border border-white/[0.08] group cursor-pointer"
            style={{ aspectRatio: '16/9' }}
        >
            <VideoPlayer src={camera.videoSrc} cameraName={camera.name} compact={compact} />

            {/* Hover overlay */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand/50 rounded-lg transition-all duration-200 pointer-events-none" />

            {/* Manufacturer badge bottom-left */}
            <div className={`absolute bottom-8 left-2.5 text-[9px] px-1.5 py-0.5 rounded border font-medium ${manufacturerColors[camera.manufacturer] ?? ''}`}>
                {camera.manufacturer}
            </div>

            {/* Action buttons on hover */}
            <div className="absolute top-8 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                    onClick={handleViewDetail}
                    className="p-1.5 rounded-md bg-black/60 backdrop-blur-sm hover:bg-black/80 text-fg/80 hover:text-fg transition-all"
                    title="Xem trên bản đồ"
                >
                    <Info size={12} />
                </button>
                <button
                    className="p-1.5 rounded-md bg-black/60 backdrop-blur-sm hover:bg-black/80 text-fg/80 hover:text-fg transition-all"
                    title="Toàn màn hình"
                >
                    <Maximize2 size={12} />
                </button>
            </div>

            {/* Bottom name bar */}
            <div className="absolute bottom-0 inset-x-0 px-2.5 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-1.5">
                    <Wifi size={9} className="text-online flex-shrink-0" />
                    <p className="text-[11px] text-fg/80 truncate">{camera.name}</p>
                </div>
            </div>
        </div>
    );
}
