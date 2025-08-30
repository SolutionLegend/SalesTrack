import React from 'react';
import { LogoIcon, InstallIcon } from './ui/Icons';

interface PwaInstallBannerProps {
    onInstall: () => void;
    onDismiss: () => void;
}

const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ onInstall, onDismiss }) => {
    return (
        <div className="fixed top-16 left-0 right-0 bg-blue-600 text-white z-40 shadow-lg animate-slide-down sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:max-w-2xl sm:rounded-b-lg">
            <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    <LogoIcon className="h-10 w-10 mr-4 hidden sm:block" />
                    <div>
                        <p className="font-bold">Get the Sales Tracker App</p>
                        <p className="text-sm">Install for offline access and a better experience.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                     <button
                        onClick={onInstall}
                        className="flex items-center justify-center px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-blue-600 bg-white rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                        <InstallIcon className="w-4 h-4 mr-2" />
                        Install
                    </button>
                    <button
                        onClick={onDismiss}
                        className="text-white hover:bg-blue-700 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Dismiss install banner"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slide-down {
                    from {
                        transform: translateY(-150%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-down {
                    animation: slide-down 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
        </div>
    );
};

export default PwaInstallBanner;
