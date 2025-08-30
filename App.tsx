
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import { LogoIcon, LogoutIcon, MoonIcon, SunIcon, InstallIcon } from './components/ui/Icons';
import PwaInstallBanner from './components/PwaInstallBanner';
import Toast from './components/ui/Toast';

// --- Layout Components ---

const Navbar: React.FC = () => {
    const { isAuthenticated, logout, theme, toggleTheme, installPrompt, handleInstallClick } = useAppContext();

    return (
        <nav className="bg-white/80 dark:bg-gray-800/80 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600 backdrop-blur-sm">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <LogoIcon className="h-8 w-8" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Sales Tracker</span>
                </Link>
                <div className="flex items-center md:order-2 space-x-2 rtl:space-x-reverse">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                        aria-label="Toggle light/dark theme"
                    >
                        {theme === 'dark' ? (
                            <SunIcon className="w-5 h-5" />
                        ) : (
                            <MoonIcon className="w-5 h-5" />
                        )}
                    </button>
                    {installPrompt && (
                         <button
                            type="button"
                            onClick={handleInstallClick}
                            className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 flex items-center"
                            aria-label="Install App"
                        >
                            <InstallIcon className="w-5 h-5 mr-2 -ml-1" />
                            Install
                        </button>
                    )}
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Dashboard</Link>
                            <button onClick={logout} className="text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:focus:ring-gray-800 flex items-center">
                                <LogoutIcon className="h-5 w-5 mr-2" /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:focus:ring-gray-800">Login</Link>
                            <Link to="/signup" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};


const Footer: React.FC = () => {
    const { isOnline } = useAppContext();
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <a href="#" className="hover:underline">Sales Tracker™</a>. All Rights Reserved.
                    </span>
                    <div className="flex mt-4 sm:justify-center sm:mt-0 items-center">
                       <div className={`flex items-center text-sm font-medium ${isOnline ? 'text-green-500' : 'text-yellow-500'}`}>
                             <span className="relative flex h-3 w-3 mr-2">
                                {!isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            </span>
                            {isOnline ? 'Online' : 'Offline'}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};


// --- Protected Route Component ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAppContext();
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return <>{children}</>;
};

// --- App Component ---
function App() {
    return (
        <AppProvider>
            <HashRouter>
                <div className="flex flex-col min-h-screen">
                    <NavbarWrapper />
                    <main className="flex-grow pt-16">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<AuthPage mode="login" />} />
                            <Route path="/signup" element={<AuthPage mode="signup" />} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <DashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                             <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                    <Footer />
                    <ToastManager />
                </div>
            </HashRouter>
        </AppProvider>
    );
}

// A wrapper component is needed because Navbar uses useAppContext, which needs to be inside the provider.
const NavbarWrapper: React.FC = () => {
    const { isInstallBannerVisible, handleInstallClick, dismissInstallBanner } = useAppContext();
    return (
        <>
            <Navbar />
            {isInstallBannerVisible && (
                <PwaInstallBanner
                    onInstall={handleInstallClick}
                    onDismiss={dismissInstallBanner}
                />
            )}
        </>
    );
};

const ToastManager: React.FC = () => {
    const { toast, dismissToast } = useAppContext();
    if (!toast) return null;
    return <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />;
};


export default App;
