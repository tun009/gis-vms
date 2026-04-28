/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Linear Design System - Background Surfaces
                'base': '#08090a',
                'panel': '#0f1011',
                'elevated': '#191a1b',
                'raised': '#28282c',
                // Linear Design System - Foreground / Text
                'fg': '#f7f8f8',
                'fg-dim': '#d0d6e0',
                'fg-muted': '#8a8f98',
                'fg-subtle': '#62666d',
                // Linear Design System - Brand / Accent
                'brand': '#5e6ad2',
                'accent': '#7170ff',
                'accent-light': '#828fff',
                // Status Colors
                'online': '#27a644',
                'online-dim': '#10b981',
                'cam-offline': '#ef4444',
                'cam-error': '#f97316',
                // Border
                'line': '#23252a',
                'line-dim': '#34343a',
            },
            fontFamily: {
                sans: ['Inter', 'SF Pro Display', '-apple-system', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
            },
            boxShadow: {
                'surface': '0 0 0 1px rgba(255,255,255,0.08)',
                'elevated': '0 2px 4px rgba(0,0,0,0.4)',
                'dialog': '0 8px 2px rgba(0,0,0,0), 0 5px 2px rgba(0,0,0,0.01), 0 3px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.08)',
                'inset-deep': 'inset 0 0 12px 0 rgba(0,0,0,0.2)',
                'glow-brand': '0 0 20px rgba(94,106,210,0.3)',
                'glow-online': '0 0 12px rgba(39,166,68,0.4)',
                'glow-offline': '0 0 12px rgba(239,68,68,0.4)',
            },
            animation: {
                'pulse-dot': 'pulseDot 2s ease-in-out infinite',
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-right': 'slideRight 0.3s ease-out',
                'slide-left': 'slideLeft 0.3s ease-out',
            },
            keyframes: {
                pulseDot: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.5', transform: 'scale(0.8)' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(4px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideLeft: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
