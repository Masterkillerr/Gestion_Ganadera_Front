import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
 const [sidebarOpen, setSidebarOpen] = useState(false);

 return (
 <div className="flex bg-dark-950 min-h-screen">
 <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
 <div className="flex flex-1 min-w-0 flex-col lg:ml-64">
 <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
 <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-950">
 <div className="p-6 md:p-8">
 <Outlet />
 </div>
 </main>
 </div>
 </div>
 );
};

export default Layout;
