
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import BedGrid from '../components/features/BedGrid';
import { wardService, bedService, patientService } from '../services/api';
import { toast } from 'sonner';

import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';

const WardView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ward, setWard] = useState<any>(null);
    const [beds, setBeds] = useState<any[]>([]);
    const [selectedBed, setSelectedBed] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Feature 3: Ghost Locking
    const socket = useSocket();
    const [remoteLockedBeds, setRemoteLockedBeds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!socket) return;

        socket.on('bed-locked', ({ bedId }) => {
            setRemoteLockedBeds(prev => new Set(prev).add(bedId));
        });

        socket.on('bed-unlocked', ({ bedId }) => {
            setRemoteLockedBeds(prev => {
                const next = new Set(prev);
                next.delete(bedId);
                return next;
            });
        });

        socket.on('ward-updated', ({ wardId }) => {
            if (Number(id) === Number(wardId)) {
                fetchBeds();
            }
        });

        return () => {
            socket.off('bed-locked');
            socket.off('bed-unlocked');
            socket.off('ward-updated');
        };
    }, [socket, id]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Admit Patient Modal State
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
    const [newPatient, setNewPatient] = useState({ name: '', age: '', condition: 'NON_INFECTIOUS' });

    const fetchBeds = () => {
        if (id) {
            bedService.getAll(Number(id)).then(res => {
                setBeds(res.data);
                if (res.data.length > 0) {
                    const maxRow = Math.max(...res.data.map((b: any) => b.row)) + 1;
                    const maxCol = Math.max(...res.data.map((b: any) => b.col)) + 1;
                    setWard({ id, name: `Ward ${id}`, rowCount: maxRow, colCount: maxCol });
                }
            });
        }
    };

    useEffect(() => {
        fetchBeds();
    }, [id]);

    const handleAdmitPatient = async () => {
        if (!selectedBed) return;

        try {
            await patientService.create({
                ...newPatient,
                age: Number(newPatient.age),
                bedId: selectedBed.id,
            }, user?.name);
            setIsAdmitModalOpen(false);
            setSelectedBed(null);
            setNewPatient({ name: '', age: '', condition: 'NON_INFECTIOUS' }); // Reset form
            fetchBeds(); // Refresh grid
            alert('Patient admitted successfully!');
        } catch (error: any) {
            console.error('Failed to admit patient:', error);
            const message = error.response?.data?.error || 'Failed to admit patient';
            alert(message);
        }
    };

    const handleAutoAdmit = async () => {
        const name = prompt('Patient Name:');
        if (!name) return;
        const age = prompt('Patient Age:');
        if (!age) return;
        const condition = confirm('Is the patient INFECTIOUS? Click OK for Yes, Cancel for No.') ? 'INFECTIOUS' : 'NON_INFECTIOUS';

        try {
            await wardService.autoAdmit(Number(id), { name, age, condition });
            fetchBeds();
            alert('Patient auto-admitted successfully!');
        } catch (error: any) {
            console.error('Auto-admit failed:', error);
            alert(error.response?.data?.error || 'Failed to auto-admit');
        }
    };

    const handleDischarge = async () => {
        if (!selectedBed || !selectedBed.currentPatient) return;

        if (confirm(`Discharge patient ${selectedBed.currentPatient.name}?`)) {
            try {
                await patientService.discharge(selectedBed.currentPatient.id, user?.name);
                setSelectedBed(null);
                fetchBeds();
                alert('Patient discharged successfully');
            } catch (error: any) {
                console.error('Discharge failed:', error);
                alert('Failed to discharge patient');
            }
        }
    };

    const handleMaintenanceToggle = async () => {
        if (!selectedBed) return;
        const newStatus = selectedBed.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
        try {
            await bedService.updateStatus(selectedBed.id, newStatus, user?.name);
            setSelectedBed(null);
            fetchBeds();
        } catch (error) {
            console.error('Failed to update bed status:', error);
            alert('Failed to update bed status');
        }
    };

    const [riskBeds, setRiskBeds] = useState<Set<number>>(new Set());

    // Feature 1: Contagion Ripple
    const handleMarkPositive = async () => {
        if (!selectedBed?.currentPatient) return;

        try {
            // 1. Update Backend
            await patientService.updateCondition(selectedBed.currentPatient.id, 'INFECTIOUS', user?.name);

            // 2. Visual Update (Immediate Red Pulse via fetchBeds)
            await fetchBeds();

            // 3. Simulation Delay
            const toastId = toast.loading('Analyzing Contagion Risk...');

            setTimeout(() => {
                toast.dismiss(toastId);

                // 4. Calculate Neighbors
                const { row, col } = selectedBed;
                const neighbors = beds.filter(b =>
                    (b.row === row && Math.abs(b.col - col) === 1) ||
                    (b.col === col && Math.abs(b.row - row) === 1)
                );

                const neighborIds = new Set(neighbors.map(b => b.id));
                setRiskBeds(neighborIds);

                // 5. Alert
                toast.error('CRITICAL: Contagion Risk Detected. Immediate isolation required for neighboring patients.', {
                    duration: 5000,
                    style: { background: '#ef4444', color: 'white', border: 'none' }
                });

                // Clear risk after 5 seconds
                setTimeout(() => setRiskBeds(new Set()), 5000);
            }, 1500);

        } catch (error) {
            console.error('Failed to update condition:', error);
            toast.error('Failed to update patient condition');
        }
    };

    const [recommendedBedId, setRecommendedBedId] = useState<number | null>(null);

    // Feature 2: Smart Slot Recommendation
    const findOptimalBed = () => {
        const availableBeds = beds.filter(b => b.status === 'AVAILABLE');
        if (availableBeds.length === 0) {
            toast.error('No available beds to recommend.');
            return;
        }

        // Simple Heuristic: Maximize distance from occupied beds
        // For a real algo, we'd use BFS/Dijkstra, but here we iterate.
        let bestBed: any = null;
        let maxMinDist = -1;

        const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED');

        if (occupiedBeds.length === 0) {
            // If empty ward, pick top-left or random
            bestBed = availableBeds[0];
        } else {
            availableBeds.forEach(candidate => {
                let minDist = Infinity;
                occupiedBeds.forEach(occupied => {
                    const dist = Math.sqrt(Math.pow(candidate.row - occupied.row, 2) + Math.pow(candidate.col - occupied.col, 2));
                    if (dist < minDist) minDist = dist;
                });

                if (minDist > maxMinDist) {
                    maxMinDist = minDist;
                    bestBed = candidate;
                }
            });
        }

        if (bestBed) {
            setRecommendedBedId(bestBed.id);
            toast.success(`Optimal Slot Found: Pod ${bestBed.row}-${bestBed.col}`, {
                description: 'Maximizing isolation distance.',
                icon: '🧠'
            });
            // Auto-select after delay
            setTimeout(() => {
                setRecommendedBedId(null);
                setSelectedBed(bestBed);
            }, 2000);
        }
    };

    // Feature 4: Transfer Patient
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferTargetWardId, setTransferTargetWardId] = useState<number | null>(null);
    const [transferTargetBedId, setTransferTargetBedId] = useState<number | null>(null);
    const [availableTransferBeds, setAvailableTransferBeds] = useState<any[]>([]);

    useEffect(() => {
        if (transferTargetWardId) {
            bedService.getAll(transferTargetWardId).then(res => {
                setAvailableTransferBeds(res.data.filter((b: any) => b.status === 'AVAILABLE'));
            });
        }
    }, [transferTargetWardId]);

    const handleTransferPatient = async () => {
        if (!selectedBed?.currentPatient || !transferTargetBedId) return;

        try {
            await patientService.transfer(selectedBed.currentPatient.id, transferTargetBedId, user?.name); // Pass userName
            toast.success('Patient transferred successfully');
            setIsTransferModalOpen(false);
            setSelectedBed(null);
            fetchBeds(); // Refresh current grid
        } catch (error: any) {
            console.error('Transfer failed:', error);
            toast.error(error.response?.data?.error || 'Failed to transfer patient');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{ward?.name || 'Loading System...'}</h1>
                    <p className="text-emerald-100/60 mt-1">
                        {ward ? `Unit Configuration: ${ward.rowCount}x${ward.colCount} Grid` : 'Initializing...'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>&larr; Return to Command</Button>
                    <Button variant="secondary" onClick={findOptimalBed}>🧠 Auto-Assign Bed</Button>
                    <Button variant="glass" onClick={handleAutoAdmit}>⚡ Auto Admit</Button>

                    {selectedBed?.status === 'OCCUPIED' ? (
                        <Button variant="danger" onClick={handleDischarge}>Discharge Patient</Button>
                    ) : selectedBed?.status === 'MAINTENANCE' ? (
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-amber-100/60 uppercase tracking-wider">Maintenance Remaining</p>
                                <p className="text-xl font-mono text-amber-400 font-bold">
                                    {(() => {
                                        if (!selectedBed.maintenanceStartTime) return '20:00';
                                        const start = new Date(selectedBed.maintenanceStartTime).getTime();
                                        const now = currentTime.getTime();
                                        const elapsed = Math.floor((now - start) / 1000);
                                        const remaining = Math.max(0, 20 * 60 - elapsed);
                                        const mins = Math.floor(remaining / 60);
                                        const secs = remaining % 60;
                                        return `${mins}:${secs.toString().padStart(2, '0')}`;
                                    })()}
                                </p>
                            </div>
                            <Button variant="primary" onClick={handleMaintenanceToggle}>✅ Mark Ready</Button>
                        </div>
                    ) : (
                        <>
                            <Button variant="secondary" disabled={!selectedBed} onClick={handleMaintenanceToggle} className={!selectedBed ? 'opacity-50' : ''}>
                                🧹 Maintenance
                            </Button>
                            <Button
                                variant="primary"
                                disabled={!selectedBed}
                                onClick={() => setIsAdmitModalOpen(true)}
                                className={!selectedBed ? 'opacity-50' : 'animate-pulse-soft'}
                            >
                                {selectedBed ? `Admit to Pod ${selectedBed.row}-${selectedBed.col}` : 'Select Pod to Admit'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Modal isOpen={isAdmitModalOpen} onClose={() => setIsAdmitModalOpen(false)} title={`Admit Patient to Pod ${selectedBed?.row}-${selectedBed?.col}`}>
                <div className="space-y-4">
                    <Input
                        label="Patient Name"
                        value={newPatient.name}
                        onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                        placeholder="John Doe"
                    />
                    <Input
                        label="Age"
                        type="number"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                        placeholder="30"
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-emerald-100/80">Condition Status</label>
                        <select
                            className="glass-input w-full px-3 py-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-emerald-500/50"
                            value={newPatient.condition}
                            onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
                        >
                            <option value="NON_INFECTIOUS" className="text-gray-900">Non-Infectious (Standard)</option>
                            <option value="INFECTIOUS" className="text-gray-900">Infectious (Biohazard)</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setIsAdmitModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleAdmitPatient}>Confirm Admission</Button>
                    </div>
                </div>
            </Modal>

            {/* Patient Details Modal */}
            <Modal isOpen={!!selectedBed && selectedBed.status === 'OCCUPIED'} onClose={() => setSelectedBed(null)} title="Patient Medical Record">
                {selectedBed?.currentPatient && (
                    <div className="space-y-6">
                        {/* Patient Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{selectedBed.currentPatient.name}</h3>
                                <p className="text-emerald-100/60">Age: {selectedBed.currentPatient.age} • ID: #{selectedBed.currentPatient.id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${selectedBed.currentPatient.condition === 'INFECTIOUS'
                                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                }`}>
                                {selectedBed.currentPatient.condition}
                            </span>
                        </div>

                        {/* Vitals Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-black/20 p-4 rounded-lg border border-white/5 text-center">
                                <p className="text-emerald-100/40 text-xs uppercase tracking-wider mb-1">Heart Rate</p>
                                <span className="text-3xl font-mono text-emerald-400 font-bold">72</span>
                                <span className="text-xs text-emerald-100/60 block">bpm</span>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg border border-white/5 text-center">
                                <p className="text-blue-100/40 text-xs uppercase tracking-wider mb-1">SpO2</p>
                                <span className="text-3xl font-mono text-blue-400 font-bold">98</span>
                                <span className="text-xs text-blue-100/60 block">%</span>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg border border-white/5 text-center">
                                <p className="text-rose-100/40 text-xs uppercase tracking-wider mb-1">BP</p>
                                <span className="text-3xl font-mono text-rose-400 font-bold">120/80</span>
                                <span className="text-xs text-rose-100/60 block">mmHg</span>
                            </div>
                        </div>

                        {/* Live Graph Mock */}
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <p className="text-emerald-100/40 text-xs uppercase tracking-wider mb-2">Live ECG Telemetry</p>
                            <div className="h-16 flex items-center gap-1 overflow-hidden">
                                {[...Array(30)].map((_, i) => (
                                    <div key={i} className="w-1 bg-emerald-500/40 rounded-full transition-all duration-300" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-white/10">
                            {selectedBed.currentPatient.condition !== 'INFECTIOUS' && (
                                <Button variant="danger" onClick={handleMarkPositive}>⚠️ Mark Positive (Contagion)</Button>
                            )}
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setSelectedBed(null)}>Close</Button>
                                <Button variant="primary" onClick={() => setIsTransferModalOpen(true)}>Transfer</Button>
                                <Button variant="danger" onClick={handleDischarge}>Discharge Patient</Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Transfer Modal */}
            <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Transfer Patient">
                <div className="space-y-4">
                    <p className="text-emerald-100/80">Select a target location for <strong>{selectedBed?.currentPatient?.name}</strong>.</p>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-emerald-100/80">Target Ward</label>
                        <select
                            className="glass-input w-full px-3 py-2 rounded-lg"
                            value={transferTargetWardId || ''}
                            onChange={(e) => setTransferTargetWardId(Number(e.target.value))}
                        >
                            <option value="">Select Ward...</option>
                            {/* In a real app, fetch wards. For demo, we assume current ward or hardcoded list. 
                                Let's just allow transfer within current ward for now or fetch wards if we had a list.
                                Since we don't have a ward list in state easily, let's just show current ward and maybe ID 1, 2.
                                Actually, let's fetch wards on mount or just assume Ward 1, 2, 3 exist.
                            */}
                            <option value="1">Ward 1 (General)</option>
                            <option value="2">Ward 2 (ICU)</option>
                            <option value="3">Ward 3 (Isolation)</option>
                        </select>
                    </div>

                    {transferTargetWardId && (
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-emerald-100/80">Target Pod (Available)</label>
                            <select
                                className="glass-input w-full px-3 py-2 rounded-lg"
                                value={transferTargetBedId || ''}
                                onChange={(e) => setTransferTargetBedId(Number(e.target.value))}
                            >
                                <option value="">Select Pod...</option>
                                {availableTransferBeds.map(bed => (
                                    <option key={bed.id} value={bed.id}>
                                        Pod {bed.row}-{bed.col} ({bed.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setIsTransferModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleTransferPatient} disabled={!transferTargetBedId}>Confirm Transfer</Button>
                    </div>
                </div>
            </Modal>

            <div className="flex justify-center py-8">
                {ward ? (
                    <div className="space-y-6">
                        <BedGrid
                            rowCount={ward.rowCount}
                            colCount={ward.colCount}
                            beds={beds}
                            onBedClick={setSelectedBed}
                            selectedBedId={selectedBed?.id}
                            riskBeds={riskBeds}
                            recommendedBedId={recommendedBedId}
                            remoteLockedBeds={remoteLockedBeds}
                            onHover={(bedId) => socket?.emit('enter-hover', bedId)}
                            onLeave={(bedId) => socket?.emit('leave-hover', bedId)}
                        />

                        {/* Legend */}
                        <div className="flex justify-center gap-6 text-sm text-emerald-100/60 glass-panel py-3 px-6 rounded-full mx-auto w-fit">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></span>
                                <span>Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500 animate-pulse"></span>
                                <span>Occupied (Infectious)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]"></span>
                                <span>ICU Bed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-md bg-amber-500/10 border border-amber-500/30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #f59e0b 2px, #f59e0b 4px)' }}></span>
                                <span>Blocked (Risk)</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel p-12 rounded-xl text-center">
                        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-emerald-100/60">Loading Ward Data...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WardView;

