import { Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Camera } from '../../types';
import VideoGrid from '../ui/VideoGrid';

interface VideoTileProps {
    camera: Camera;
    compact?: boolean;
    /** When true, tile stretches to fill its parent container (no aspect-ratio) */
    fillParent?: boolean;
}

export default function VideoTile({ camera, compact = false, fillParent = false }: VideoTileProps) {
    const { dispatch } = useApp();

    const containerStyle = fillParent
        ? { width: '100%', height: '100%' }
        : { aspectRatio: '16/9' };

    if (camera.status !== 'online') {
        return (
            <div
                className="relative rounded-lg overflow-hidden border border-white/[0.08] bg-base flex flex-col items-center justify-center group"
                style={containerStyle}
            >
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
        <div
            className="relative rounded-lg overflow-hidden border border-white/[0.08] group cursor-pointer"
            style={containerStyle}
        >
            <VideoGrid src={camera.videoSrc} cameraName={camera.name} compact={compact} />

            {/* Hover overlay */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand/50 rounded-lg transition-all duration-200 pointer-events-none" />

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
