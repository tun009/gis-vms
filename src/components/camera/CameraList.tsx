import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Manufacturer, CameraStatus } from '../../types';
import CameraCard from './CameraCard';

export default function CameraList() {
    const { state, dispatch } = useApp();
    const [showFilters, setShowFilters] = useState(false);

    const onlineCount = state.cameras.filter(c => c.status === 'online').length;
    const offlineCount = state.cameras.filter(c => c.status !== 'online').length;

    const inPolygon = state.drawnPolygon !== null;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h2 className="text-sm font-medium text-fg tracking-tight">Danh sách Camera</h2>
                        <p className="text-[11px] text-fg-subtle mt-0.5">
                            {inPolygon
                                ? `${state.filteredCameras.length} camera trong vùng`
                                : `${state.cameras.length} thiết bị`}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilters(v => !v)}
                        className={`p-1.5 rounded-md border transition-all ${showFilters
                            ? 'bg-brand/15 border-brand/30 text-accent-light'
                            : 'bg-white/[0.03] border-white/[0.08] text-fg-muted hover:text-fg-dim'}`}
                        title="Bộ lọc"
                    >
                        <SlidersHorizontal size={14} />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Tìm camera, IP, khu vực..."
                        value={state.searchQuery}
                        onChange={e => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md pl-8 pr-8 py-1.5
                       text-sm text-fg-dim placeholder:text-fg-subtle
                       focus:outline-none focus:border-brand/40 focus:bg-white/[0.05] transition-all"
                    />
                    {state.searchQuery && (
                        <button
                            onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg-dim"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mt-2.5 space-y-2 animate-fade-in">
                        {/* Manufacturer filter */}
                        <div className="flex gap-1.5 flex-wrap">
                            {(['all', 'Dahua', 'Hikvision'] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => dispatch({ type: 'SET_MANUFACTURER_FILTER', payload: m as Manufacturer | 'all' })}
                                    className={`pill text-[11px] transition-all ${state.manufacturerFilter === m ? 'pill-active' : 'hover:border-line-dim hover:text-fg'}`}
                                >
                                    {m === 'all' ? 'Tất cả hãng' : m}
                                </button>
                            ))}
                        </div>
                        {/* Status filter */}
                        <div className="flex gap-1.5 flex-wrap">
                            {([
                                { key: 'all', label: 'Tất cả' },
                                { key: 'online', label: `Online (${onlineCount})` },
                                { key: 'offline', label: `Offline (${offlineCount})` },
                                { key: 'error', label: 'Lỗi' },
                            ] as const).map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => dispatch({ type: 'SET_STATUS_FILTER', payload: key as CameraStatus | 'all' })}
                                    className={`pill text-[11px] transition-all ${state.statusFilter === key ? 'pill-active' : 'hover:border-line-dim hover:text-fg'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Polygon filter note */}
                {inPolygon && (
                    <div className="mt-2 flex items-center justify-between bg-brand/10 border border-brand/20 rounded-md px-2.5 py-1.5">
                        <span className="text-[11px] text-accent-light">Đang lọc theo vùng vẽ</span>
                        <button
                            onClick={() => dispatch({ type: 'SET_DRAWN_POLYGON', payload: null })}
                            className="text-fg-subtle hover:text-fg-dim transition-colors"
                        >
                            <X size={11} />
                        </button>
                    </div>
                )}
            </div>

            {/* Camera list */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
                {state.filteredCameras.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center mb-3">
                            <Search size={18} className="text-fg-subtle" />
                        </div>
                        <p className="text-sm text-fg-muted">Không tìm thấy camera</p>
                        <p className="text-xs text-fg-subtle mt-1">Thử thay đổi bộ lọc</p>
                    </div>
                ) : (
                    state.filteredCameras.map((camera) => (
                        <CameraCard
                            key={camera.id}
                            camera={camera}
                            isSelected={state.selectedCamera?.id === camera.id}
                            isHighlighted={inPolygon}
                            onClick={() => dispatch({ type: 'SET_SELECTED_CAMERA', payload: camera })}
                        />
                    ))
                )}
            </div>

            {/* Footer stats */}
            <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-online" />
                    <span className="text-[11px] text-fg-subtle">{onlineCount} online</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cam-offline" />
                    <span className="text-[11px] text-fg-subtle">{offlineCount} offline</span>
                </div>
                <div className="text-[11px] text-fg-subtle">{state.cameras.length} tổng</div>
            </div>
        </div>
    );
}
