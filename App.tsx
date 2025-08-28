
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import { ChartBarIcon, LogoutIcon } from './components/ui/Icons';

// --- Layout Components ---

const Navbar: React.FC = () => {
    const { isAuthenticated, logout } = useAppContext();

    return (
        <nav className="bg-white/80 dark:bg-gray-800/80 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600 backdrop-blur-sm">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <ChartBarIcon className="h-8 text-blue-500" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Sales Tracker</span>
                </Link>
                <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mr-2">Dashboard</Link>
                            <button onClick={logout} className="text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:focus:ring-gray-800 flex items-center">
                                <LogoutIcon className="h-5 w-5 mr-2" /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:focus:ring-gray-800 mr-2">Login</Link>
                            <Link to="/signup" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};


const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <a href="#" className="hover:underline">Sales Tracker™</a>. All Rights Reserved.
                    </span>
                    <div className="flex mt-4 sm:justify-center sm:mt-0">
                        {/* Social icons can go here */}
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
        return <Navigate to="/login" replace />;
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
                </div>
            </HashRouter>
        </AppProvider>
    );
}

// A wrapper component is needed because Navbar uses useAppContext, which needs to be inside the provider.
const NavbarWrapper: React.FC = () => {
    return <Navbar />;
};

export default App;