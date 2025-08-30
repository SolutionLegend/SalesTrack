import React, { useEffect } from 'react';
import { InfoIcon, CheckCircleIcon } from './Icons';

type ToastType = 'success' | 'info' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    onDismiss: () => void;
}

const toastConfig = {
    success: {
        icon: CheckCircleIcon,
        bgClass: 'bg-green-500 dark:bg-green-600',
        textClass: 'text-white'
    },
    info: {
        icon: InfoIcon,
        bgClass: 'bg-yellow-500 dark:bg-yellow-600',
        textClass: 'text-white'
    },
    error: {
        icon: InfoIcon,
        bgClass: 'bg-red-500 dark:bg-red-600',
        textClass: 'text-white'
    }
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [onDismiss]);
    
    const config = toastConfig[type];
    const Icon = config.icon;

    return (
        <div 
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 max-w-sm w-full p-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 animate-fade-in-up ${config.bgClass} ${config.textClass}`}
            role="alert"
        >
            <Icon className="w-6 h-6 flex-shrink-0" />
            <span className="text-sm font-medium">{message}</span>
            <button
                onClick={onDismiss}
                className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-full inline-flex items-center justify-center hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Dismiss"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
            </button>
            <style>{`
                @keyframes fade-in-up {
                    from {
                        transform: translate(-50%, 20px);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, 0);
                        opacity: 1;
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Toast;
