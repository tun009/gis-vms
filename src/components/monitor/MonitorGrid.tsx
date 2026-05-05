import { useEffect, useRef, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { GridLayout } from '../../types';
import VideoTile from './VideoTile';

const gridConfigs: Record<GridLayout, { cols: number; label: string; slots: number }> = {
    '2x2': { cols: 2, label: '2×2', slots: 4 },
    '4x4': { cols: 4, label: '4×4', slots: 16 },
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

    const rows = config.cols; // 2x2 → 2 rows, 4x4 → 4 rows

    // Measure container to compute exact row height
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const [rowHeight, setRowHeight] = useState(0);

    useEffect(() => {
        const el = gridContainerRef.current;
        if (!el) return;

        const compute = () => {
            const h = el.clientHeight;
            const gap = 6; // gap-1.5 = 6px
            const padding = 12; // p-1.5 = 6px * 2
            const availableHeight = h - padding - (rows - 1) * gap;
            setRowHeight(Math.floor(availableHeight / rows));
        };

        compute();
        const ro = new ResizeObserver(compute);
        ro.observe(el);
        return () => ro.disconnect();
    }, [rows]);

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
                    {/* <div className="flex flex-col items-end bg-elevated border border-white/[0.08] rounded-lg px-3.5 py-1.5 min-w-[120px]">
                        <span className="text-[17px] font-mono font-bold text-fg tracking-[0.08em] leading-tight tabular-nums">
                            {clock}
                        </span>
                        <span className="text-[10px] text-fg-muted tracking-wider uppercase mt-0.5 leading-tight">
                            {date}
                        </span>
                    </div> */}
                </div>
            </div>

            {/* Video grid — first page fits viewport, scroll for more */}
            <div ref={gridContainerRef} className="flex-1 min-h-0 overflow-auto p-1.5">
                <div
                    className="grid w-full gap-1.5"
                    style={{
                        gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
                        gridAutoRows: rowHeight > 0 ? `${rowHeight}px` : `calc((100% - ${(rows - 1) * 6}px) / ${rows})`,
                    }}
                >
                    {cameras.map((camera) => (
                        <div key={camera.id} className="min-h-0 min-w-0 rounded-lg overflow-hidden">
                            <VideoTile camera={camera} compact={state.gridLayout === '4x4'} fillParent />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
