import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { wardService } from '../services/api';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [wards, setWards] = useState<any[]>([]);

    useEffect(() => {
        wardService.getAll().then(res => {
            setWards(res.data);
        });
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <Button onClick={() => console.log('Create Ward modal')}>Create Ward</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wards.length > 0 ? (
                    wards.map(ward => (
                        <div key={ward.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-medium text-gray-900">{ward.name}</h3>
                            <p className="mt-2 text-sm text-gray-500">Type: {ward.type}</p>
                            <p className="text-sm text-gray-500">Dimensions: {ward.rowCount}x{ward.colCount}</p>
                            <div className="mt-4">
                                <Button variant="secondary" size="sm" onClick={() => navigate(`/ward/${ward.id}`)}>
                                    View Details
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-3 text-center py-10">No wards found. Create one to get started.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
