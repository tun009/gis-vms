import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, List, LayoutGrid } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Manufacturer, CameraStatus } from '../../types';
import CameraCard from './CameraCard';
import VideoTile from '../monitor/VideoTile';

type ViewMode = 'list' | 'grid';

interface CameraListProps {
    /** Panel width in pixels — used to compute responsive grid columns */
    panelWidth?: number;
}

export default function CameraList({ panelWidth = 400 }: CameraListProps) {
    const { state, dispatch } = useApp();
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid'); // default grid

    const onlineCount = state.cameras.filter(c => c.status === 'online').length;
    const offlineCount = state.cameras.filter(c => c.status !== 'online').length;
    const inPolygon = state.drawnPolygon !== null;

    const handleCameraClick = (camera: typeof state.cameras[0]) => {
        dispatch({ type: 'SET_SELECTED_CAMERA', payload: camera });
        dispatch({ type: 'OPEN_DETAIL' });
    };

    // Responsive grid columns: min 1, max 3, based on panel width
    const gridCols = useMemo(() => {
        if (panelWidth < 350) return 1;
        if (panelWidth < 550) return 2;
        return 3;
    }, [panelWidth]);

    const gridClass = gridCols === 1
        ? 'grid grid-cols-1 gap-2'
        : gridCols === 2
            ? 'grid grid-cols-2 gap-2'
            : 'grid grid-cols-3 gap-2';

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 pt-5 pb-4 border-b border-white/[0.08] flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-fg tracking-tight truncate">Danh sách Camera</h2>
                        <p className="text-xs text-fg-muted mt-0.5">
                            {inPolygon
                                ? `${state.filteredCameras.length} camera trong vùng quét`
                                : `${state.cameras.length} thiết bị · ${onlineCount} online`}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* View mode toggle */}
                        <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-elevated border border-white/[0.08]">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded transition-all ${viewMode === 'grid'
                                    ? 'bg-brand/20 text-accent-light'
                                    : 'text-fg-muted hover:text-fg-dim'
                                    }`}
                                title="Lưới xem trực tiếp"
                            >
                                <LayoutGrid size={13} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded transition-all ${viewMode === 'list'
                                    ? 'bg-brand/20 text-accent-light'
                                    : 'text-fg-muted hover:text-fg-dim'
                                    }`}
                                title="Danh sách"
                            >
                                <List size={13} />
                            </button>

                        </div>

                        {/* Filter toggle */}
                        <button
                            onClick={() => setShowFilters(v => !v)}
                            className={`p-2 rounded-md border transition-all ${showFilters
                                ? 'bg-brand/15 border-brand/30 text-accent-light'
                                : 'bg-white/[0.05] border-white/[0.12] text-fg-muted hover:text-fg-dim hover:bg-white/[0.08]'}`}
                            title="Bộ lọc"
                        >
                            <SlidersHorizontal size={15} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Tìm camera, IP, khu vực..."
                        value={state.searchQuery}
                        onChange={e => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg pl-9 pr-9 py-2
                       text-sm text-fg-dim placeholder:text-fg-muted
                       focus:outline-none focus:border-brand/50 focus:bg-white/[0.07] transition-all"
                    />
                    {state.searchQuery && (
                        <button
                            onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-dim"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mt-3 space-y-2.5 animate-fade-in">
                        <div>
                            <p className="text-[11px] text-fg-subtle uppercase tracking-wider mb-1.5">Hãng sản xuất</p>
                            <div className="flex gap-1.5 flex-wrap">
                                {(['all', 'Dahua', 'Hikvision'] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => dispatch({ type: 'SET_MANUFACTURER_FILTER', payload: m as Manufacturer | 'all' })}
                                        className={`pill ${state.manufacturerFilter === m ? 'pill-active' : ''}`}
                                    >
                                        {m === 'all' ? 'Tất cả' : m}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-[11px] text-fg-subtle uppercase tracking-wider mb-1.5">Trạng thái</p>
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
                                        className={`pill ${state.statusFilter === key ? 'pill-active' : ''}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Polygon filter banner */}
                {inPolygon && (
                    <div className="mt-3 flex items-center justify-between bg-brand/10 border border-brand/25 rounded-lg px-3 py-2">
                        <div>
                            <p className="text-xs font-medium text-accent-light">Đang lọc theo vùng vẽ</p>
                            <p className="text-[11px] text-fg-muted mt-0.5">{state.filteredCameras.length}/{state.cameras.length} camera</p>
                        </div>
                        <button
                            onClick={() => dispatch({ type: 'SET_DRAWN_POLYGON', payload: null })}
                            className="p-1 rounded text-fg-muted hover:text-fg-dim transition-colors"
                            title="Xóa vùng"
                        >
                            <X size={13} />
                        </button>
                    </div>
                )}
            </div>

            {/* Camera list / grid */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
                {state.filteredCameras.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center mb-3">
                            <Search size={20} className="text-fg-muted" />
                        </div>
                        <p className="text-sm font-medium text-fg-dim">Không tìm thấy camera</p>
                        <p className="text-xs text-fg-muted mt-1">Thử thay đổi điều kiện lọc</p>
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="space-y-2">
                        {state.filteredCameras.map((camera) => (
                            <CameraCard
                                key={camera.id}
                                camera={camera}
                                isSelected={state.selectedCamera?.id === camera.id}
                                isHighlighted={inPolygon ? true : undefined}
                                onClick={() => handleCameraClick(camera)}
                            />
                        ))}
                    </div>
                ) : (
                    /* Grid view — responsive columns based on panel width */
                    <div className={gridClass}>
                        {state.filteredCameras.map((camera) => (
                            <div
                                key={camera.id}
                                onClick={() => handleCameraClick(camera)}
                                className={`rounded-lg overflow-hidden transition-all cursor-pointer ${
                                    state.selectedCamera?.id === camera.id
                                        ? 'ring-2 ring-brand/60'
                                        : 'hover:ring-1 hover:ring-white/20'
                                }`}
                            >
                                <VideoTile camera={camera} compact />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer stats bar */}
            <div className="flex-shrink-0 px-4 py-3 border-t border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-online animate-pulse-dot" />
                    <span className="text-xs text-fg-muted">{onlineCount} online</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cam-offline" />
                    <span className="text-xs text-fg-muted">{offlineCount} offline</span>
                </div>
                <span className="text-xs text-fg-muted">{state.cameras.length} tổng</span>
            </div>
        </div>
    );
}
