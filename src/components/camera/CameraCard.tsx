import { MapPin } from 'lucide-react';
import type { Camera } from '../../types';
import StatusBadge from '../ui/StatusBadge';

interface CameraCardProps {
    camera: Camera;
    isSelected: boolean;
    isHighlighted?: boolean;
    onClick: () => void;
}

const manufacturerColors: Record<string, string> = {
    Dahua: 'text-brand bg-brand/10 border-brand/20',
    Hikvision: 'text-accent-light bg-accent/10 border-accent/20',
};

export default function CameraCard({ camera, isSelected, isHighlighted, onClick }: CameraCardProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-150 group
        ${isSelected
                    ? 'bg-brand/15 border-brand/30 shadow-glow-brand'
                    : isHighlighted
                        ? 'bg-elevated border-white/[0.12] hover:bg-raised hover:border-white/[0.18]'
                        : 'bg-elevated/50 border-white/[0.06] hover:bg-elevated hover:border-white/[0.12] opacity-60 hover:opacity-80'
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    {/* Camera name */}
                    <p className={`text-sm font-medium truncate leading-tight
            ${isSelected ? 'text-fg' : 'text-fg-dim group-hover:text-fg'}`}>
                        {camera.name}
                    </p>

                    {/* IP address - monospace */}
                    <p className="text-fg-subtle font-mono text-[11px] mt-0.5 tracking-wide">
                        {camera.ip}
                    </p>

                    {/* Location + manufacturer */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin size={10} className="text-fg-subtle flex-shrink-0" />
                        <span className="text-fg-subtle text-[10px] truncate">{camera.location}</span>
                        <span className={`text-[10px] px-1.5 py-px rounded border font-medium flex-shrink-0 ${manufacturerColors[camera.manufacturer] ?? 'text-fg-muted'}`}>
                            {camera.manufacturer}
                        </span>
                    </div>
                </div>

                {/* Status */}
                <StatusBadge status={camera.status} showLabel={false} size="sm" />
            </div>
        </button>
    );
}
