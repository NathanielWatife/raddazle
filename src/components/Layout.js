import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

const Layout = ({ children }) => {
  useEffect(() => {
    // Apply light theme classes
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('theme-gold');
    document.body.classList.add('theme-gold-light');
    return () => document.body.classList.remove('theme-gold-light');
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-20 md:pt-24 min-h-screen bg-background">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
};

export default Layout;
