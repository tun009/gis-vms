import { MapPin } from 'lucide-react';
import type { Camera } from '../../types';
import StatusBadge from '../ui/StatusBadge';

interface CameraCardProps {
    camera: Camera;
    isSelected: boolean;
    isHighlighted?: boolean;
    onClick: () => void;
}

const manufacturerStyle: Record<string, string> = {
    Dahua: 'text-brand bg-brand/15 border-brand/30',
    Hikvision: 'text-accent-light bg-accent/15 border-accent/30',
};

export default function CameraCard({ camera, isSelected, isHighlighted, onClick }: CameraCardProps) {
    const dimmed = isHighlighted === false;

    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3.5 py-3 rounded-lg border transition-all duration-150 group
        ${isSelected
                    ? 'bg-brand/15 border-brand/40 shadow-glow-brand'
                    : dimmed
                        ? 'bg-elevated/30 border-white/[0.06] opacity-40 hover:opacity-60'
                        : 'bg-elevated border-white/[0.12] hover:bg-raised hover:border-white/[0.2]'
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    {/* Camera name — always clearly readable */}
                    <p className={`text-sm font-semibold leading-snug truncate
            ${isSelected ? 'text-fg' : 'text-fg group-hover:text-fg'}`}>
                        {camera.name}
                    </p>

                    {/* IP address */}
                    <p className="text-fg-muted font-mono text-xs mt-1 tracking-wide">
                        {camera.ip}
                    </p>

                    {/* Location + manufacturer */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 min-w-0">
                            <MapPin size={11} className="text-fg-muted flex-shrink-0" />
                            <span className="text-fg-muted text-xs truncate">{camera.location}</span>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0
              ${manufacturerStyle[camera.manufacturer] ?? 'text-fg-muted border-white/20'}`}>
                            {camera.manufacturer}
                        </span>
                    </div>
                </div>

                {/* Status badge */}
                <div className="flex-shrink-0 mt-0.5">
                    <StatusBadge status={camera.status} showLabel={false} size="sm" />
                </div>
            </div>
        </button>
    );
}
