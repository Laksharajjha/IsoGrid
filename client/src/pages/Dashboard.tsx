import React from 'react';
import Button from '../components/common/Button';

const Dashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <Button>Create Ward</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Ward cards will go here */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Isolation Ward A</h3>
                    <p className="mt-2 text-sm text-gray-500">Capacity: 20 beds</p>
                    <div className="mt-4">
                        <Button variant="secondary" size="sm">View Details</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
