import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [name, setName] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'DOCTOR' | 'NURSE'>('DOCTOR');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            login(name, role);
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <span className="text-3xl">🏥</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white font-mono tracking-wider">ISOGRID SYSTEM</h1>
                    <p className="text-emerald-100/60 text-sm mt-2 font-mono">SECURE ACCESS TERMINAL</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-emerald-100/60 uppercase tracking-widest">Medical ID / Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                            placeholder="DR. SMITH"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-emerald-100/60 uppercase tracking-widest">Clearance Level</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as any)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono appearance-none"
                        >
                            <option value="DOCTOR" className="bg-slate-800">DOCTOR</option>
                            <option value="NURSE" className="bg-slate-800">NURSE</option>
                            <option value="ADMIN" className="bg-slate-800">ADMINISTRATOR</option>
                        </select>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-colors font-mono tracking-wide shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    >
                        ACCESS SYSTEM &rarr;
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-[10px] text-white/20 font-mono">
                        UNAUTHORIZED ACCESS IS PROHIBITED.<br />
                        SESSION ID: {Math.random().toString(36).substring(7).toUpperCase()}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
