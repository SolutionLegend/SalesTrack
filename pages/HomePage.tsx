
import React from 'react';
import { Link } from 'react-router-dom';
import { AnalyticsIcon, CloudIcon, OfflineIcon } from '../components/ui/Icons';

const HomePage: React.FC = () => {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Hero Section */}
            <section className="bg-white dark:bg-gray-800">
                <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
                    <div className="mr-auto place-self-center lg:col-span-7">
                        <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">
                            Track Sales, Anywhere. Online or Offline.
                        </h1>

                        <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
                            A modern, lightweight sales tracker that works seamlessly whether you're connected or not. Empower your team with real-time insights and offline capabilities.
                        </p>
                        <Link
                            to="/signup"
                            className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
                        >
                            Get started
                            <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                        >
                            Login
                        </Link>
                    </div>
                    <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
                        <img src="https://picsum.photos/id/10/500/500" alt="mockup" className="rounded-lg shadow-xl"/>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold dark:text-white">Why SalesTrack?</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Everything you need in a modern sales tracker.</p>
                    </div>
                    <div className="flex flex-wrap -mx-4">
                        <FeatureCard
                            icon={<OfflineIcon className="w-12 h-12 text-blue-500" />}
                            title="Offline First"
                            description="Never lose a sale. Our app is fully functional even without an internet connection. Data syncs when you're back online."
                        />
                        <FeatureCard
                            icon={<AnalyticsIcon className="w-12 h-12 text-blue-500" />}
                            title="Powerful Analytics"
                            description="For managers, unlock deep insights with our comprehensive dashboard, charts, and reporting tools."
                        />
                        <FeatureCard
                            icon={<CloudIcon className="w-12 h-12 text-blue-500" />}
                            title="No Backend Needed"
                            description="Runs entirely in your browser using local storage. Your data stays with you, ensuring privacy and speed."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="w-full md:w-1/3 px-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="mb-4">{icon}</div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{description}</p>
            </div>
        </div>
    );
}

export default HomePage;
