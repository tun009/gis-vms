import { useEffect, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { GridLayout } from '../../types';
import VideoTile from './VideoTile';

const gridConfigs: Record<GridLayout, { cols: string; label: string }> = {
    '2x2': { cols: 'grid-cols-2', label: '2×2' },
    '3x3': { cols: 'grid-cols-3', label: '3×3' },
    '4x4': { cols: 'grid-cols-4', label: '4×4' },
};

const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

export default function MonitorGrid() {
    const { state, dispatch } = useApp();
    const [clock, setClock] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const hh = now.getHours().toString().padStart(2, '0');
            const mm = now.getMinutes().toString().padStart(2, '0');
            const ss = now.getSeconds().toString().padStart(2, '0');
            setClock(`${hh}:${mm}:${ss}`);
            const day = WEEKDAYS[now.getDay()].toUpperCase();
            const dd = now.getDate().toString().padStart(2, '0');
            const mo = (now.getMonth() + 1).toString().padStart(2, '0');
            const yr = now.getFullYear();
            setDate(`${day} · ${dd}/${mo}/${yr}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const config = gridConfigs[state.gridLayout];
    const cameras = state.cameras;
    const onlineCount = cameras.filter(c => c.status === 'online').length;
    const offlineCount = cameras.filter(c => c.status !== 'online').length;

    return (
        <div className="flex flex-col h-full bg-base">
            {/* Sub-header */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-panel">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <LayoutGrid size={15} className="text-fg-muted" />
                        <span className="text-sm text-fg-dim font-medium">Chế độ xem</span>
                    </div>
                    {/* Layout switcher */}
                    <div className="flex items-center gap-0.5 bg-elevated rounded-lg p-0.5 border border-white/[0.1]">
                        {(Object.keys(gridConfigs) as GridLayout[]).map((layout) => (
                            <button
                                key={layout}
                                onClick={() => dispatch({ type: 'SET_GRID_LAYOUT', payload: layout })}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${state.gridLayout === layout
                                        ? 'bg-brand text-fg shadow-sm'
                                        : 'text-fg-muted hover:text-fg-dim'
                                    }`}
                            >
                                {gridConfigs[layout].label}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-fg-muted">{cameras.length} camera</span>
                </div>

                {/* Right: stats + clock */}
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-online animate-pulse-dot" />
                            <span className="text-sm text-fg-dim">
                                <span className="font-semibold text-fg">{onlineCount}</span> Online
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cam-offline" />
                            <span className="text-sm text-fg-dim">
                                <span className="font-semibold text-fg">{offlineCount}</span> Offline
                            </span>
                        </div>
                    </div>

                    {/* Clock block */}
                    <div className="flex flex-col items-end bg-elevated border border-white/[0.08] rounded-lg px-3.5 py-1.5 min-w-[120px]">
                        <span className="text-[17px] font-mono font-bold text-fg tracking-[0.08em] leading-tight tabular-nums">
                            {clock}
                        </span>
                        <span className="text-[10px] text-fg-muted tracking-wider uppercase mt-0.5 leading-tight">
                            {date}
                        </span>
                    </div>
                </div>
            </div>

            {/* Video grid — show ALL cameras, scroll */}
            <div className="flex-1 overflow-auto p-3">
                <div className={`grid ${config.cols} gap-2`}>
                    {cameras.map((camera, idx) => (
                        <VideoTile
                            key={`${camera.id}-${idx}`}
                            camera={camera}
                            compact={state.gridLayout !== '2x2'}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
