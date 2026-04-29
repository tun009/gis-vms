import { useState } from 'react';
import { Palette, Globe, Info, Monitor, Sun, Moon } from 'lucide-react';

type Theme = 'dark' | 'light' | 'system';
type Language = 'vi' | 'en';

const THEME_KEY = 'vms-theme';
const LANG_KEY = 'vms-lang';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-fg-dim">{label}</span>
            <div className="flex-shrink-0">{children}</div>
        </div>
    );
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-panel">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <Icon size={15} className="text-fg-muted" />
                <span className="text-sm font-semibold text-fg">{title}</span>
            </div>
            <div className="divide-y divide-white/[0.05]">{children}</div>
        </div>
    );
}

export default function SettingsView() {
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || 'dark');
    const [lang, setLang] = useState<Language>(() => (localStorage.getItem(LANG_KEY) as Language) || 'vi');

    const applyTheme = (t: Theme) => {
        setTheme(t);
        localStorage.setItem(THEME_KEY, t);
        // Future: apply actual CSS class toggling here
    };

    const applyLang = (l: Language) => {
        setLang(l);
        localStorage.setItem(LANG_KEY, l);
    };

    const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    const langOptions: { value: Language; label: string; flag: string }[] = [
        { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
        { value: 'en', label: 'English', flag: '🇺🇸' },
    ];

    return (
        <div className="h-full overflow-y-auto px-6 py-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-xl font-semibold text-fg tracking-tight">Cài đặt</h1>
                <p className="text-sm text-fg-muted mt-1">Tùy chỉnh giao diện và trải nghiệm hệ thống</p>
            </div>

            <div className="space-y-5">
                {/* Theme */}
                <SectionCard icon={Palette} title="Giao diện">
                    <Row label="Chủ đề màu sắc">
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-elevated border border-white/[0.08]">
                            {themeOptions.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => applyTheme(value)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === value
                                        ? 'bg-brand text-white shadow-sm'
                                        : 'text-fg-muted hover:text-fg-dim'
                                        }`}
                                >
                                    <Icon size={13} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </Row>
                </SectionCard>

                {/* Language */}
                <SectionCard icon={Globe} title="Ngôn ngữ">
                    <Row label="Ngôn ngữ hiển thị">
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-elevated border border-white/[0.08]">
                            {langOptions.map(({ value, label, flag }) => (
                                <button
                                    key={value}
                                    onClick={() => applyLang(value)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${lang === value
                                        ? 'bg-brand text-white shadow-sm'
                                        : 'text-fg-muted hover:text-fg-dim'
                                        }`}
                                >
                                    <span>{flag}</span>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </Row>
                </SectionCard>

                {/* System info */}
                <SectionCard icon={Info} title="Thông tin hệ thống">
                    {[
                        { label: 'Phiên bản', value: 'v1.0.0' },
                        { label: 'Tài khoản', value: 'admin' },
                    ].map(({ label, value }) => (
                        <Row key={label} label={label}>
                            <span className="text-xs font-mono text-fg-muted bg-elevated border border-white/[0.06] rounded px-2 py-1">
                                {value}
                            </span>
                        </Row>
                    ))}
                </SectionCard>
            </div>
        </div>
    );
}
