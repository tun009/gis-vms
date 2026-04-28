import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet';
import 'leaflet-draw';
import { useApp } from '../../context/AppContext';
import { useSpatialFilter } from '../../hooks/useSpatialFilter';
import type { Camera } from '../../types';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createCameraIcon(status: Camera['status'], isSelected: boolean) {
    const colors: Record<Camera['status'], { fill: string; glow: string }> = {
        online: { fill: '#27a644', glow: 'rgba(39,166,68,0.5)' },
        offline: { fill: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
        error: { fill: '#f97316', glow: 'rgba(249,115,22,0.4)' },
        maintenance: { fill: '#8a8f98', glow: 'rgba(138,143,152,0.3)' },
    };
    const { fill, glow } = colors[status];
    const size = isSelected ? 36 : 28;
    const outerSize = size + 16;

    const svg = `
    <svg width="${outerSize}" height="${outerSize}" viewBox="0 0 ${outerSize} ${outerSize}" xmlns="http://www.w3.org/2000/svg">
      ${isSelected ? `<circle cx="${outerSize / 2}" cy="${outerSize / 2}" r="${outerSize / 2 - 1}" fill="${glow}" opacity="0.4"/>` : ''}
      <circle cx="${outerSize / 2}" cy="${outerSize / 2}" r="${size / 2}" fill="${fill}" stroke="white" stroke-width="2"/>
      <g transform="translate(${(outerSize - 14) / 2},${(outerSize - 10) / 2})">
        <rect x="0" y="2" width="9" height="6" rx="1.5" fill="white"/>
        <path d="M9 3.5L13 1v8l-4-2.5V3.5Z" fill="white"/>
      </g>
    </svg>`;

    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [outerSize, outerSize],
        iconAnchor: [outerSize / 2, outerSize / 2],
        popupAnchor: [0, -(outerSize / 2)],
    });
}

export default function MapView() {
    const { state, dispatch } = useApp();
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<Record<string, L.Marker>>({});
    const drawnLayersRef = useRef<L.FeatureGroup | null>(null);
    const drawControlRef = useRef<L.Control | null>(null);
    const { filterCamerasInPolygon } = useSpatialFilter();

    // Initialize map
    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [21.028, 105.854],
            zoom: 13,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        // Drawn layers group
        const drawnLayers = new L.FeatureGroup();
        drawnLayers.addTo(map);
        drawnLayersRef.current = drawnLayers;

        // Leaflet Draw control
        const drawControl = new (L.Control as unknown as { Draw: new (opts: unknown) => L.Control }).Draw({
            position: 'topright',
            draw: {
                polygon: {
                    allowIntersection: false,
                    shapeOptions: {
                        color: '#5e6ad2',
                        fillColor: '#5e6ad2',
                        fillOpacity: 0.12,
                        weight: 2,
                    },
                },
                polyline: false,
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
            },
            edit: { featureGroup: drawnLayers },
        });
        drawControl.addTo(map);
        drawControlRef.current = drawControl;

        // Polygon drawn
        map.on(L.Draw.Event.CREATED, (e: L.LeafletEvent) => {
            const event = e as L.DrawEvents.Created;
            drawnLayers.clearLayers();
            drawnLayers.addLayer(event.layer);

            const latlngs = (event.layer as L.Polygon).getLatLngs()[0] as L.LatLng[];
            const coords = latlngs.map(ll => [ll.lat, ll.lng]);

            const filtered = filterCamerasInPolygon(state.cameras, coords);
            dispatch({ type: 'SET_DRAWN_POLYGON', payload: coords });
            dispatch({ type: 'SET_FILTERED_CAMERAS', payload: filtered });
        });

        // Polygon deleted/edited
        map.on(L.Draw.Event.DELETED, () => {
            dispatch({ type: 'SET_DRAWN_POLYGON', payload: null });
            dispatch({ type: 'SET_FILTERED_CAMERAS', payload: state.cameras });
        });

        mapRef.current = map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync markers
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
                if (el) el.style.opacity = isInFilter ? '1' : '0.25';
            } else {
                const marker = L.marker([camera.lat, camera.lng], { icon });

                // Popup
                const popupContent = `
          <div style="padding:10px 12px;min-width:180px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="width:7px;height:7px;border-radius:50%;background:${camera.status === 'online' ? '#27a644' : '#ef4444'};flex-shrink:0"></span>
              <span style="font-size:12px;color:#f7f8f8;font-weight:500">${camera.name}</span>
            </div>
            <p style="font-family:monospace;font-size:11px;color:#8a8f98;margin:0 0 4px">${camera.ip}</p>
            <p style="font-size:11px;color:#62666d;margin:0">${camera.manufacturer} · ${camera.model}</p>
            <button
              onclick="window.dispatchEvent(new CustomEvent('select-camera', {detail:'${camera.id}'}))"
              style="margin-top:8px;width:100%;padding:5px 8px;background:#5e6ad2;color:white;border:none;border-radius:5px;font-size:12px;cursor:pointer"
            >Xem Stream</button>
          </div>`;

                marker.bindPopup(popupContent, { maxWidth: 220 });
                marker.on('click', () => dispatch({ type: 'SET_SELECTED_CAMERA', payload: camera }));
                marker.addTo(mapRef.current!);
                markersRef.current[camera.id] = marker;
                if (!isInFilter && state.drawnPolygon) {
                    const el = marker.getElement();
                    if (el) el.style.opacity = '0.25';
                }
            }
        });
    }, [state.cameras, state.selectedCamera, state.filteredCameras, state.drawnPolygon, dispatch]);

    useEffect(() => { updateMarkers(); }, [updateMarkers]);

    // Listen for popup cam select button
    useEffect(() => {
        const handler = (e: Event) => {
            const id = (e as CustomEvent<string>).detail;
            const cam = state.cameras.find(c => c.id === id);
            if (cam) dispatch({ type: 'SET_SELECTED_CAMERA', payload: cam });
        };
        window.addEventListener('select-camera', handler);
        return () => window.removeEventListener('select-camera', handler);
    }, [state.cameras, dispatch]);

    // Clear polygon from outside
    useEffect(() => {
        if (!state.drawnPolygon && drawnLayersRef.current) {
            drawnLayersRef.current.clearLayers();
        }
    }, [state.drawnPolygon]);

    // Fly to selected camera
    useEffect(() => {
        if (state.selectedCamera && mapRef.current) {
            mapRef.current.flyTo(
                [state.selectedCamera.lat, state.selectedCamera.lng],
                15,
                { duration: 0.8 }
            );
        }
    }, [state.selectedCamera]);

    return (
        <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ minHeight: 0 }}
        />
    );
}
