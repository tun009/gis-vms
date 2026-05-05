import { useRef, useEffect, useState } from 'react';
import { Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    cameraName: string;
    compact?: boolean;
}

export default function VideoGrid({ src, cameraName, compact = false }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('vi-VN', { hour12: false }));
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative bg-base overflow-hidden group ${compact ? 'rounded-md' : 'rounded-lg'}`}
            style={{ aspectRatio: '16/9' }}
        >
            <video
                ref={videoRef}
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
            />

            {/* Top bar overlay */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/70 to-transparent">
                {/* LIVE badge */}
                <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-md px-2 py-0.5">
                    <span className="live-dot w-1.5 h-1.5 rounded-full bg-cam-offline" />
                    <span className="text-fg font-mono text-[10px] font-medium tracking-wider">LIVE</span>
                </div>

            </div>

        </div>
    );
}
