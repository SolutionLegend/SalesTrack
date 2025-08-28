
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';
import ManagerDashboard from '../components/ManagerDashboard';
import StaffDashboard from '../components/StaffDashboard';

const DashboardPage: React.FC = () => {
    const { currentUser } = useAppContext();

    if (!currentUser) {
        return null; // Or a loading spinner, though ProtectedRoute should prevent this
    }

    return (
        <div className="max-w-screen-xl mx-auto p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                    Welcome back, {currentUser.email} ({currentUser.role})
                </p>
            </header>
            
            {currentUser.role === Role.Manager ? <ManagerDashboard /> : <StaffDashboard />}
        </div>
    );
};

export default DashboardPage;
