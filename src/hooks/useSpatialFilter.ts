import { useCallback } from 'react';
import * as turf from '@turf/turf';
import type { Camera } from '../types';

export function useSpatialFilter() {
    const filterCamerasInPolygon = useCallback(
        (cameras: Camera[], polygonLatLngs: number[][]): Camera[] => {
            if (!polygonLatLngs || polygonLatLngs.length < 3) return cameras;

            // Convert Leaflet LatLngs [lat, lng] to GeoJSON [lng, lat]
            const coordinates = polygonLatLngs.map(([lat, lng]) => [lng, lat]);

            // Ensure polygon is closed (first point === last point)
            if (
                coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
                coordinates[0][1] !== coordinates[coordinates.length - 1][1]
            ) {
                coordinates.push(coordinates[0]);
            }

            const polygon = turf.polygon([coordinates]);

            return cameras.filter((camera) => {
                const point = turf.point([camera.lng, camera.lat]);
                return turf.booleanPointInPolygon(point, polygon);
            });
        },
        []
    );

    return { filterCamerasInPolygon };
}
