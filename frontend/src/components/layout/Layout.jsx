import React, { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation();
  const mainScrollRef = useRef(null);

  return (
    <div className='h-screen flex flex-col overflow-hidden'>
      <Navbar />
      <div className="flex flex-row flex-1 overflow-hidden">
        <Sidebar />
        <main
          ref={mainScrollRef}
          className={`flex-1 p-8 my-3 overflow-y-scroll custom-scrollbar`}>
          <AnimatePresence mode="wait">
            <div key={location.pathname}>
              <Outlet context={{ scrollContainerRef: mainScrollRef }} />
            </div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
