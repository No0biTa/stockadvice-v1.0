import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import Loader from './Loader';
import useStockAPI from '../components/hooks/useStockAPI';
import DevNoticeModal from './DevNoticeModal';
import '../styles/StockAnalysisPage.css';

// Lazy loading StockChart
const StockChart = lazy(() => import('./StockChart'));

// Custom hook for interval functionality
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// Helper functions
function formatDateForInput(date) {
  return date.toISOString().split('T')[0];
}

function formatDateTime(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function formatPrice(price, currency = 'Rp') {
  if (price === null || price === undefined) return '-';
  return `${currency} ${price.toLocaleString('id-ID')}`;
}

function getRelativeTime(date) {
  if (!date) return '';

  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  if (interval === 1) return '1 year ago';

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  if (interval === 1) return '1 month ago';

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  if (interval === 1) return '1 day ago';

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  if (interval === 1) return '1 hour ago';

  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  if (interval === 1) return '1 minute ago';

  return seconds < 5 ? 'just now' : `${seconds} seconds ago`;
}

const StockAnalysisPage = ({ 
  navigate, 
  urlParams,
  popularStocks,
  stockCategories,
  companyProfiles,
  isIndonesianStock
}) => {
  // State variables for stock functionality
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState('Rp');
  const [realtime, setRealtime] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [lastFetched, setLastFetched] = useState(null);
  const [dataInfo, setDataInfo] = useState({
    isRealtime: false,
    delay: "15-20 minutes",
    source: "Yahoo Finance"
  });
  const [showChart, setShowChart] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('1mo');
  const [chartInterval, setChartInterval] = useState('1d');
  const [useDateRange, setUseDateRange] = useState(false);
  const [chartType, setChartType] = useState('composed');
  const [activeSymbol, setActiveSymbol] = useState('');

  // State for dropdown and category management
  const [showStocksList, setShowStocksList] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTimeout, setFilterTimeout] = useState(null);
  const [isScrollingTabs, setIsScrollingTabs] = useState(false);
  const scrollTimeout = useRef();

  // State for storing last prices of stocks
  const [stockPrices, setStockPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  // State for tracking screen width
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // State for preloaded categories
  const [preloadedCategories, setPreloadedCategories] = useState({});

  // Di bagian state, tambahkan state untuk overlay search
  const [overlaySearchVisible, setOverlaySearchVisible] = useState(false);
  const [overlaySearchTerm, setOverlaySearchTerm] = useState('');

  // State untuk DevNoticeModal
  const [symbol, setSymbol] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(() => {
    // Cek nilai hideDevNotice
    const hideDevNotice = localStorage.getItem('hideDevNotice');
    // Cek apakah ada timestamp
    const hideDevNoticeTime = localStorage.getItem('hideDevNoticeTime');
    
    // Jika hideDevNotice ada, periksa apakah sudah 2 jam
    if (hideDevNotice === 'true' && hideDevNoticeTime) {
      const now = Date.now();
      const savedTime = parseInt(hideDevNoticeTime, 10);
      
      // Selalu gunakan 2 jam (dalam milidetik) untuk semua environment
      const twoHours = 2 * 60 * 60 * 1000; // 2 jam dalam milidetik
      
      // Jika lebih dari 2 jam, reset localStorage dan tampilkan modal
      if (now - savedTime > twoHours) {
        localStorage.removeItem('hideDevNotice');
        localStorage.removeItem('hideDevNoticeTime');
        return true; // Tampilkan modal
      }
      
      // Belum 2 jam, ikuti setting hideDevNotice
      return false; // Jangan tampilkan modal
    }
    
    // Default: Tampilkan modal jika hideDevNotice tidak ada
    return hideDevNotice !== 'true';
  });

  // Tambahkan state dan ref untuk dropdown positioning
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, bottom: 'auto', left: 0, width: 0 });
  const inputGroupRef = useRef(null);
  const symbolInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calculate default dates (1 month ago to current date)
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const [startDate, setStartDate] = useState(formatDateForInput(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDateForInput(new Date()));

  // Stock API with cache - use the hook directly inside the component
  const { fetchStock, preloadStockData } = useStockAPI();

  // Calculate if we're in mobile view
  const isMobileView = windowWidth < 768;
  const isSmallMobile = windowWidth < 576;
  const isLargeScreen = windowWidth >= 1400;

  // Handle tab scroll for mobile
  const handleTabScroll = () => {
    setIsScrollingTabs(true);
    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrollingTabs(false);
    }, 150);
  };

  // Fungsi untuk update posisi dropdown - IMPROVED VERSION
  const updateDropdownPosition = () => {
    if (inputGroupRef.current && showStocksList) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Untuk layar kecil, gunakan design bottom sheet
      if (viewportWidth < 576) {
        // Untuk mobile, gunakan layout bottom sheet
        setDropdownPosition({
          top: 'auto',
          bottom: 0,
          left: 0,
          width: '100%'
        });
      } else {
        // Untuk layar yang lebih besar
        const rect = inputGroupRef.current.getBoundingClientRect();
        const navbarElement = document.querySelector('header, nav');
        const navbarHeight = navbarElement ? navbarElement.getBoundingClientRect().height : 60;
        
        // Hitung posisi dropdown
        let topPosition = rect.bottom;
        let leftPosition = rect.left;
        
        // Batasi lebar dropdown
        let dropdownWidth = Math.min(600, Math.max(320, rect.width));
        
        // Pastikan dropdown tidak keluar dari viewport
        if (leftPosition + dropdownWidth > viewportWidth) {
          leftPosition = Math.max(10, viewportWidth - dropdownWidth - 10);
        }
        
        // Pastikan posisi top tidak terlalu rendah
        const maxTop = viewportHeight - 100;
        if (topPosition > maxTop) {
          topPosition = rect.top - 320; // Posisikan di atas input
        }
        
        setDropdownPosition({
          top: topPosition,
          bottom: 'auto',
          left: leftPosition,
          width: dropdownWidth
        });
      }
    }
  };

  useEffect(() => {
      if (showStocksList) {
        // Cari semua input dalam overlay
        const overlayInputs = document.querySelectorAll('.overlay-search');
        
        // Fungsi untuk mencegah dropdown tertutup saat focus/click pada input
        const preventDropdownClose = (e) => {
          e.stopPropagation();
        };
        
        // Tambahkan event listener ke semua input
        overlayInputs.forEach(input => {
          input.addEventListener('click', preventDropdownClose);
          input.addEventListener('focus', preventDropdownClose);
          input.addEventListener('touchstart', preventDropdownClose);
        });
        
        return () => {
          // Cleanup event listener
          overlayInputs.forEach(input => {
            input.removeEventListener('click', preventDropdownClose);
            input.removeEventListener('focus', preventDropdownClose);
            input.removeEventListener('touchstart', preventDropdownClose);
          });
        };
      }
    }, [showStocksList]);

  // Update posisi dropdown saat scroll
  useEffect(() => {
    if (showStocksList) {
      // Tambahkan kelas no-scroll pada body untuk mencegah scroll
      document.body.classList.add('no-scroll');

      // Fungsi untuk menangani perubahan viewport saat keyboard muncul
        const handleVisualViewport = () => {
          if (window.visualViewport) {
            // Perbarui posisi dropdown saat viewport berubah (keyboard muncul/menghilang)
            if (window.innerWidth <= 576) {
              // Untuk mobile, selalu gunakan layout bottom sheet
              setDropdownPosition({
                top: 'auto',
                bottom: 0,
                left: 0,
                width: '100%'
              });
              
              // Force re-render untuk memastikan dropdown tetap terlihat
              if (dropdownRef.current) {
                dropdownRef.current.style.transform = 'translateZ(0)';
              }
            }
          }
        };

      // Tambahkan event listener untuk visualViewport
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleVisualViewport);
        window.visualViewport.addEventListener('scroll', handleVisualViewport);
      }
      
      // Update position awal
      updateDropdownPosition();
      
      const handleScroll = (e) => {
          // Pastikan e.target ada dan valid sebelum mencoba menggunakan closest
          if (!e || !e.target) return;
          
          // Periksa apakah target memiliki metode closest
          const hasClosestMethod = typeof e.target.closest === 'function';
          
          // Jangan tutup dropdown jika scroll terjadi di dalam dropdown
          if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
            return;
          }
          
          // Jangan tutup dropdown jika scroll terjadi di overlay search
          // Gunakan metode closest jika tersedia, jika tidak gunakan alternatif
          if (hasClosestMethod && e.target.closest('.overlay-search-container')) {
            return;
          } else if (!hasClosestMethod) {
            // Alternatif untuk browser yang tidak mendukung closest
            let element = e.target;
            let isInSearchContainer = false;
            
            // Traversal manual untuk memeriksa jika elemen berada dalam overlay-search-container
            while (element) {
              if (element.classList && element.classList.contains('overlay-search-container')) {
                isInSearchContainer = true;
                break;
              }
              element = element.parentElement;
            }
            
            if (isInSearchContainer) {
              return;
            }
          }
          
          // Untuk scroll di luar dropdown, tutup dropdown
          setShowStocksList(false);
        };
      
      // Tambahkan event listener untuk scroll
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', updateDropdownPosition);
      
      // Clean up
      return () => {
        document.body.classList.remove('no-scroll');
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleVisualViewport);
          window.visualViewport.removeEventListener('scroll', handleVisualViewport);
        }
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [showStocksList]);

  // Tambahkan event listener untuk scroll pada tabs
  useEffect(() => {
    const tabsElement = document.querySelector('.stock-category-tabs');
    if (tabsElement && windowWidth < 768) {
      tabsElement.addEventListener('scroll', handleTabScroll);
      return () => {
        tabsElement.removeEventListener('scroll', handleTabScroll);
      };
    }
  }, [windowWidth, showStocksList]);

  // Modifikasi useEffect untuk mengecek modal saat mount
  useEffect(() => {
    // Cek nilai hideDevNotice dan timestamp
    const hideDevNotice = localStorage.getItem('hideDevNotice');
    const hideDevNoticeTime = localStorage.getItem('hideDevNoticeTime');
    
    if (hideDevNotice === 'true' && hideDevNoticeTime) {
      const now = Date.now();
      const savedTime = parseInt(hideDevNoticeTime, 10);
      const twoHours = 2 * 60 * 60 * 1000; // 2 jam dalam milidetik
      
      if (now - savedTime > twoHours) {
        // Lebih dari 2 jam, reset localStorage dan tampilkan modal
        localStorage.removeItem('hideDevNotice');
        localStorage.removeItem('hideDevNoticeTime');
        setIsModalOpen(true);
      }
    } else if (hideDevNotice !== 'true') {
      // Jika hideDevNotice tidak ada atau bukan true, tampilkan modal
      setIsModalOpen(true);
    }
  }, []);

  // Modifikasi handler untuk menutup modal
  const handleCloseModal = (dontShowAgain) => {
    if (dontShowAgain) {
      // Jika dicentang "jangan tampilkan lagi", simpan preference dan timestamp
      localStorage.setItem('hideDevNotice', 'true');
      localStorage.setItem('hideDevNoticeTime', Date.now().toString());
    } else {
      // Jika tidak dicentang, hapus setting (akan tampil lagi saat refresh)
      localStorage.removeItem('hideDevNotice');
      localStorage.removeItem('hideDevNoticeTime');
    }
    
    // Selalu tutup modal saat ini
    setIsModalOpen(false);
  };

  // Tambahkan useEffect untuk melakukan pengecekan periodis
  useEffect(() => {
    // Jika modal tidak tampil, lakukan pengecekan timer
    if (!isModalOpen) {
      // Interval untuk mengecek apakah sudah waktunya menampilkan modal kembali
      const timerInterval = setInterval(() => {
        const hideDevNotice = localStorage.getItem('hideDevNotice');
        const hideDevNoticeTime = localStorage.getItem('hideDevNoticeTime');
        
        if (hideDevNotice === 'true' && hideDevNoticeTime) {
          const now = Date.now();
          const savedTime = parseInt(hideDevNoticeTime, 10);
          const twoHours = 2 * 60 * 60 * 1000; // 2 jam dalam milidetik
          
          if (now - savedTime > twoHours) {
            // Lebih dari 2 jam, reset localStorage dan tampilkan modal
            localStorage.removeItem('hideDevNotice');
            localStorage.removeItem('hideDevNoticeTime');
            setIsModalOpen(true);
          }
        }
      }, 5000); // Cek setiap 5 detik
      
      // Cleanup interval saat komponen unmount atau modal ditampilkan
      return () => clearInterval(timerInterval);
    }
  }, [isModalOpen]);

  // Tambahkan useEffect untuk mengatur efek blur saat modal terbuka
  useEffect(() => {
    const contentContainer = document.querySelector('.app-content');
    if (contentContainer) {
      if (isModalOpen) {
        // Tambahkan class blur saat modal terbuka
        contentContainer.classList.add('blur-background');
        // Nonaktifkan scrolling pada body
        document.body.style.overflow = 'hidden';
      } else {
        // Hapus class blur saat modal tertutup
        contentContainer.classList.remove('blur-background');
        // Aktifkan kembali scrolling
        document.body.style.overflow = 'auto';
      }
    }
    
    // Pembersihan saat komponen unmount
    return () => {
      const contentContainer = document.querySelector('.app-content');
      if (contentContainer) {
        contentContainer.classList.remove('blur-background');
      }
      // Pastikan scrolling diaktifkan kembali saat komponen unmount
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  // Memoized handlers
  const memoizedFetchStockData = useCallback(async (symbolToFetch = null) => {
    // Use provided symbol or current symbol state
    const stockSymbol = symbolToFetch || symbol;

    // Jika tidak ada symbol, jangan fetch data
    if (!stockSymbol.trim()) {
      setStockData([]);
      setError(null);
      setLastFetched(null);
      return;
    }

    setLoading(true);
    setError(null);
    // Update activeSymbol dan symbol state
    setActiveSymbol(stockSymbol);
    if (symbolToFetch) setSymbol(stockSymbol);

    const params = {
      symbol: stockSymbol,
      interval: chartInterval
    };

    // Use custom date range or standard period
    if (useDateRange && startDate && endDate) {
      params.start_date = startDate;
      params.end_date = endDate;
    } else {
      params.period = chartPeriod;
    }

    try {
      // Using our optimized fetchStock function from useStockAPI
      const result = await fetchStock(params);
      
      if (result.status === 'success' && result.data?.length > 0) {
        // Determine currency symbol based on stock symbol
        const usesIndonesianCurrency = isIndonesianStock(stockSymbol);
        setCurrencySymbol(usesIndonesianCurrency ? 'Rp' : '$');

        // Update data info
        setDataInfo({
          isRealtime: false,
          delay: usesIndonesianCurrency ? "15 minutes" : "15-20 minutes",
          source: "Yahoo Finance (yfinance)"
        });

        setStockData(result.data);
        setLastFetched(new Date(result.timestamp));

        // Update stock price in state
        if (result.data.length > 1) {
          const latest = result.data[0];
          const previous = result.data[1];

          setStockPrices(prevPrices => ({
            ...prevPrices,
            [stockSymbol]: {
              price: latest.Close,
              change: latest.Close - previous.Close,
              changePercent: ((latest.Close - previous.Close) / previous.Close) * 100,
              timestamp: result.timestamp
            }
          }));
        }
      } else {
        // Handle error case
        setError(result.error || 'No data available');
        setStockData([]);
      }
    } catch (err) {
      console.error('Error details:', err);
      setStockData([]);
      setError(`Failed to fetch data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [
    symbol,
    chartInterval,
    useDateRange,
    startDate,
    endDate,
    chartPeriod,
    fetchStock,
    isIndonesianStock
  ]);

  // Effect for window resize listener with debounce
  useEffect(() => {
    let resizeTimer;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setWindowWidth(window.innerWidth);

        // Check if main search is visible
        const mainSearchElement = symbolInputRef.current;
        if (mainSearchElement) {
          const rect = mainSearchElement.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const isVisible = rect.top >= 0 && rect.bottom <= viewportHeight;
          setOverlaySearchVisible(!isVisible);
        }
      }, 100);
    };

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
      // Initial check
      handleResize();

      return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);


  // Effect to handle clicks outside of dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      // Pastikan event.target ada dan valid
      if (!event || !event.target) return;
      
      // Jangan tutup dropdown jika input search sedang fokus
      if (event.target.classList.contains('overlay-search') || 
          event.target.closest('.overlay-search-container')) {
        return;
      }
      
      // Periksa apakah target memiliki metode closest
      const hasClosestMethod = typeof event.target.closest === 'function';
      
      // Fungsi helper untuk memeriksa apakah elemen berada di dalam kontainer tertentu
      const isElementInContainer = (element, containerClassName) => {
        let current = element;
        while (current) {
          if (current.classList && current.classList.contains(containerClassName)) {
            return true;
          }
          current = current.parentElement;
        }
        return false;
      };
      
      // Periksa apakah klik di luar dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Periksa apakah klik pada elemen lain yang seharusnya tidak menutup dropdown
        const isInNestedComponents = 
          (hasClosestMethod && (
            event.target.closest('.enhanced-stock-item') ||
            event.target.closest('.enhanced-stock-dropdown') ||
            event.target.closest('.stock-category-tabs') ||
            event.target.closest('.overlay-search-container')
          )) || 
          (!hasClosestMethod && (
            isElementInContainer(event.target, 'enhanced-stock-item') ||
            isElementInContainer(event.target, 'enhanced-stock-dropdown') ||
            isElementInContainer(event.target, 'stock-category-tabs') ||
            isElementInContainer(event.target, 'overlay-search-container')
          ));
        
        // Periksa apakah klik pada input group
        const isInInputGroup = inputGroupRef.current && inputGroupRef.current.contains(event.target);
        
        // Jika klik di luar semua komponen yang relevan, tutup dropdown
        if (!isInNestedComponents && !isInInputGroup) {
          setShowStocksList(false);
        }
      }
    }

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  // Fetch stock prices for dropdown with optimized batch processing
  const fetchLatestPricesForCategory = useCallback(async (categoryIndex) => {
    if (loadingPrices) return;
    
    setLoadingPrices(true);
    
    const stocks = stockCategories[categoryIndex].stocks;
    const symbols = stocks.map(stock => stock.symbol);
    
    try {
      // Using our preloadStockData function from useStockAPI
      await preloadStockData(symbols, '1d', '5d');
      
      // Mark this category as preloaded - gunakan setTimeout untuk mencegah loop update
      setTimeout(() => {
        setPreloadedCategories(prev => ({
          ...prev,
          [categoryIndex]: true
        }));
      }, 0);
      
    } catch (error) {
      console.error("Failed to fetch category prices:", error);
    } finally {
      setLoadingPrices(false);
    }
  }, [loadingPrices, preloadStockData, stockCategories]);

  // Fetch popular stocks data when needed
  const fetchLatestPricesForPopular = useCallback(async () => {
    if (loadingPrices) return;
    
    setLoadingPrices(true);
    
    const symbols = popularStocks.map(stock => stock.symbol);
    
    try {
      await preloadStockData(symbols, '1d', '5d');
      
      // Gunakan setTimeout untuk menghindari loop update
      setTimeout(() => {
        setPreloadedCategories(prev => ({
          ...prev,
          popular: true
        }));
      }, 0);
    } catch (error) {
      console.error("Failed to fetch popular prices:", error);
    } finally {
      setLoadingPrices(false);
    }
  }, [loadingPrices, preloadStockData, popularStocks]);

  // Preload popular stocks data
  useEffect(() => {
    // Preload only once when component mounts and if not already loaded
    if (preloadedCategories.popular === undefined) {
      // Slight delay to allow the main UI to render first
      const timer = setTimeout(() => {
        const symbols = popularStocks.map(stock => stock.symbol);
        console.log('Preloading popular stocks data...');
        preloadStockData(symbols, '1d', '5d')
          .then(() => {
            console.log('Popular stocks preloaded');
            setPreloadedCategories(prev => ({ ...prev, popular: true }));
          })
          .catch(err => console.error('Failed to preload popular stocks:', err));
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [preloadStockData, popularStocks]);
  
  // Effect to load data when dropdown is shown
  useEffect(() => {
    if (showStocksList) {
      if (selectedCategory !== null && !preloadedCategories[selectedCategory]) {
        fetchLatestPricesForCategory(selectedCategory);
      } else if (selectedCategory === null && !preloadedCategories.popular) {
        fetchLatestPricesForPopular();
      }
    }
  }, [
    showStocksList, 
    selectedCategory, 
    preloadedCategories, 
    fetchLatestPricesForCategory, 
    fetchLatestPricesForPopular
  ]);

  // Debounce function for search filtering - FIXED VERSION
  const filterStocks = useCallback((term) => {
    // Set langsung searchTerm untuk memastikan tampilan terupdate
    setSearchTerm(term);

    // Clear timeout sebelumnya jika ada
    if (filterTimeout) {
      clearTimeout(filterTimeout);
    }

    // Set timeout baru
    const timeout = setTimeout(() => {
      // Log untuk debugging
      console.log(`Search applied for term: ${term}`);
    }, 300);

    // Update state timeout
    setFilterTimeout(timeout);
  }, [filterTimeout]);

  // Perbaikan untuk handleOverlaySearch dan filterStocks

// 1. Hindari penggunaan filterStocks dalam handleOverlaySearch untuk mencegah dependency cycle
const handleOverlaySearch = useCallback((term) => {
  // Prevent dropdown from closing and ensure overlay stays visible
  setOverlaySearchTerm(term);
  setSymbol(term);
  
  // Langsung set searchTerm tanpa memanggil filterStocks
  setSearchTerm(term);
  
  // Pastikan dropdown tetap terbuka
  if (!showStocksList) {
    setShowStocksList(true);
    // Update posisi dropdown
    setTimeout(updateDropdownPosition, 50);
  }
  
  // Clear timeout sebelumnya jika ada
  if (filterTimeout) {
    clearTimeout(filterTimeout);
  }
  
  // Set timeout baru untuk debounced search
  const timeout = setTimeout(() => {
    // Log untuk debugging
    console.log(`Search applied for term: ${term}`);
  }, 300);
  
  // Update state timeout
  setFilterTimeout(timeout);
}, [showStocksList, filterTimeout, updateDropdownPosition]);

// 2. Tambahkan event listener untuk mencegah keyboard menghilangkan overlay
useEffect(() => {
  if (isSmallMobile && showStocksList) {
    // Fungsi untuk mempertahankan overlay saat keyboard muncul/hilang
    const handleVisualViewportResize = () => {
      // Selalu pastikan overlay search tetap visible
      setOverlaySearchVisible(true);
      
      // Force render dropdown agar tetap terlihat
      if (dropdownRef.current) {
        dropdownRef.current.style.transform = 'translateZ(0)';
        dropdownRef.current.style.display = 'block';
      }
    };
    
    // Tambahkan event listener untuk visualViewport
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
      window.visualViewport.addEventListener('scroll', handleVisualViewportResize);
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportResize);
      }
    };
  }
}, [isSmallMobile, showStocksList]);

// 3. Modifikasi overlay search container untuk mencegah hilang saat keyboard muncul

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (filterTimeout) {
        clearTimeout(filterTimeout);
      }
    };
  }, [filterTimeout]);

  // Function untuk mereset filter pencarian
  const resetSearchFilter = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Memoized filtered stocks list for performance - FIXED VERSION
  const filteredStocks = useMemo(() => {
    // Jika tidak ada pencarian, tampilkan kategori yang dipilih atau stocks populer
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const term = searchTerm.toLowerCase().trim();
    
    // Flatten semua stocks dan filter
    const allStocks = [
      ...popularStocks,
      ...stockCategories.flatMap(category => category.stocks)
    ];
    
    // Hilangkan duplikat berdasarkan symbol
    const uniqueStocks = allStocks.reduce((unique, stock) => {
      if (!unique.some(s => s.symbol === stock.symbol)) {
        unique.push(stock);
      }
      return unique;
    }, []);
    
    // Filter berdasarkan term
    return uniqueStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(term) || 
      stock.name.toLowerCase().includes(term)
    );
  }, [searchTerm, stockCategories, popularStocks]);

  // Handle keyboard Enter for input field
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && symbol.trim()) {
      e.preventDefault();
      memoizedFetchStockData();
      setShowStocksList(false);
    } else if (e.key === 'Escape') {
      setShowStocksList(false);
    } else if (e.key === 'ArrowDown' && showStocksList) {
      e.preventDefault();
      // Focus ke elemen pertama dalam dropdown jika ada
      const firstItem = dropdownRef.current?.querySelector('.enhanced-stock-item');
      if (firstItem) {
        firstItem.focus();
      }
    }
  }, [symbol, showStocksList, memoizedFetchStockData]);

  // Handle dropdown item keyboard navigation
  const handleDropdownKeyDown = useCallback((e, stockSymbol) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleStockSelect(stockSymbol);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowStocksList(false);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentItem = e.target;
      const prevItem = currentItem.previousElementSibling;
      if (prevItem) {
        prevItem.focus();
      } else {
        // If no previous item, go back to search input
        symbolInputRef.current.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentItem = e.target;
      const nextItem = currentItem.nextElementSibling;
      if (nextItem) {
        nextItem.focus();
      }
    }
  }, []);

  // Handle selection from dropdown
  const handleStockSelect = useCallback((selectedSymbol) => {
    // Validate input
    if (!selectedSymbol || typeof selectedSymbol !== 'string') {
      console.error('Invalid symbol provided to handleStockSelect:', selectedSymbol);
      return;
    }

    // Close dropdown immediately for better UX
    setShowStocksList(false);

    // Reset search term
    resetSearchFilter();

    // Update the symbol state
    setSymbol(selectedSymbol);

    // Navigate to stocks page if we're not already there
    navigate('stocks', { symbol: selectedSymbol });

    // Fetch data immediately
    memoizedFetchStockData(selectedSymbol);
  }, [memoizedFetchStockData, navigate, resetSearchFilter]);

  // Set up real-time updates for active symbol
  useInterval(() => {
    if (realtime && activeSymbol.trim()) {
      memoizedFetchStockData(activeSymbol);
    }
  }, refreshInterval);

  // Effect to handle URL parameter for symbol
  useEffect(() => {
    if (urlParams && urlParams.symbol) {
      setSymbol(urlParams.symbol);
      memoizedFetchStockData(urlParams.symbol);
    }
  }, [urlParams, memoizedFetchStockData]);

  // Memoized StockItem component to prevent unnecessary re-renders
  const StockItem = React.memo(({ stock, category = 'populer' }) => {
    const priceData = stockPrices[stock.symbol];
    const isLoading = loadingPrices && !priceData;

    const isPositive = priceData && priceData.change > 0;
    const isNegative = priceData && priceData.change < 0;

    return (
      <div
        className="enhanced-stock-item"
        onClick={() => handleStockSelect(stock.symbol)}
        onKeyDown={(e) => handleDropdownKeyDown(e, stock.symbol)}
        tabIndex="0"
        role="option"
        aria-selected="false"
      >
        <div className="stock-item-content">
          <div className="stock-item-info">
            <div className="stock-item-symbol">{stock.symbol}</div>
            <div className="stock-item-name">{stock.name}</div>
          </div>

          {isLoading ? (
            <div className="stock-item-price">
              <div className="price-skeleton"></div>
            </div>
          ) : priceData ? (
            <div className="stock-item-price">
              <div className="price-value">{formatPrice(priceData.price, stock.symbol.endsWith('.JK') ? 'Rp' : '$')}</div>
              <div className={`price-change ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}>
                <span className="price-change-icon">
                  {isPositive ? '▲' : isNegative ? '▼' : '•'}
                </span>
                <span className="price-change-value">
                  {isPositive ? '+' : isNegative ? '-' : ''}{Math.abs(priceData.change).toFixed(2)} ({isPositive ? '+' : isNegative ? '-' : ''}{Math.abs(priceData.changePercent).toFixed(2)}%)
                </span>
              </div>
            </div>
          ) : (
            <div className="stock-item-price">
              <div className="price-value">-</div>
            </div>
          )}
        </div>
      </div>
    );
  });

  // Memoized welcome screen to prevent unnecessary re-renders
  const WelcomeScreen = React.memo(() => (
    <div className="welcome-screen">
      <div style={{
        fontSize: '60px',
        marginBottom: '20px',
        color: '#10B981' // Warna hijau sesuai tema
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/>
        </svg>
      </div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '15px'
      }}>Selamat Datang di StockAdvice</h2>
      <p style={{
        fontSize: '16px',
        color: '#64748b',
        maxWidth: '600px',
        margin: '0 auto 20px',
        lineHeight: '1.6'
      }}>
        Pilih saham dari dropdown atau ketik kode saham di atas untuk melihat data historis dan grafik pergerakan harga.
        Contoh: <strong>BBCA.JK</strong> untuk Bank BCA, <strong>TLKM.JK</strong> untuk Telkom Indonesia, atau <strong>^JKSE</strong> untuk Indeks Harga Saham Gabungan.
      </p>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '20px'
      }}>
        {[
          { symbol: 'BBCA.JK', color: '#10B981' }, // Hijau sesuai tema
          { symbol: '^JKSE', color: '#0D9488' },   // Hijau lebih gelap
          { symbol: 'ASII.JK', color: '#14B8A6' }, // Hijau tosca
          { symbol: 'TLKM.JK', color: '#059669' }  // Hijau tua
        ].map((item, idx) => (
          <button
            key={item.symbol}
            onClick={() => handleStockSelect(item.symbol)}
            className="btn"
            style={{
              backgroundColor: item.color,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {item.symbol}
          </button>
        ))}
      </div>
    </div>
  ));

  // Get Current categories
  const getCurrentCategories = () => {
    // Jika screen sangat kecil, tampilkan hanya 2 kategori paling populer
    if (windowWidth < 480) {
      return stockCategories.slice(0, 3);
    }
    // Jika mobile, tampilkan 3 kategori
    if (windowWidth < 768) {
      return stockCategories.slice(0, 4);
    }
    // Jika layar ukuran sedang, tampilkan 6 kategori
    if (windowWidth < 1200) {
      return stockCategories.slice(0, 6);
    }
    // Untuk layar besar tampilkan semua kategori
    return stockCategories;
  };

  return (
    <div className="app-content">
      {/* DevNoticeModal */}
      <DevNoticeModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
      
      {loading && (
        <div className="loading-overlay">
          <Loader />
        </div>
      )}

      {/* Search and controls card */}
      <div className="card">
        <div className="search-container">
          {/* Stock Selector UI */}
          <div className="stock-selector-container">
            <div className="input-group dropdown-container" ref={inputGroupRef}>
              <label className="input-label">Kode Saham</label>
              <div className="enhanced-stock-input-wrapper">
                <input
                  type="text"
                  className="stock-input"
                  value={symbol}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSymbol(value);
                    filterStocks(value);
                    if (!showStocksList) {
                      setShowStocksList(true);
                      // Update posisi dropdown saat input berubah
                      setTimeout(updateDropdownPosition, 0);
                    }
                  }}
                  onFocus={() => {
                    setShowStocksList(true);
                    // Update posisi dropdown saat input focus
                    setTimeout(updateDropdownPosition, 0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Masukkan kode saham (contoh: BBCA.JK)"
                  ref={symbolInputRef}
                />
                <button
                  className="dropdown-toggle-improved"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowStocksList(!showStocksList);
                    // Update posisi dropdown saat toggle diklik
                    if (!showStocksList) {
                      resetSearchFilter();
                      setTimeout(updateDropdownPosition, 0);
                    }
                  }}
                  aria-label="Pilih saham dari daftar"
                  aria-expanded={showStocksList}
                >
                  <span className="dropdown-text">Pilih</span>
                  <span className="dropdown-arrow">{showStocksList ? '▲' : '▼'}</span>
                </button>
              </div>

              {/* Backdrop untuk mobile */}
              {showStocksList && isSmallMobile && (
                <div className="dropdown-backdrop" onClick={() => setShowStocksList(false)}></div>
              )}

              {/* Dropdown Stock List dengan posisi fixed */}
              {showStocksList && (
                <div 
                  className="enhanced-stock-dropdown" 
                  style={{
                    position: 'fixed',
                    top: dropdownPosition.top !== 'auto' ? `${dropdownPosition.top}px` : 'auto',
                    bottom: dropdownPosition.bottom !== 'auto' ? `${dropdownPosition.bottom}px` : 'auto',
                    left: typeof dropdownPosition.left === 'string' ? dropdownPosition.left : `${dropdownPosition.left}px`,
                    width: typeof dropdownPosition.width === 'string' ? dropdownPosition.width : `${dropdownPosition.width}px`,
                    maxHeight: isLargeScreen ? '600px' : 'calc(80vh)',
                    zIndex: 9999,
                  }}
                  ref={dropdownRef}
                  role="listbox"
                >
                  {/* Tombol Close untuk layar kecil */}
                  {isSmallMobile && (
                    <button 
                      className="dropdown-close-button"
                      onClick={() => setShowStocksList(false)}
                      aria-label="Tutup dropdown"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                  
                  {/* Input search adaptif - akan muncul jika input utama terhalangi */}
                  <div className={`overlay-search-container ${overlaySearchVisible || isSmallMobile ? 'visible' : ''}`}>
                    <input
                      type="text"
                      className="overlay-search"
                      value={overlaySearchTerm}
                      onChange={(e) => handleOverlaySearch(e.target.value)}
                      placeholder="Cari saham (contoh: BBCA.JK)"
                    />
                  </div>

                  {/* Tabs for categories */}
                  <div className="stock-category-tabs-container">
                    <div className="stock-category-tabs" onScroll={handleTabScroll}>
                      <button
                        className={selectedCategory === null ? 'active' : ''}
                        onClick={() => {
                          setSelectedCategory(null);
                          resetSearchFilter();
                        }}
                      >
                        Populer
                      </button>
                      {getCurrentCategories().map((category, idx) => (
                        <button
                          key={idx}
                          className={selectedCategory === idx ? 'active' : ''}
                          onClick={() => {
                            setSelectedCategory(idx);
                            resetSearchFilter();
                          }}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                    {isMobileView && (
                      <div className={`tab-scroll-indicator ${isScrollingTabs ? 'hidden' : ''}`}>
                        <span>➔</span>
                      </div>
                    )}
                  </div>

                  {/* Search results */}
                  {searchTerm && (
                    <div className="search-results">
                      <h4>Hasil Pencarian "{searchTerm}"</h4>
                      <div className="stock-list">
                        {filteredStocks.length > 0 ? (
                          filteredStocks.map((stock, idx) => (
                            <StockItem key={`search-${stock.symbol}-${idx}`} stock={stock} category="search" />
                          ))
                        ) : (
                          <div className="no-results">
                            Tidak ada saham yang cocok dengan "{searchTerm}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stock list based on selected category - only show if no search term */}
                  {!searchTerm && (
                    <div className="stock-list-container">
                      {selectedCategory === null ? (
                        <>
                          <h4>Saham Populer</h4>
                          <div className="stock-list">
                            {popularStocks.map((stock, idx) => (
                              <StockItem key={`popular-${stock.symbol}-${idx}`} stock={stock} category="populer" />
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <h4>{stockCategories[selectedCategory].name}</h4>
                          <div className="stock-list">
                            {stockCategories[selectedCategory].stocks.map((stock, idx) => (
                              <StockItem key={`category-${stock.symbol}-${idx}`} stock={stock} category={stockCategories[selectedCategory].name} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              className="btn btn-primary fetch-button"
              onClick={() => memoizedFetchStockData()}
              disabled={loading || !symbol.trim()}
            >
              {loading ? 'Loading...' : 'Ambil Data'}
            </button>
          </div>

          <div className="toggle-container">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={realtime}
                onChange={(e) => setRealtime(e.target.checked)}
                disabled={!activeSymbol}
              />
              <span className="toggle-slider"></span>
            </label>
            <span>{realtime ? 'Auto Refresh Aktif' : 'Auto Refresh Nonaktif'}</span>

            {realtime && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="refresh-select"
              >
                <option value={5000}>5 detik</option>
                <option value={10000}>10 detik</option>
                <option value={30000}>30 detik</option>
                <option value={60000}>1 menit</option>
                <option value={300000}>5 menit</option>
              </select>
            )}
          </div>
        </div>

        {lastFetched && (
        <div className="data-info">
            {dataInfo.isRealtime ? (
            <p className="realtime-indicator">✓ Data real-time</p>
            ) : (
            <p className="delayed-indicator">⚠ Data tertunda (sekitar {dataInfo.delay})</p>
            )}
            <p className="source-info">Sumber: {dataInfo.source}</p>
            <div className="last-updated">
            <span>Terakhir diperbarui:</span> {getRelativeTime(lastFetched)}
            </div>
        </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tampilkan Welcome Screen jika tidak ada data aktif */}
      {!activeSymbol && !error && <WelcomeScreen />}

      {activeSymbol && !error && stockData.length > 0 && (
        <>
          {/* Stock summary card */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            border: stockData.length > 1 ?
                `1px solid ${stockData[0].Close >= stockData[1].Close ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` :
                '1px solid #e5e7eb',
            flexDirection: isMobileView ? 'column' : 'row',
            gap: isMobileView ? '15px' : '0'
            }}>
            <div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                {formatDateTime(stockData[0].Date || stockData[0].Datetime)} - Harga Terakhir <strong>{activeSymbol}</strong>
                </div>
                <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: stockData.length > 1 ?
                    (stockData[0].Close >= stockData[1].Close ? '#10B981' : '#EF4444') :
                    '#334155'
                }}>
                {currencySymbol} {typeof stockData[0].Close === 'number'
                    ? stockData[0].Close.toLocaleString('id-ID')
                    : '-'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                (Tertunda sekitar {dataInfo.delay})
                </div>
            </div>
            {stockData.length > 1 && (
                <div style={{ textAlign: isMobileView ? 'left' : 'right', width: isMobileView ? '100%' : 'auto' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                    Perubahan (dari hari sebelumnya)
                </div>
                {(() => {
                    const priceChange = stockData[0].Close - stockData[1].Close;
                    const percentChange = (priceChange / stockData[1].Close) * 100;
                    const isPositive = priceChange >= 0;

                    return (
                    <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: isPositive ? '#10B981' : '#EF4444'
                    }}>
                        {isPositive ? '+' : ''}{currencySymbol} {Math.abs(priceChange).toLocaleString('id-ID')}
                        <span style={{ fontSize: '16px', marginLeft: '5px' }}>
                        ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
                        </span>
                    </div>
                    );
                })()}
                </div>
            )}
            </div>

          {/* Company Profile Card */}
          {companyProfiles[activeSymbol] && (
            <div className="card" style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  Profil Perusahaan
                </h3>
              </div>
              <div style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#333' }}>
                  {companyProfiles[activeSymbol].fullName}
                </h4>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Industri</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>{companyProfiles[activeSymbol].industry}</div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Tahun Berdiri</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>{companyProfiles[activeSymbol].founded}</div>
                    </div>
                  </div>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Kantor Pusat</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>{companyProfiles[activeSymbol].headquarters}</div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Website</div>
                      <a 
                        href={companyProfiles[activeSymbol].website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: '16px', color: '#2196F3', textDecoration: 'none' }}
                      >
                        {companyProfiles[activeSymbol].website}
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Deskripsi</div>
                  <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0' }}>
                    {companyProfiles[activeSymbol].description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filters card */}
          <div className="card">
            <div className="filters-container">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="useDateRange"
                  checked={useDateRange}
                  onChange={() => setUseDateRange(!useDateRange)}
                />
                <label htmlFor="useDateRange">Gunakan Rentang Tanggal Kustom</label>
              </div>

              {useDateRange ? (
                <div className="date-selector">
                  <div className="date-group">
                    <label>Dari:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate}
                    />
                  </div>

                  <div className="date-group">
                    <label>Sampai:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={formatDateForInput(new Date())}
                    />
                  </div>

                  <button
                    onClick={() => memoizedFetchStockData()}
                    className="btn btn-success"
                  >
                    Terapkan
                  </button>
                </div>
              ) : (
                <div className="filter-group">
                  <label>Periode:</label>
                  <select
                    value={chartPeriod}
                    onChange={(e) => {
                      setChartPeriod(e.target.value);
                    }}
                  >
                    <option value="1d">1 Hari</option>
                    <option value="5d">5 Hari</option>
                    <option value="1mo">1 Bulan</option>
                    <option value="3mo">3 Bulan</option>
                    <option value="6mo">6 Bulan</option>
                    <option value="1y">1 Tahun</option>
                    <option value="2y">2 Tahun</option>
                    <option value="5y">5 Tahun</option>
                    <option value="max">Maksimum</option>
                  </select>
                </div>
              )}

              <div className="filter-group">
                <label>Interval:</label>
                <select
                  value={chartInterval}
                  onChange={(e) => {
                    setChartInterval(e.target.value);
                  }}
                >
                  <option value="1d">Harian</option>
                  <option value="1wk">Mingguan</option>
                  <option value="1mo">Bulanan</option>
                  {(chartPeriod === '1d' || chartPeriod === '5d') && (
                    <>
                      <option value="1m">1 Menit</option>
                      <option value="5m">5 Menit</option>
                      <option value="15m">15 Menit</option>
                      <option value="30m">30 Menit</option>
                      <option value="1h">1 Jam</option>
                    </>
                  )}
                </select>
              </div>

              <div className="filter-group">
                <label>Tipe Grafik:</label>
                <select
                  value={chartType}
                  onChange={(e) => {
                    setChartType(e.target.value);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    minWidth: '120px'
                  }}
                >
                  <option value="composed">Gabungan</option>
                  <option value="line">Garis</option>
                  <option value="area">Area</option>
                </select>
              </div>

              <button
                onClick={() => memoizedFetchStockData()}
                className="btn btn-primary"
                style={{ marginRight: '10px' }}
              >
                Perbarui Data
              </button>

              <button
                onClick={() => setShowChart(!showChart)}
                className="btn toggle-chart-btn"
              >
                {showChart ? 'Sembunyikan Grafik' : 'Tampilkan Grafik'}
              </button>
            </div>
          </div>

          {/* Chart card */}
          {showChart && (
            <div className="data-card" style={{
              borderRadius: '12px',
              overflow: 'visible',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: 'white',
              marginBottom: '20px'
            }}>
              <div className="data-card-header" style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                <span>Grafik Saham</span>
              </div>
              <div className="data-card-body chart-container" style={{
                padding: '0',
                overflow: 'visible',
                width: '100%'
              }}>
                <Suspense fallback={<div className="chart-loading"><Loader /></div>}>
                  <StockChart
                    key={`chart-${lastFetched?.getTime() || 'initial'}`}
                    data={stockData}
                    currencySymbol={currencySymbol}
                    chartType={chartType}
                  />
                </Suspense>
              </div>
            </div>
          )}

          {/* Data table card */}
          <div className="data-card">
            <div className="data-card-header">
              <span>Data Saham</span>
            </div>
            <div className="data-card-body" style={{ overflowX: 'auto' }}>
              <table className="stock-table">
                <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Pembukaan</th>
                  <th>Tertinggi</th>
                  <th>Terendah</th>
                  <th>Penutupan</th>
                  <th>Volume</th>
                </tr>
                </thead>
                <tbody>
                {stockData.map((item, index) => (
                  <tr key={index}>
                    <td>{formatDateTime(item.Date || item.Datetime)}</td>
                    <td>{currencySymbol} {typeof item.Open === 'number' ? item.Open.toLocaleString('id-ID') : '-'}</td>
                    <td>{currencySymbol} {typeof item.High === 'number' ? item.High.toLocaleString('id-ID') : '-'}</td>
                    <td>{currencySymbol} {typeof item.Low === 'number' ? item.Low.toLocaleString('id-ID') : '-'}</td>
                    <td>{currencySymbol} {typeof item.Close === 'number' ? item.Close.toLocaleString('id-ID') : '-'}</td>
                    <td>{typeof item.Volume === 'number' ? item.Volume.toLocaleString('id-ID') : '-'}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Info card about data availability */}
      <div className="info-card">
        <h3>Tentang Ketersediaan Data</h3>
        <p>
          <strong>Penting:</strong> Yahoo Finance (yfinance) tidak menyediakan data real-time untuk sebagian besar pasar:
        </p>
        <ul>
          <li>Data untuk sebagian besar bursa tertunda 15-20 menit</li>
          <li>Saham Indonesia (.JK) biasanya memiliki penundaan 15 menit</li>
          <li>Fitur "Auto Refresh" akan menyegarkan data pada interval yang Anda pilih tetapi tidak dapat melewati penundaan dari bursa</li>
        </ul>
        <p>
          Untuk data real-time yang sebenarnya, Anda perlu berlangganan API penyedia data keuangan premium.
        </p>
      </div>

      {/* Tambahkan tombol untuk menampilkan modal secara manual */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn"
          style={{
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Lihat Status Pengembangan
        </button>
      </div>
    </div>
  );
};

export default StockAnalysisPage;