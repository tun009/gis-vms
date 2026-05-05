import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet';
import 'leaflet-draw';
import { PenLine, RectangleHorizontal, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSpatialFilter } from '../../hooks/useSpatialFilter';
import { useToast } from '../../context/ToastContext';
import type { Camera } from '../../types';

type DrawTool = 'polygon' | 'rectangle' | null;

// Fix Leaflet default icon path
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createCameraIcon(status: Camera['status'], isSelected: boolean) {
    const colors: Record<Camera['status'], { fill: string }> = {
        online: { fill: '#27a644' },
        offline: { fill: '#ef4444' },
        error: { fill: '#f97316' },
        maintenance: { fill: '#8a8f98' },
    };
    const { fill } = colors[status];
    const size = isSelected ? 36 : 28;
    const outer = size + 16;

    const svg = `
    <svg width="${outer}" height="${outer}" viewBox="0 0 ${outer} ${outer}" xmlns="http://www.w3.org/2000/svg">
      ${isSelected ? `<circle cx="${outer / 2}" cy="${outer / 2}" r="${outer / 2 - 1}" fill="${fill}" opacity="0.25"/>` : ''}
      <circle cx="${outer / 2}" cy="${outer / 2}" r="${size / 2}" fill="${fill}" stroke="white" stroke-width="2.5"/>
      <g transform="translate(${(outer - 14) / 2},${(outer - 10) / 2})">
        <rect x="0" y="2" width="9" height="6" rx="1.5" fill="white"/>
        <path d="M9 3.5L13 1v8l-4-2.5V3.5Z" fill="white"/>
      </g>
    </svg>`;

    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [outer, outer],
        iconAnchor: [outer / 2, outer / 2],
        popupAnchor: [0, -(outer / 2)],
    });
}

const SHAPE_OPTIONS = {
    color: '#5e6ad2',
    fillColor: '#5e6ad2',
    fillOpacity: 0.12,
    weight: 2,
};

interface SelBox { x: number; y: number; w: number; h: number }

export default function MapView() {
    const { state, dispatch } = useApp();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Record<string, L.Marker>>({});
    const drawnLayersRef = useRef<L.FeatureGroup | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const polygonHandlerRef = useRef<any>(null);
    const [activeTool, setActiveTool] = useState<DrawTool>(null);
    const [selBox, setSelBox] = useState<SelBox | null>(null);
    const isRectDragging = useRef(false);
    const rectStart = useRef({ x: 0, y: 0 });
    const { filterCamerasInPolygon } = useSpatialFilter();
    const { showToast } = useToast();

    // ── Reset map state on unmount (route change) ────────────────────
    useEffect(() => {
        return () => {
            dispatch({ type: 'RESET_MAP_STATE' });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Initialize map ──────────────────────────────────────────────
    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [21.028, 105.854],
            zoom: 13,
            zoomControl: true,
        });

        // CartoDB Positron — clean light theme, Latin/international script, Vietnamese names
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20,
        }).addTo(map);

        const drawnLayers = new L.FeatureGroup().addTo(map);
        drawnLayersRef.current = drawnLayers;

        // L.Draw.Event.CREATED — only used for polygon tool
        map.on(L.Draw.Event.CREATED, (e: L.LeafletEvent) => {
            const event = e as L.DrawEvents.Created;
            drawnLayers.clearLayers();
            drawnLayers.addLayer(event.layer);
            const latlngs = (event.layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
            const coords = latlngs.map(ll => [ll.lat, ll.lng]);
            setActiveTool(null);
            dispatch({ type: 'SET_DRAWN_POLYGON', payload: coords });
            dispatch({ type: 'CLOSE_DETAIL' });
            dispatch({ type: 'SET_SELECTED_CAMERA', payload: null });
        });

        mapRef.current = map;

    // ── Auto-resize: tell Leaflet when its container changes size ─────
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const container = wrapperRef.current;
        const map = mapRef.current;
        if (!container || !map) return;

        const ro = new ResizeObserver(() => {
            map.invalidateSize({ animate: false });
        });
        ro.observe(container);
        return () => ro.disconnect();
    }, []);

    // ── Apply spatial filter when polygon changes ────────────────────
    useEffect(() => {
        if (!state.drawnPolygon) {
            dispatch({ type: 'SET_FILTERED_CAMERAS', payload: state.cameras });
            return;
        }
        const filtered = filterCamerasInPolygon(state.cameras, state.drawnPolygon);
        dispatch({ type: 'SET_FILTERED_CAMERAS', payload: filtered });
        const onlineCount = filtered.filter(c => c.status === 'online').length;
        showToast(
            filtered.length === 0
                ? 'Không tìm thấy camera trong vùng chọn'
                : `Tìm thấy ${filtered.length} camera trong vùng (${onlineCount} online)`,
            filtered.length === 0 ? 'warning' : 'success'
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.drawnPolygon]);

    // ── Polygon tool (leaflet-draw) ──────────────────────────────────
    const enablePolygon = useCallback(() => {
        if (!mapRef.current) return;
        polygonHandlerRef.current?.disable?.();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handler = new (L.Draw as any).Polygon(mapRef.current, {
            allowIntersection: false,
            shapeOptions: SHAPE_OPTIONS,
        });
        polygonHandlerRef.current = handler;
        handler.enable();
        setActiveTool('polygon');
    }, []);

    // ── Rectangle tool — Lightshot-style native drag ─────────────────
    useEffect(() => {
        if (activeTool !== 'rectangle' || !wrapperRef.current || !mapRef.current) return;

        const map = mapRef.current;
        const wrapper = wrapperRef.current;

        map.dragging.disable();
        map.scrollWheelZoom.disable();

        const onMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) return;
            const r = wrapper.getBoundingClientRect();
            rectStart.current = { x: e.clientX - r.left, y: e.clientY - r.top };
            isRectDragging.current = true;
            setSelBox({ x: rectStart.current.x, y: rectStart.current.y, w: 0, h: 0 });
            e.preventDefault();
            e.stopPropagation();
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isRectDragging.current) return;
            const r = wrapper.getBoundingClientRect();
            const cx = e.clientX - r.left;
            const cy = e.clientY - r.top;
            setSelBox({
                x: Math.min(rectStart.current.x, cx),
                y: Math.min(rectStart.current.y, cy),
                w: Math.abs(cx - rectStart.current.x),
                h: Math.abs(cy - rectStart.current.y),
            });
        };

        const onMouseUp = (e: MouseEvent) => {
            if (!isRectDragging.current) return;
            isRectDragging.current = false;
            setSelBox(null);

            const r = wrapper.getBoundingClientRect();
            const endX = e.clientX - r.left;
            const endY = e.clientY - r.top;

            const minX = Math.min(rectStart.current.x, endX);
            const maxX = Math.max(rectStart.current.x, endX);
            const minY = Math.min(rectStart.current.y, endY);
            const maxY = Math.max(rectStart.current.y, endY);

            if (maxX - minX < 10 || maxY - minY < 10) return; // too small

            // Convert pixel corners to lat/lng
            const nw = map.containerPointToLatLng(L.point(minX, minY));
            const se = map.containerPointToLatLng(L.point(maxX, maxY));
            const ne = L.latLng(nw.lat, se.lng);
            const sw = L.latLng(se.lat, nw.lng);

            // Draw rectangle on map
            const bounds = L.latLngBounds(nw, se);
            const rect = L.rectangle(bounds, SHAPE_OPTIONS);
            drawnLayersRef.current?.clearLayers();
            drawnLayersRef.current?.addLayer(rect);

            const coords = [
                [nw.lat, nw.lng],
                [ne.lat, ne.lng],
                [se.lat, se.lng],
                [sw.lat, sw.lng],
            ];

            setActiveTool(null);
            dispatch({ type: 'SET_DRAWN_POLYGON', payload: coords });
            dispatch({ type: 'CLOSE_DETAIL' });
            dispatch({ type: 'SET_SELECTED_CAMERA', payload: null });
        };

        wrapper.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            wrapper.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            setSelBox(null);
        };
    }, [activeTool, dispatch]);

    // ── Activate draw tool ───────────────────────────────────────────
    const activateDraw = useCallback((tool: DrawTool) => {
        // Always clear previous drawing when switching tools
        polygonHandlerRef.current?.disable?.();
        polygonHandlerRef.current = null;
        drawnLayersRef.current?.clearLayers();
        dispatch({ type: 'SET_DRAWN_POLYGON', payload: null });
        dispatch({ type: 'SET_FILTERED_CAMERAS', payload: state.cameras });

        if (tool === null || tool === activeTool) {
            setActiveTool(null);
            return;
        }
        if (tool === 'polygon') {
            enablePolygon();
        } else {
            setActiveTool('rectangle');
        }
    }, [activeTool, enablePolygon, dispatch, state.cameras]);

    // ── Clear polygon ────────────────────────────────────────────────
    const clearPolygon = useCallback(() => {
        polygonHandlerRef.current?.disable?.();
        polygonHandlerRef.current = null;
        drawnLayersRef.current?.clearLayers();
        dispatch({ type: 'SET_DRAWN_POLYGON', payload: null });
        dispatch({ type: 'SET_FILTERED_CAMERAS', payload: state.cameras });
        setActiveTool(null);
    }, [dispatch, state.cameras]);

    // ── Sync markers ─────────────────────────────────────────────────
    const updateMarkers = useCallback(() => {
        if (!mapRef.current) return;
        state.cameras.forEach((camera) => {
            const isSelected = state.selectedCamera?.id === camera.id;
            const isInFilter = state.drawnPolygon
                ? state.filteredCameras.some(c => c.id === camera.id)
                : true;
            const icon = createCameraIcon(camera.status, isSelected);

            if (markersRef.current[camera.id]) {
                markersRef.current[camera.id].setIcon(icon);
                const el = markersRef.current[camera.id].getElement();
                if (el) el.style.opacity = isInFilter ? '1' : '0.2';
            } else {
                const marker = L.marker([camera.lat, camera.lng], { icon });
                marker.on('click', () => {
                    dispatch({ type: 'SET_SELECTED_CAMERA', payload: camera });
                    dispatch({ type: 'OPEN_DETAIL' });
                });
                marker.addTo(mapRef.current!);
                markersRef.current[camera.id] = marker;
                if (!isInFilter && state.drawnPolygon) {
                    const el = marker.getElement();
                    if (el) el.style.opacity = '0.2';
                }
            }
        });
    }, [state.cameras, state.selectedCamera, state.filteredCameras, state.drawnPolygon, dispatch]);

    useEffect(() => { updateMarkers(); }, [updateMarkers]);


    // ── Sync external polygon clear ───────────────────────────────────
    useEffect(() => {
        if (!state.drawnPolygon && drawnLayersRef.current) {
            drawnLayersRef.current.clearLayers();
            polygonHandlerRef.current?.disable?.();
            polygonHandlerRef.current = null;
            setActiveTool(null);
        }
    }, [state.drawnPolygon]);



    // ── Fly to selected camera ───────────────────────────────────────
    useEffect(() => {
        if (state.selectedCamera && mapRef.current) {
            mapRef.current.flyTo([state.selectedCamera.lat, state.selectedCamera.lng], 15, { duration: 0.8 });
        }
    }, [state.selectedCamera]);

    const hasPolygon = state.drawnPolygon !== null;
    const isDrawing = activeTool !== null;

    return (
        <div
            ref={wrapperRef}
            className="w-full h-full relative"
            style={{
                minHeight: 0,
                cursor: activeTool === 'rectangle' ? 'crosshair' : 'default',
                userSelect: 'none',
            }}
        >
            {/* Leaflet map canvas */}
            <div ref={mapContainerRef} className="absolute inset-0" />



            {/* Lightshot-style selection box */}
            {selBox && selBox.w > 4 && selBox.h > 4 && (
                <div
                    className="absolute pointer-events-none z-[999]"
                    style={{
                        left: selBox.x,
                        top: selBox.y,
                        width: selBox.w,
                        height: selBox.h,
                        border: '2px solid #5e6ad2',
                        background: 'rgba(94,106,210,0.12)',
                        boxShadow: '0 0 0 1px rgba(94,106,210,0.3)',
                    }}
                />
            )}

            {/* ── Custom Floating Drawing Toolbar ── */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-0.5
                      bg-panel/95 backdrop-blur-md border border-white/[0.12]
                      rounded-2xl px-1.5 py-1.5 shadow-dialog">

                {/* Polygon tool */}
                <button
                    onClick={() => activateDraw('polygon')}
                    title="Vẽ đa giác — click từng điểm, double-click để đóng"
                    className={`p-2.5 rounded-xl transition-all ${activeTool === 'polygon'
                        ? 'bg-brand text-fg shadow-sm'
                        : 'text-fg-muted hover:text-fg hover:bg-white/[0.07]'
                        }`}
                >
                    <PenLine size={16} />
                </button>

                {/* Rectangle tool */}
                <button
                    onClick={() => activateDraw('rectangle')}
                    title="Chọn vùng — click giữ chuột và kéo"
                    className={`p-2.5 rounded-xl transition-all ${activeTool === 'rectangle'
                        ? 'bg-brand text-fg shadow-sm'
                        : 'text-fg-muted hover:text-fg hover:bg-white/[0.07]'
                        }`}
                >
                    <RectangleHorizontal size={16} />
                </button>

                {/* Divider + Cancel/Clear */}
                {(isDrawing || hasPolygon) && (
                    <>
                        <div className="w-px h-5 bg-white/[0.1] mx-0.5" />
                        {isDrawing && (
                            <button
                                onClick={() => activateDraw(null)}
                                title="Hủy"
                                className="p-2.5 rounded-xl text-fg-muted hover:text-fg hover:bg-white/[0.07] transition-all"
                            >
                                <X size={16} />
                            </button>
                        )}
                        {hasPolygon && !isDrawing && (
                            <button
                                onClick={clearPolygon}
                                title="Xóa vùng đã chọn"
                                className="p-2.5 rounded-xl text-cam-offline/80 hover:text-cam-offline hover:bg-cam-offline/10 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Drawing mode hint */}
            {isDrawing && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]
                        bg-panel/90 backdrop-blur-md border border-brand/30 rounded-full
                        px-4 py-1.5 flex items-center gap-2 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-dot" />
                    <span className="text-xs text-accent-light font-medium whitespace-nowrap">
                        {activeTool === 'polygon'
                            ? 'Click từng điểm → Double-click để hoàn thành'
                            : 'Giữ chuột và kéo để chọn vùng → Thả để xác nhận'}
                    </span>
                </div>
            )}
        </div>
    );
}
