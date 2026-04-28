import { Settings, Info, Database, Server } from 'lucide-react';

export default function SettingsView() {
    return (
        <div className="h-full overflow-y-auto px-6 py-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-xl font-medium text-fg tracking-tight">Cài đặt Hệ thống</h1>
                <p className="text-sm text-fg-muted mt-1">Cấu hình GIS VMS Prototype</p>
            </div>

            {/* Prototype notice */}
            <div className="flex gap-3 p-4 rounded-lg bg-brand/10 border border-brand/20 mb-6">
                <Info size={16} className="text-brand flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-fg">Chế độ Prototype</p>
                    <p className="text-xs text-fg-muted mt-1 leading-relaxed">
                        Hệ thống đang chạy với dữ liệu giả lập (mock data). Luồng video được giả lập bằng file MP4 lặp lại.
                        Để chuyển sang Production, cần tích hợp backend NestJS + PostgreSQL/PostGIS + MediaMTX.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* System info */}
                <div className="card-linear overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                        <Database size={14} className="text-fg-muted" />
                        <span className="text-sm font-medium text-fg">Nguồn dữ liệu</span>
                    </div>
                    <div className="divide-y divide-white/[0.05]">
                        {[
                            { label: 'Loại dữ liệu', value: 'JSON tĩnh (mock)' },
                            { label: 'Số lượng camera', value: '15 thiết bị' },
                            { label: 'Video stream', value: 'MP4 loop (giả lập RTSP)' },
                            { label: 'Tính toán không gian', value: 'Turf.js (client-side)' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between px-4 py-2.5">
                                <span className="text-xs text-fg-muted">{label}</span>
                                <span className="text-xs text-fg-dim font-mono">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map settings */}
                <div className="card-linear overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                        <Settings size={14} className="text-fg-muted" />
                        <span className="text-sm font-medium text-fg">Bản đồ</span>
                    </div>
                    <div className="divide-y divide-white/[0.05]">
                        {[
                            { label: 'Nhà cung cấp', value: 'OpenStreetMap (Leaflet.js)' },
                            { label: 'API Key', value: 'Không cần' },
                            { label: 'Vị trí trung tâm', value: 'Hà Nội, Việt Nam' },
                            { label: 'Zoom mặc định', value: '13' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between px-4 py-2.5">
                                <span className="text-xs text-fg-muted">{label}</span>
                                <span className="text-xs text-fg-dim font-mono">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tech stack */}
                <div className="card-linear overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                        <Server size={14} className="text-fg-muted" />
                        <span className="text-sm font-medium text-fg">Tech Stack</span>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap gap-2">
                        {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS v3', 'Leaflet.js', 'leaflet-draw', 'Turf.js', 'Lucide React'].map((tech) => (
                            <span key={tech} className="text-[11px] px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-fg-dim">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
