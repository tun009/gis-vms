import type { CameraStatus } from '../../types';

interface StatusBadgeProps {
    status: CameraStatus;
    showLabel?: boolean;
    size?: 'sm' | 'md';
}

const config: Record<CameraStatus, { dot: string; label: string; text: string; bg: string }> = {
    online: {
        dot: 'bg-online',
        label: 'Online',
        text: 'text-online',
        bg: 'bg-online/10 border-online/25',
    },
    offline: {
        dot: 'bg-cam-offline',
        label: 'Offline',
        text: 'text-cam-offline',
        bg: 'bg-cam-offline/10 border-cam-offline/25',
    },
    error: {
        dot: 'bg-cam-error',
        label: 'Lỗi',
        text: 'text-cam-error',
        bg: 'bg-cam-error/10 border-cam-error/25',
    },
    maintenance: {
        dot: 'bg-fg-muted',
        label: 'Bảo trì',
        text: 'text-fg-muted',
        bg: 'bg-fg-muted/10 border-fg-muted/25',
    },
};

export default function StatusBadge({ status, showLabel = true, size = 'sm' }: StatusBadgeProps) {
    const c = config[status];
    const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    if (!showLabel) {
        return (
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${c.bg}`}>
                <span className={`${dotSize} rounded-full ${c.dot} ${status === 'online' ? 'animate-pulse-dot' : ''}`} />
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${c.text} ${c.bg}`}>
            <span className={`${dotSize} rounded-full flex-shrink-0 ${c.dot} ${status === 'online' ? 'animate-pulse-dot' : ''}`} />
            {c.label}
        </span>
    );
}
