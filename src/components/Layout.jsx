import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
 const [sidebarOpen, setSidebarOpen] = useState(false);

 return (
 <div className="flex bg-dark-950 min-h-screen">
 {/* Skip to main content link - keyboard accessible */}
 <a
   href="#main-content"
   className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:bg-brand-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
 >
   Ir al contenido principal
 </a>

 <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
 <div className="flex flex-1 min-w-0 flex-col lg:ml-64">
 <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
 <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-950">
 <div className="p-6 md:p-8">
 <Outlet />
 </div>
 </main>
 </div>
 </div>
 );
};

export default Layout;
