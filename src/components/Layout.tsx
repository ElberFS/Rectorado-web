import React from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-900">
            <Sidebar />
            <main className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-y-auto ml-56">
                <div className="p-4 md:p-8 min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;