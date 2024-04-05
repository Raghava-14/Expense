import React from 'react';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <main className={`container mx-auto px-4 ${isHomePage ? 'py-6' : 'pt-2 pb-6'} `} style={{ paddingTop: isHomePage ? '20px' : '10px' }}>
      {children}
    </main>
  );
};

export default Layout;