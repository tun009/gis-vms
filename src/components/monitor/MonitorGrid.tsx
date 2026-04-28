import { useEffect, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { GridLayout } from '../../types';
import VideoTile from './VideoTile';

const gridConfigs: Record<GridLayout, { cols: string; label: string; count: number }> = {
    '2x2': { cols: 'grid-cols-2', label: '2×2', count: 4 },
    '3x3': { cols: 'grid-cols-3', label: '3×3', count: 9 },
    '4x4': { cols: 'grid-cols-4', label: '4×4', count: 16 },
};

export default function MonitorGrid() {
    const { state, dispatch } = useApp();
    const [clock, setClock] = useState('');

    useEffect(() => {
        const tick = () => setClock(new Date().toLocaleTimeString('vi-VN', { hour12: false }));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const config = gridConfigs[state.gridLayout];
    const onlineCount = state.cameras.filter(c => c.status === 'online').length;
    const offlineCount = state.cameras.filter(c => c.status !== 'online').length;

    // Fill grid with cameras (repeat if not enough)
    const gridCameras = Array.from({ length: config.count }, (_, i) => state.cameras[i % state.cameras.length]);

    return (
        <div className="flex flex-col h-full bg-base">
            {/* Sub-header toolbar */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 border-b border-white/[0.06] bg-panel">
                <div className="flex items-center gap-3">
                    <LayoutGrid size={15} className="text-fg-muted" />
                    <span className="text-xs text-fg-subtle">Chế độ xem:</span>
                    <div className="flex items-center gap-0.5 bg-elevated rounded-md p-0.5 border border-white/[0.08]">
                        {(Object.keys(gridConfigs) as GridLayout[]).map((layout) => (
                            <button
                                key={layout}
                                onClick={() => dispatch({ type: 'SET_GRID_LAYOUT', payload: layout })}
                                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${state.gridLayout === layout
                                        ? 'bg-brand text-fg shadow-sm'
                                        : 'text-fg-muted hover:text-fg-dim'
                                    }`}
                            >
                                {gridConfigs[layout].label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status counts */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-online animate-pulse-dot" />
                            <span className="text-xs text-fg-subtle font-mono">{onlineCount} Online</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cam-offline" />
                            <span className="text-xs text-fg-subtle font-mono">{offlineCount} Offline</span>
                        </div>
                    </div>
                    {/* Clock */}
                    <span className="text-xs font-mono text-fg-muted bg-elevated px-2.5 py-1 rounded border border-white/[0.08] tracking-wider">
                        {clock}
                    </span>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto p-3">
                <div className={`grid ${config.cols} gap-2 h-full`} style={{ alignContent: 'start' }}>
                    {gridCameras.map((camera, idx) => (
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
