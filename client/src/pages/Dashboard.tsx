import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { wardService, patientService, statsService, simulationService, activityService } from '../services/api';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [wards, setWards] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newWard, setNewWard] = useState({ name: '', type: 'General', rowCount: 5, colCount: 6 });

    const fetchWards = () => {
        wardService.getAll().then(res => {
            setWards(res.data);
        }).catch(err => console.error('Failed to fetch wards:', err));
    };

    const [stats, setStats] = useState({ totalWards: 0, activePatients: 0, criticalAlerts: 0, systemStatus: 'Optimal' });
    const [activities, setActivities] = useState<any[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    const fetchStats = () => {
        statsService.get().then(res => setStats(res.data)).catch(console.error);
        activityService.get().then(res => setActivities(res.data)).catch(console.error);
    };

    useEffect(() => {
        fetchWards();
        fetchStats();
    }, []);

    const handleSimulation = async () => {
        setIsSimulating(true);
        try {
            const res = await simulationService.run();
            alert(`Simulation Step Complete:\nAdmitted: ${res.data.admitted.join(', ') || 'None'}\nDischarged: ${res.data.discharged.join(', ') || 'None'}`);
            fetchWards();
            fetchStats();
        } catch (error) {
            console.error('Simulation failed:', error);
            alert('Simulation failed');
        } finally {
            setIsSimulating(false);
        }
    };

    const handleCreateWard = async () => {
        try {
            await wardService.create(newWard);
            setIsModalOpen(false);
            fetchWards();
            fetchStats();
            setNewWard({ name: '', type: 'General', rowCount: 5, colCount: 6 }); // Reset form
        } catch (error) {
            console.error('Failed to create ward:', error);
            alert('Failed to create ward');
        }
    };

    const handleDeleteWard = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // Prevent navigation
        if (confirm('Are you sure you want to delete this ward? All patient data will be lost.')) {
            try {
                await wardService.delete(id);
                fetchWards();
                fetchStats();
            } catch (error) {
                console.error('Failed to delete ward:', error);
                alert('Failed to delete ward');
            }
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const res = await patientService.getAll(searchQuery);
            setSearchResults(res.data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Stats Data
    const statsData = [
        { label: 'Total Wards', value: stats.totalWards, color: 'text-emerald-400' },
        { label: 'Active Patients', value: stats.activePatients, color: 'text-blue-400' },
        { label: 'Critical Alerts', value: stats.criticalAlerts, color: 'text-rose-400' },
        { label: 'System Status', value: stats.systemStatus, color: 'text-emerald-400' },
    ];

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between gap-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
                    <p className="text-emerald-100/60 mt-1">Real-time isolation ward monitoring system</p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
                    <input
                        type="text"
                        placeholder="Search patient records..."
                        className="w-full glass-input px-4 py-2 rounded-lg pl-10 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute left-3 top-2.5 text-emerald-100/40">🔍</span>
                </form>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={handleSimulation} disabled={isSimulating}>
                        {isSimulating ? 'Running...' : '🚀 Run Simulation'}
                    </Button>
                    <Button variant="glass" onClick={() => setIsModalOpen(true)}>+ Create Ward</Button>
                </div>
            </div>

            {/* Search Results */}
            {searchQuery && (
                <div className="glass-panel p-6 rounded-xl animate-fade-in">
                    <h3 className="text-lg font-semibold text-white mb-4">Search Results</h3>
                    {isSearching ? (
                        <p className="text-emerald-100/60 animate-pulse">Searching records...</p>
                    ) : searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {searchResults.map(patient => (
                                <div key={patient.id} className="glass-card p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white">{patient.name}</p>
                                        <p className="text-sm text-emerald-100/60">Age: {patient.age} • {patient.condition}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-emerald-100/40">Ward {patient.bed?.wardId}</p>
                                        <p className="text-xs font-mono text-emerald-400">Pod {patient.bed?.row}-{patient.bed?.col}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-emerald-100/40 italic">No patients found matching "{searchQuery}"</p>
                    )}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                    <div key={index} className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center hover:bg-white/5 transition-colors">
                        <span className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</span>
                        <span className="text-sm text-emerald-100/60 uppercase tracking-wider font-semibold">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Wards List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active Wards
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {wards.length > 0 ? (
                            wards.map(ward => (
                                <div key={ward.id} className="glass-card p-6 rounded-xl relative group cursor-pointer" onClick={() => navigate(`/ward/${ward.id}`)}>
                                    <div className="absolute top-4 right-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            Active
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">{ward.name}</h3>
                                    <p className="text-emerald-100/60 text-sm mb-4">{ward.type} Unit</p>

                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-emerald-100/40">
                                            <div className="flex flex-col">
                                                <span>Capacity: <span className="text-white font-medium">{ward.rowCount * ward.colCount} Beds</span></span>
                                                <span className="mt-1">
                                                    Available: <span className="text-emerald-400 font-bold">
                                                        {ward.beds?.filter((b: any) => b.status === 'AVAILABLE').length || 0}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="danger" size="sm" onClick={(e) => handleDeleteWard(e, ward.id)}>Delete</Button>
                                            <Button variant="secondary" size="sm">Monitor &rarr;</Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 glass-panel p-12 rounded-xl text-center border-dashed border-2 border-white/10">
                                <p className="text-emerald-100/40 mb-4">No active isolation wards detected.</p>
                                <Button variant="glass" onClick={() => setIsModalOpen(true)}>Initialize First Ward</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                    <div className="glass-panel p-6 rounded-xl h-full min-h-[300px] max-h-[600px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            {activities.length > 0 ? (
                                activities.map((log: any) => (
                                    <div key={log.id} className="flex gap-4 items-start p-3 rounded-lg hover:bg-white/5 transition-colors">
                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${log.type === 'ADMISSION' ? 'bg-emerald-400' :
                                            log.type === 'DISCHARGE' ? 'bg-blue-400' :
                                                log.type === 'MAINTENANCE' ? 'bg-amber-400' : 'bg-gray-400'
                                            }`}></div>
                                        <div>
                                            <p className="text-sm text-emerald-100/80 leading-snug">{log.message}</p>
                                            <span className="text-xs text-emerald-100/40 mt-1 block">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-emerald-100/40 italic">No recent activity.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initialize New Ward">
                <div className="space-y-4">
                    <Input
                        label="Ward Designation"
                        value={newWard.name}
                        onChange={(e) => setNewWard({ ...newWard, name: e.target.value })}
                        placeholder="e.g., Alpha Block - Respiratory"
                    />
                    <Input
                        label="Unit Type"
                        value={newWard.type}
                        onChange={(e) => setNewWard({ ...newWard, type: e.target.value })}
                        placeholder="e.g., ICU / General / Quarantine"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Rows (Layout)"
                            type="number"
                            value={newWard.rowCount}
                            onChange={(e) => setNewWard({ ...newWard, rowCount: Number(e.target.value) })}
                        />
                        <Input
                            label="Columns (Layout)"
                            type="number"
                            value={newWard.colCount}
                            onChange={(e) => setNewWard({ ...newWard, colCount: Number(e.target.value) })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleCreateWard}>Initialize Ward</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
