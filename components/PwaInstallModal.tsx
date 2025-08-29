import React from 'react';
import { LogoIcon, InstallIcon } from './ui/Icons';

interface PwaInstallModalProps {
    onInstall: () => void;
    onDismiss: () => void;
}

const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ onInstall, onDismiss }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end sm:items-center p-4 transition-opacity duration-300">
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 text-center transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up"
                style={{ animation: 'fade-in-up 0.3s ease-out forwards' }}
            >
                <div className="flex justify-center mb-4">
                    <LogoIcon className="h-12 w-12" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Install Sales Tracker</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Get the full app experience. Add Sales Tracker to your home screen for fast access and offline capabilities.
                </p>
                <div className="flex flex-col space-y-3">
                    <button
                        onClick={onInstall}
                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                    >
                        <InstallIcon className="w-5 h-5 mr-2" />
                        Install App
                    </button>
                    <button
                        onClick={onDismiss}
                        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Not Now
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fade-in-up {
                    animation-name: fade-in-up;
                }
            `}</style>
        </div>
    );
};

export default PwaInstallModal;
