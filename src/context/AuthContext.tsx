import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextValue {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => localStorage.getItem('isAuthenticated') === 'true'
    );
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();

    const login = () => {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
        navigate('/map', { replace: true });
    };

    const logout = () => {
        setLoggingOut(true);
        setTimeout(() => {
            localStorage.removeItem('isAuthenticated');
            setIsAuthenticated(false);
            setLoggingOut(false);
            navigate('/login', { replace: true });
        }, 1200);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}

            {/* Logout loading overlay */}
            {loggingOut && (
                <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        {/* Spinner */}
                        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white animate-spin" />
                        <p className="text-sm text-white/70 font-medium tracking-wide">Đang đăng xuất...</p>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

