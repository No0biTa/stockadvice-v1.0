import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Loader from './Loader';
import DevNoticeModal from './DevNoticeModal';
import '../styles/HomePage.css';
import '../styles/DevNoticeModal.css';

const HomePage = ({ onNavigate }) => {
  // State for popular stocks prices
  const [stockPrices, setStockPrices] = useState({});
  const [loading, setLoading] = useState(true);

  // State untuk DevNoticeModal
  const [isModalOpen, setIsModalOpen] = useState(() => {
    const hideDevNotice = localStorage.getItem('hideDevNotice');
    const hideDevNoticeTime = localStorage.getItem('hideDevNoticeTime');
    
    if (hideDevNotice === 'true' && hideDevNoticeTime) {
      const now = Date.now();
      const savedTime = parseInt(hideDevNoticeTime, 10);
      const twoHours = 2 * 60 * 60 * 1000;
      
      if (now - savedTime > twoHours) {
        localStorage.removeItem('hideDevNotice');
        localStorage.removeItem('hideDevNoticeTime');
        return true;
      }
      return false;
    }
    return hideDevNotice !== 'true';
  });

  // Modifikasi useEffect untuk mengecek modal saat mount
  useEffect(() => {
    const hideDevNotice = localStorage.getItem('hideDevNotice');
    const hideDevNoticeTime = localStorage.getItem('hideDevNoticeTime');
    
    if (hideDevNotice === 'true' && hideDevNoticeTime) {
      const now = Date.now();
      const savedTime = parseInt(hideDevNoticeTime, 10);
      const twoHours = 2 * 60 * 60 * 1000;
      
      if (now - savedTime > twoHours) {
        localStorage.removeItem('hideDevNotice');
        localStorage.removeItem('hideDevNoticeTime');
        setIsModalOpen(true);
      }
    } else if (hideDevNotice !== 'true') {
      setIsModalOpen(true);
    }
  }, []);

  // Handler untuk menyimpan timestamp saat modal ditutup
  const handleCloseModal = (dontShowAgain) => {
    if (dontShowAgain) {
      localStorage.setItem('hideDevNotice', 'true');
      localStorage.setItem('hideDevNoticeTime', Date.now().toString());
    } else {
      localStorage.removeItem('hideDevNotice');
      localStorage.removeItem('hideDevNoticeTime');
    }
    setIsModalOpen(false);
  };

  // UseEffect untuk pengecekan periodis
  useEffect(() => {
    if (!isModalOpen) {
      const timerInterval = setInterval(() => {
        const hideDevNotice = localStorage.getItem('hideDevNotice');
        const hideDevNoticeTime = localStorage.getItem('hideDevNoticeTime');
        
        if (hideDevNotice === 'true' && hideDevNoticeTime) {
          const now = Date.now();
          const savedTime = parseInt(hideDevNoticeTime, 10);
          const twoHours = 2 * 60 * 60 * 1000;
          
          if (now - savedTime > twoHours) {
            localStorage.removeItem('hideDevNotice');
            localStorage.removeItem('hideDevNoticeTime');
            setIsModalOpen(true);
          }
        }
      }, 5000);
      
      return () => clearInterval(timerInterval);
    }
  }, [isModalOpen]);

  // UseEffect untuk mengatur efek blur
  useEffect(() => {
    const contentContainer = document.querySelector('.content-container');
    if (contentContainer) {
      if (isModalOpen) {
        contentContainer.classList.add('blur-background');
        document.body.style.overflow = 'hidden';
      } else {
        contentContainer.classList.remove('blur-background');
        document.body.style.overflow = 'auto';
      }
    }
    
    return () => {
      const contentContainer = document.querySelector('.content-container');
      if (contentContainer) {
        contentContainer.classList.remove('blur-background');
      }
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  // Popular stocks data
  const popularStocks = useMemo(() => [
    { symbol: 'BBCA.JK', name: 'Bank Central Asia' },
    { symbol: 'BBRI.JK', name: 'Bank Rakyat Indonesia' },
    { symbol: 'TLKM.JK', name: 'Telkom Indonesia' },
    { symbol: 'BBNI.JK', name: 'Bank Negara Indonesia' },
    { symbol: 'BMRI.JK', name: 'Bank Mandiri' },
    { symbol: 'ASII.JK', name: 'Astra International' },
    { symbol: 'UNVR.JK', name: 'Unilever Indonesia' },
    { symbol: 'ICBP.JK', name: 'Indofood CBP' }
  ], []);

  // Fetch stock prices
  useEffect(() => {
    const fetchLatestPrices = async () => {
      setLoading(true);

      try {
        const promises = popularStocks.map(async (stock) => {
          try {
            const res = await axios.get("http://localhost:5000/stock", {
              params: {
                symbol: stock.symbol,
                interval: '1d',
                period: '5d'
              }
            });

            if (res.data && res.data.data && Array.isArray(res.data.data) && res.data.data.length > 1) {
              const latestData = res.data.data.sort((a, b) => {
                const dateA = new Date(a.Date || a.Datetime);
                const dateB = new Date(b.Date || b.Datetime);
                return dateB - dateA;
              });

              const latest = latestData[0];
              const previous = latestData[1];

              return {
                symbol: stock.symbol,
                price: latest.Close,
                change: latest.Close - previous.Close,
                changePercent: ((latest.Close - previous.Close) / previous.Close) * 100
              };
            }
            return { symbol: stock.symbol, price: null, change: null, changePercent: null };
          } catch (error) {
            console.error(`Error fetching data for ${stock.symbol}:`, error);
            return { symbol: stock.symbol, price: null, change: null, changePercent: null };
          }
        });

        const results = await Promise.all(promises);

        const newPrices = {};
        results.forEach(result => {
          if (result.price !== null) {
            newPrices[result.symbol] = {
              price: result.price,
              change: result.change,
              changePercent: result.changePercent
            };
          }
        });

        setStockPrices(newPrices);
      } catch (error) {
        console.error("Failed to fetch stock prices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPrices();
  }, [popularStocks]);

  // Helper function to format price
  const formatPrice = (price, symbol) => {
    if (price === null || price === undefined) return '-';
    const currencySymbol = symbol.endsWith('.JK') ? 'Rp' : '$';
    return `${currencySymbol} ${price.toLocaleString('id-ID')}`;
  };

  // Render stock cards
  const renderStockCard = (stock) => {
    const priceData = stockPrices[stock.symbol];
    const isLoading = loading;
    
    const isPositive = priceData && priceData.change > 0;
    const isNegative = priceData && priceData.change < 0;
    const changeColor = isPositive ? '#4CAF50' : isNegative ? '#E53935' : '#888';
    const changeIcon = isPositive ? '▲' : isNegative ? '▼' : '•';
    
    return (
      <div 
        className="stock-card" 
        key={stock.symbol}
        onClick={() => onNavigate('stocks', { symbol: stock.symbol })}
      >
        <div className="stock-card-gradient"></div>
        <div className="stock-card-content">
          <h2 className="stock-symbol">{stock.symbol}</h2>
          <p className="stock-name">{stock.name}</p>
          
          {isLoading ? (
            <div className="stock-price-skeleton">
              <div className="price-loading"></div>
              <div className="change-loading"></div>
            </div>
          ) : priceData ? (
            <div className="stock-price-container">
              <div className="stock-price">
                {formatPrice(priceData.price, stock.symbol)}
              </div>
              <div className="stock-change" style={{ color: changeColor }}>
                <span className="change-icon">{changeIcon}</span>
                <span>
                  {isPositive ? '+' : ''}{priceData.change.toFixed(2)} 
                  ({isPositive ? '+' : ''}{priceData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          ) : (
            <div className="stock-price-unavailable">
              Data tidak tersedia
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="home-container">
      <div className={`content-container ${isModalOpen ? 'blur-background' : ''}`}>
        <section className="hero-section">
          <div className="hero-content">
            <h1>Analisis Pasar Saham</h1>
            <p>Pantau pergerakan harga saham secara real-time dan analisis tren pasar dengan mudah</p>
            <button className="cta-button" onClick={() => onNavigate('stocks')}>
              Mulai Analisis
            </button>
          </div>
        </section>

        <section className="popular-stocks-section">
          <div className="section-header">
            <h2 className="section-title">Popular Stocks</h2>
          </div>
          
          {loading && <div className="center-loader"><Loader /></div>}
          
          <div className="stocks-grid">
            {popularStocks.slice(0, 8).map(renderStockCard)}
          </div>
        </section>

        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">Fitur Utama</h2>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon chart-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00BCD4" />
                      <stop offset="100%" stopColor="#4DB6AC" />
                    </linearGradient>
                  </defs>
                  <path d="M3 3V21H21" stroke="url(#chartGradient)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M7 14L11 10L15 14L20 9" stroke="url(#chartGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7" cy="14" r="2" fill="#E0F7FA" stroke="url(#chartGradient)" strokeWidth="1.5" />
                  <circle cx="11" cy="10" r="2" fill="#E0F7FA" stroke="url(#chartGradient)" strokeWidth="1.5" />
                  <circle cx="15" cy="14" r="2" fill="#E0F7FA" stroke="url(#chartGradient)" strokeWidth="1.5" />
                  <circle cx="20" cy="9" r="2" fill="#E0F7FA" stroke="url(#chartGradient)" strokeWidth="1.5" />
                </svg>
              </div>
              <h3>Grafik Interaktif</h3>
              <p>Visualisasi data saham dengan grafik interaktif beserta indikator teknikal</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon analysis-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="analysisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5C6BC0" />
                      <stop offset="100%" stopColor="#3F51B5" />
                    </linearGradient>
                  </defs>
                  <circle cx="11" cy="11" r="7" stroke="url(#analysisGradient)" strokeWidth="2" fill="#E8EAF6" />
                  <path d="M11 8V11H14" stroke="url(#analysisGradient)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M21 21L16.65 16.65" stroke="url(#analysisGradient)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="11" cy="11" r="3" fill="#C5CAE9" opacity="0.6" />
                </svg>
              </div>
              <h3>Analisis Mendalam</h3>
              <p>Dapatkan analisis mendalam tentang performa saham dan prediksi tren</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon news-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="newsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF9800" />
                      <stop offset="100%" stopColor="#FB8C00" />
                    </linearGradient>
                  </defs>
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="url(#newsGradient)" strokeWidth="2" fill="#FFF3E0" />
                  <path d="M7 9H17" stroke="url(#newsGradient)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M7 13H17" stroke="url(#newsGradient)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M7 17H13" stroke="url(#newsGradient)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Berita Terkini</h3>
              <p>Akses berita terbaru yang mempengaruhi pasar saham dan ekonomi</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon data-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#66BB6A" />
                      <stop offset="100%" stopColor="#43A047" />
                    </linearGradient>
                  </defs>
                  <rect x="3" y="3" width="5" height="18" rx="1" stroke="url(#dataGradient)" strokeWidth="2" fill="#E8F5E9" />
                  <rect x="10" y="8" width="5" height="13" rx="1" stroke="url(#dataGradient)" strokeWidth="2" fill="#E8F5E9" />
                  <rect x="17" y="5" width="5" height="16" rx="1" stroke="url(#dataGradient)" strokeWidth="2" fill="#E8F5E9" />
                </svg>
              </div>
              <h3>Data Historis</h3>
              <p>Telusuri data historis saham untuk analisis jangka panjang</p>
            </div>
          </div>
        </section>
      </div>
      
      {/* DevNoticeModal */}
      <DevNoticeModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default HomePage;