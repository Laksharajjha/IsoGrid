import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen">
            <header className="glass-panel border-x-0 border-t-0 rounded-none sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">IsoGrid</span>
                        </div>
                        <nav className="flex gap-6">
                            <a href="/dashboard" className="text-emerald-100/80 hover:text-white font-medium transition-colors">Dashboard</a>
                            <a href="/patients" className="text-emerald-100/80 hover:text-white font-medium transition-colors">Patients</a>
                        </nav>
                    </div>

                    {user && (
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                                <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase mt-1">{user.role}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
