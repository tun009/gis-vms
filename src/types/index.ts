export type CameraStatus = 'online' | 'offline' | 'error' | 'maintenance';
export type Manufacturer = 'Dahua' | 'Hikvision';
export type ViewMode = 'map' | 'monitor' | 'settings';
export type DrawMode = 'idle' | 'drawing' | 'drawn';
export type GridLayout = '2x2' | '4x4';

export interface Camera {
    id: string;
    name: string;
    manufacturer: Manufacturer;
    model: string;
    lat: number;
    lng: number;
    ip: string;
    rtspUrl: string;
    videoSrc: string;
    status: CameraStatus;
    capabilities: string[];
    location: string;
    installedAt: string;
}

export interface AppState {
    cameras: Camera[];
    filteredCameras: Camera[];
    selectedCamera: Camera | null;
    activeView: ViewMode;
    drawMode: DrawMode;
    drawnPolygon: number[][] | null;
    searchQuery: string;
    manufacturerFilter: Manufacturer | 'all';
    statusFilter: CameraStatus | 'all';
    gridLayout: GridLayout;
    isSidebarOpen: boolean;
    isDetailOpen: boolean;
}

export type AppAction =
    | { type: 'SET_SELECTED_CAMERA'; payload: Camera | null }
    | { type: 'SET_ACTIVE_VIEW'; payload: ViewMode }
    | { type: 'SET_DRAW_MODE'; payload: DrawMode }
    | { type: 'SET_DRAWN_POLYGON'; payload: number[][] | null }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_MANUFACTURER_FILTER'; payload: Manufacturer | 'all' }
    | { type: 'SET_STATUS_FILTER'; payload: CameraStatus | 'all' }
    | { type: 'SET_FILTERED_CAMERAS'; payload: Camera[] }
    | { type: 'SET_GRID_LAYOUT'; payload: GridLayout }
    | { type: 'TOGGLE_SIDEBAR' }
    | { type: 'OPEN_DETAIL' }
    | { type: 'CLOSE_DETAIL' }
    | { type: 'RESET_MAP_STATE' };
