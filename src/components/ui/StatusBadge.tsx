import type { CameraStatus } from '../../types';

interface StatusBadgeProps {
    status: CameraStatus;
    showLabel?: boolean;
    size?: 'sm' | 'md';
}

const config: Record<CameraStatus, { dot: string; label: string; text: string }> = {
    online: {
        dot: 'bg-online shadow-glow-online',
        label: 'Online',
        text: 'text-online',
    },
    offline: {
        dot: 'bg-cam-offline',
        label: 'Offline',
        text: 'text-cam-offline',
    },
    error: {
        dot: 'bg-cam-error',
        label: 'Lỗi',
        text: 'text-cam-error',
    },
    maintenance: {
        dot: 'bg-fg-muted',
        label: 'Bảo trì',
        text: 'text-fg-muted',
    },
};

export default function StatusBadge({ status, showLabel = true, size = 'sm' }: StatusBadgeProps) {
    const c = config[status];
    const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    return (
        <span className={`inline-flex items-center gap-1.5 ${textSize} font-medium ${c.text}`}>
            <span
                className={`${dotSize} rounded-full flex-shrink-0 ${c.dot} ${status === 'online' ? 'animate-pulse-dot' : ''
                    }`}
            />
            {showLabel && c.label}
        </span>
    );
}
