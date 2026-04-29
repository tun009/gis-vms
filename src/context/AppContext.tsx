import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, AppAction, Camera } from '../types';
import camerasData from '../data/cameras.json';

const initialState: AppState = {
    cameras: camerasData as Camera[],
    filteredCameras: camerasData as Camera[],
    selectedCamera: null,
    activeView: 'map',
    drawMode: 'idle',
    drawnPolygon: null,
    searchQuery: '',
    manufacturerFilter: 'all',
    statusFilter: 'all',
    gridLayout: '2x2',
    isSidebarOpen: true,
    isDetailOpen: false,
};

function reducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_SELECTED_CAMERA':
            // Selecting a camera shows the floating map panel but NOT the right detail panel
            return { ...state, selectedCamera: action.payload };
        case 'SET_ACTIVE_VIEW':
            return { ...state, activeView: action.payload, selectedCamera: null, isDetailOpen: false };
        case 'SET_DRAW_MODE':
            return { ...state, drawMode: action.payload };
        case 'SET_DRAWN_POLYGON':
            return { ...state, drawnPolygon: action.payload, drawMode: action.payload ? 'drawn' : 'idle' };
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'SET_MANUFACTURER_FILTER':
            return { ...state, manufacturerFilter: action.payload };
        case 'SET_STATUS_FILTER':
            return { ...state, statusFilter: action.payload };
        case 'SET_FILTERED_CAMERAS':
            return { ...state, filteredCameras: action.payload };
        case 'SET_GRID_LAYOUT':
            return { ...state, gridLayout: action.payload };
        case 'TOGGLE_SIDEBAR':
            return { ...state, isSidebarOpen: !state.isSidebarOpen };
        case 'OPEN_DETAIL':
            return { ...state, isDetailOpen: true };
        case 'CLOSE_DETAIL':
            // Close detail panel only, keep camera selected (map panel stays)
            return { ...state, isDetailOpen: false };
        case 'RESET_MAP_STATE':
            // Called when leaving the map route — clear all transient map state
            return {
                ...state,
                selectedCamera: null,
                isDetailOpen: false,
                drawMode: 'idle',
                drawnPolygon: null,
                filteredCameras: state.cameras,
                searchQuery: '',
                manufacturerFilter: 'all',
                statusFilter: 'all',
            };
        default:
            return state;
    }
}

interface AppContextValue {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Apply filters whenever search/filter state changes
    useEffect(() => {
        let result = state.cameras;

        if (state.drawnPolygon) {
            // Spatial filter is handled by useSpatialFilter hook
            // filtered cameras are set via SET_FILTERED_CAMERAS action
            return;
        }

        if (state.searchQuery.trim()) {
            const q = state.searchQuery.toLowerCase();
            result = result.filter(
                (cam) =>
                    cam.name.toLowerCase().includes(q) ||
                    cam.ip.toLowerCase().includes(q) ||
                    cam.location.toLowerCase().includes(q)
            );
        }

        if (state.manufacturerFilter !== 'all') {
            result = result.filter((cam) => cam.manufacturer === state.manufacturerFilter);
        }

        if (state.statusFilter !== 'all') {
            result = result.filter((cam) => cam.status === state.statusFilter);
        }

        dispatch({ type: 'SET_FILTERED_CAMERAS', payload: result });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.searchQuery, state.manufacturerFilter, state.statusFilter, state.drawnPolygon, state.cameras]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
