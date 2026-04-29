import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Cctv, Cpu } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface LoginPageProps {
    onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const { showToast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            showToast('Đăng nhập thành công', 'success');
            onLogin();
        } else {
            showToast('Tài khoản hoặc mật khẩu không đúng (admin/admin)', 'error');
        }
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center flex justify-center items-center relative overflow-hidden"
            style={{ backgroundImage: "url('/bg-login.jpg')" }}
        >
            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />

            {/* Login Box */}
            <div
                className="relative z-10 w-full max-w-[480px] p-10 rounded-sm"
                style={{ backgroundColor: '#2f3442' }}
            >
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#355fb5] flex items-center justify-center mb-6 relative">
                        <Cctv size={32} className="text-white" strokeWidth={1.5} />
                        <div className="absolute -bottom-1 -right-1 bg-[#00c97b] rounded-full p-1 border-2 border-[#2f3442]">
                            <Cpu size={14} className="text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h1 className="text-xl font-medium text-white text-center leading-snug px-4">
                        AI Camera Monitoring System
                    </h1>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="flex flex-col w-full">

                    <div className="flex justify-end w-full mb-2">
                        <span className="text-[#00c97b] border border-[#00c97b] text-xs px-2 py-0.5 rounded-sm">
                            Authorized
                        </span>
                    </div>

                    <div className="flex items-center bg-[#252a35] border border-transparent rounded-sm h-12 px-4 mb-4 focus-within:border-[#00a8db] transition-colors relative overflow-hidden">
                        <User size={18} className="text-gray-400 mr-3 z-10" />
                        <input
                            type="text"
                            className="bg-transparent border-none w-full text-white placeholder-gray-500 focus:outline-none focus:ring-0 text-sm z-10"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ WebkitBoxShadow: '0 0 0px 1000px #252a35 inset', WebkitTextFillColor: 'white' }}
                        />
                    </div>

                    <div className="flex items-center bg-[#252a35] border border-transparent rounded-sm h-12 px-4 mb-6 focus-within:border-[#00a8db] transition-colors relative overflow-hidden">
                        <Lock size={18} className="text-gray-400 mr-3 z-10" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="bg-transparent border-none w-full text-white placeholder-gray-500 focus:outline-none focus:ring-0 text-sm font-sans z-10"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ WebkitBoxShadow: '0 0 0px 1000px #252a35 inset', WebkitTextFillColor: 'white' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-white z-10"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full h-11 bg-[#00a1d6] hover:bg-[#00b5f1] text-white font-medium rounded-sm transition-all mb-4"
                    >
                        Log In
                    </button>

                    <div className="flex items-center">
                        <label className="flex items-center cursor-pointer gap-2 group">
                            <div className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border transition-all ${remember ? 'bg-[#355fb5] border-[#355fb5]' : 'bg-[#252a35] border-gray-500 group-hover:border-[#355fb5]'}`}>
                                {remember && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            </div>
                            <input type="checkbox" className="hidden" checked={remember} onChange={() => setRemember(!remember)} />
                            <span className="text-xs text-[#355fb5]">Remember Password</span>
                        </label>
                    </div>
                </form>
            </div>
        </div>
    );
}
