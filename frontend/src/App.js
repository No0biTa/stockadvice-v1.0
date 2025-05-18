import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import DevNoticeModal from './components/DevNoticeModal';
import Loader from './components/Loader';
import { popularStocks, stockCategories, companyProfiles, isIndonesianStock } from './components/utils/StockUtils';
import './App.css';

import { track } from '@vercel/analytics';

function RouteChangeTracker() {
  const location = useLocation();
  
  useEffect(() => {
    track('pageView', { path: location.pathname });
  }, [location]);
  
  return null;
}

// Lazy loading components untuk meningkatkan performa
const HomePage = lazy(() => import('./components/HomePage'));
const NewsPage = lazy(() => import('./components/NewsPage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const StockAnalysisPage = lazy(() => import('./components/StockAnalysisPage'));

function App() {
  // State for navigation
  const [currentPage, setCurrentPage] = useState('home');
  const [urlParams, setUrlParams] = useState(null);
  
  // State for modal notifications
  const [showDevNotice, setShowDevNotice] = useState(false);

  // Periksa localStorage saat komponen pertama kali dimount
  useEffect(() => {
    const hasAcknowledged = localStorage.getItem('devNoticeAcknowledged');
    
    if (!hasAcknowledged) {
      // Jika belum pernah acknowledge, tampilkan modal
      setShowDevNotice(true);
      document.body.classList.add('modal-open');
    } else if (hasAcknowledged !== 'permanent') {
      // Periksa timestamp untuk pengingat mingguan
      const acknowledgedTime = parseInt(hasAcknowledged, 10);
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 hari dalam milidetik
      
      if (Date.now() - acknowledgedTime > oneWeek) {
        setShowDevNotice(true);
        document.body.classList.add('modal-open');
      }
    }
  }, []);
  
  // Fungsi untuk menangani penutupan modal
  const handleCloseDevNotice = (shouldNotShowAgain) => {
    setShowDevNotice(false);
    document.body.classList.remove('modal-open');
    
    if (shouldNotShowAgain) {
      localStorage.setItem('devNoticeAcknowledged', 'permanent');
    } else {
      localStorage.setItem('devNoticeAcknowledged', Date.now().toString());
    }
  };

  // Check for URL parameters on component mount
  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const symbolParam = searchParams.get('symbol');

      if (path === '/stocks' || path.includes('/stocks')) {
        setCurrentPage('stocks');
        if (symbolParam) {
          setUrlParams({ symbol: symbolParam });
        }
      } else if (path === '/news' || path.includes('/news')) {
        setCurrentPage('news');
      } else if (path === '/about' || path.includes('/about')) {
        setCurrentPage('about');
      } else {
        setCurrentPage('home');
      }
    };

    // Initial navigation check
    handleNavigation();

    // Listen for popstate events (browser back/forward buttons)
    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  // Navigation function wrapped in useCallback
  const navigate = useCallback((page, params = {}) => {
    let url = page === 'home' ? '/' : `/${page}`;

    // Add query parameters if provided
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      url += `?${searchParams.toString()}`;
    }

    // Update browser history
    window.history.pushState({}, '', url);

    // Update state
    setCurrentPage(page);
    setUrlParams(params);
    
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  // Render the appropriate page based on currentPage
  if (currentPage === 'home') {
    return (
      <div className={`app-container ${showDevNotice ? 'blur-background' : ''}`}>
        <NavBar onNavigate={navigate} currentPage={currentPage} />
        <Suspense fallback={<div className="center-loader"><Loader /></div>}>
          <HomePage onNavigate={navigate} />
        </Suspense>
        <Footer />
        
        {/* Tambahkan DevNoticeModal */}
        <DevNoticeModal 
          isOpen={showDevNotice}
          onClose={handleCloseDevNotice}
        />
      </div>
    );
  }

  if (currentPage === 'news') {
    return (
      <div className={`app-container ${showDevNotice ? 'blur-background' : ''}`}>
        <NavBar onNavigate={navigate} currentPage={currentPage} />
        <Suspense fallback={<div className="center-loader"><Loader /></div>}>
          <NewsPage />
        </Suspense>
        <Footer />
        
        {/* Tambahkan DevNoticeModal */}
        <DevNoticeModal 
          isOpen={showDevNotice}
          onClose={handleCloseDevNotice}
        />
      </div>
    );
  }

  if (currentPage === 'about') {
    return (
      <div className={`app-container ${showDevNotice ? 'blur-background' : ''}`}>
        <NavBar onNavigate={navigate} currentPage={currentPage} />
        <Suspense fallback={<div className="center-loader"><Loader /></div>}>
          <AboutPage />
        </Suspense>
        <Footer />
        
        {/* Tambahkan DevNoticeModal */}
        <DevNoticeModal 
          isOpen={showDevNotice}
          onClose={handleCloseDevNotice}
        />
      </div>
    );
  }

  // Render stock analysis page
  return (
    <div className={`app-container ${showDevNotice ? 'blur-background' : ''}`}>
      <NavBar onNavigate={navigate} currentPage={currentPage} />
      <Suspense fallback={<div className="center-loader"><Loader /></div>}>
        <StockAnalysisPage 
          navigate={navigate}
          urlParams={urlParams}
          popularStocks={popularStocks}
          stockCategories={stockCategories}
          companyProfiles={companyProfiles}
          isIndonesianStock={isIndonesianStock}
        />
      </Suspense>
      <Footer />
      
      {/* Tambahkan DevNoticeModal */}
      <DevNoticeModal 
        isOpen={showDevNotice}
        onClose={handleCloseDevNotice}
      />
    </div>
  );
}

export default App;