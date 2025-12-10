import React, { useEffect, useState } from 'react';
import { patientService } from '../services/api';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const PatientsList: React.FC = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const res = await patientService.getAll(searchQuery);
            setPatients(res.data);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchPatients();
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleDischarge = async (patient: any) => {
        if (confirm(`Are you sure you want to discharge ${patient.name}?`)) {
            try {
                await patientService.discharge(patient.id);
                fetchPatients();
                if (selectedPatient?.id === patient.id) setSelectedPatient(null);
            } catch (error) {
                console.error('Failed to discharge patient:', error);
                alert('Failed to discharge patient');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Patient Registry</h1>
                    <p className="text-emerald-100/60 mt-1">Manage all admitted patients</p>
                </div>
                <div className="relative w-96">
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="w-full glass-input px-4 py-2 rounded-lg pl-10 focus:ring-2 focus:ring-emerald-500/50 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute left-3 top-2.5 text-emerald-100/40">🔍</span>
                </div>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-emerald-100/60 font-semibold text-sm uppercase tracking-wider">Patient Name</th>
                                <th className="p-4 text-emerald-100/60 font-semibold text-sm uppercase tracking-wider">Age</th>
                                <th className="p-4 text-emerald-100/60 font-semibold text-sm uppercase tracking-wider">Condition</th>
                                <th className="p-4 text-emerald-100/60 font-semibold text-sm uppercase tracking-wider">Location</th>
                                <th className="p-4 text-emerald-100/60 font-semibold text-sm uppercase tracking-wider">Admission Time</th>
                                <th className="p-4 text-emerald-100/60 font-semibold text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-emerald-100/40 animate-pulse">Loading registry...</td>
                                </tr>
                            ) : patients.length > 0 ? (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{patient.name}</div>
                                            <div className="text-xs text-emerald-100/40">ID: #{patient.id}</div>
                                        </td>
                                        <td className="p-4 text-emerald-100/80">{patient.age}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${patient.condition === 'INFECTIOUS'
                                                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                }`}>
                                                {patient.condition}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {patient.bed ? (
                                                <div>
                                                    <div className="text-white font-medium">{patient.bed.ward?.name || `Ward ${patient.bed.wardId}`}</div>
                                                    <div className="text-xs text-emerald-100/60 font-mono">Pod {patient.bed.row}-{patient.bed.col}</div>
                                                </div>
                                            ) : (
                                                <span className="text-amber-400/60 italic">Discharged / No Bed</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-emerald-100/60 text-sm">
                                            {new Date(patient.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <Button variant="secondary" size="sm" onClick={() => setSelectedPatient(patient)}>View Details</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDischarge(patient)}>Discharge</Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-emerald-100/40 italic">No patients found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Patient Details Modal */}
            <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title="Patient Medical Record">
                {selectedPatient && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{selectedPatient.name}</h3>
                                <p className="text-emerald-100/60">Age: {selectedPatient.age} • ID: #{selectedPatient.id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${selectedPatient.condition === 'INFECTIOUS'
                                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                }`}>
                                {selectedPatient.condition}
                            </span>
                        </div>

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

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <Button variant="secondary" onClick={() => setSelectedPatient(null)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PatientsList;
