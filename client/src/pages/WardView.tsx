
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import BedGrid from '../components/features/BedGrid';
import { wardService, bedService } from '../services/api';

const WardView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ward, setWard] = useState<any>(null);
    const [beds, setBeds] = useState<any[]>([]);
    const [selectedBed, setSelectedBed] = useState<any>(null);

    useEffect(() => {
        if (id) {
            // Mock fetching ward details (since we only have getAll currently, ideally we'd have getById)
            // For now, let's assume we fetch all and find one, or just fetch beds
            // In a real app, we'd add wardService.getById(id)

            // Fetch beds for this ward
            bedService.getAll(Number(id)).then(res => {
                setBeds(res.data);
                // Infer ward dimensions from beds if we can't fetch ward details yet
                // Or just use hardcoded defaults for demo if ward fetch isn't ready
                if (res.data.length > 0) {
                    // This is a temporary hack until we have ward details endpoint
                    const maxRow = Math.max(...res.data.map((b: any) => b.row)) + 1;
                    const maxCol = Math.max(...res.data.map((b: any) => b.col)) + 1;
                    setWard({ id, name: `Ward ${id} `, rowCount: maxRow, colCount: maxCol });
                }
            });
        }
    }, [id]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{ward?.name || 'Loading...'}</h1>
                    <p className="text-gray-500">Select a bed to admit a patient</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back</Button>
                    <Button disabled={!selectedBed}>Admit Patient</Button>
                </div>
            </div>

            <div className="flex justify-center">
                {ward ? (
                    <BedGrid
                        rowCount={ward.rowCount}
                        colCount={ward.colCount}
                        beds={beds}
                        onBedClick={setSelectedBed}
                        selectedBedId={selectedBed?.id}
                    />
                ) : (
                    <div className="text-gray-500">Loading Ward Data...</div>
                )}
            </div>
        </div>
    );
};

export default WardView;

