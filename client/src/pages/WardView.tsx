import React from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/common/Button';

const WardView: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Ward {id}</h1>
                <div className="flex gap-2">
                    <Button variant="secondary">Back</Button>
                    <Button>Add Patient</Button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[400px] flex items-center justify-center">
                <p className="text-gray-500">Grid View Component Placeholder</p>
            </div>
        </div>
    );
};

export default WardView;
