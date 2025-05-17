import React, { useState, useEffect, useMemo } from 'react';
import DevNoticeModal from './DevNoticeModal';
import axios from 'axios';
import Loader from './Loader';
import '../styles/NewsPage.css';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);
  const [activeSource, setActiveSource] = useState('');
  const [categories, setCategories] = useState([]);
  const [showAllSources, setShowAllSources] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State untuk DevNoticeModal - sesuaikan dengan HomePage
  const [isModalOpen, setIsModalOpen] = useState(() => {
    // Cek nilai hideDevNotice
    const hideDevNotice = localStorage.getItem('hideDevNotice');
    // Cek apakah ada timestamp
    const hideDevNoticeTime = localStorage.getItem('hideDevNoticeTime');
    
    // Log untuk debugging
    console.log("Initial hideDevNotice value:", hideDevNotice);
    console.log("Initial hideDevNoticeTime value:", hideDevNoticeTime);
    
    // Jika hideDevNotice ada, periksa apakah sudah 2 jam
    if (hideDevNotice === 'true' && hideDevNoticeTime) {
      const now = Date.now();
      const savedTime = parseInt(hideDevNoticeTime, 10);
      
      // Selalu gunakan 2 jam (dalam milidetik) untuk semua environment
      const twoHours = 2 * 60 * 60 * 1000; // 2 jam dalam milidetik
      
      // Jika lebih dari 2 jam, reset localStorage dan tampilkan modal
      if (now - savedTime > twoHours) {
        console.log("More than 2 hours since last hide, resetting modal");
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

  // Modifikasi useEffect untuk mengecek modal saat mount
  useEffect(() => {
    console.log("Checking if modal should be shown");
    
    // Cek nilai hideDevNotice dan timestamp
    const hideDevNotice = localStorage.getItem('hideDevNotice');
    const hideDevNoticeTime = localStorage.getItem('hideDevNoticeTime');
    
    if (hideDevNotice === 'true' && hideDevNoticeTime) {
      const now = Date.now();
      const savedTime = parseInt(hideDevNoticeTime, 10);
      const twoHours = 2 * 60 * 60 * 1000; // 2 jam dalam milidetik
      
      if (now - savedTime > twoHours) {
        // Lebih dari 2 jam, reset localStorage dan tampilkan modal
        console.log("More than 2 hours since last hide, resetting modal");
        localStorage.removeItem('hideDevNotice');
        localStorage.removeItem('hideDevNoticeTime');
        setIsModalOpen(true);
      } else {
        // Belum 2 jam, tampilkan info waktu tersisa
        const remainingTime = twoHours - (now - savedTime);
        console.log(`Modal will show again in ${Math.round(remainingTime / 1000)} seconds`);
      }
    } else if (hideDevNotice !== 'true') {
      // Jika hideDevNotice tidak ada atau bukan true, tampilkan modal
      console.log("Setting modal to open - no valid hide setting found");
      setIsModalOpen(true);
    }
  }, []);

  // Modifikasi handler untuk menutup modal
  const handleCloseModal = (dontShowAgain) => {
    console.log("Modal closed, don't show again:", dontShowAgain);
    
    if (dontShowAgain) {
      // Jika dicentang "jangan tampilkan lagi", simpan preference dan timestamp
      localStorage.setItem('hideDevNotice', 'true');
      localStorage.setItem('hideDevNoticeTime', Date.now().toString());
      
      // Log timestamp dan kapan akan muncul kembali
      const now = Date.now();
      const twoHours = 2 * 60 * 60 * 1000; // 2 jam dalam milidetik
      console.log(`Modal hidden with timestamp: ${now}`);
      console.log(`Modal will show again at: ${new Date(now + twoHours).toLocaleTimeString()}`);
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
            console.log("Timer check: More than 2 hours since last hide, showing modal");
            localStorage.removeItem('hideDevNotice');
            localStorage.removeItem('hideDevNoticeTime');
            setIsModalOpen(true);
          } else {
            // Log waktu tersisa (diaktifkan di semua environment)
            const remainingMinutes = Math.round((twoHours - (now - savedTime)) / (60 * 1000));
            console.log(`Time remaining until modal shows again: ${remainingMinutes} minutes`);
          }
        }
      }, 5000); // Cek setiap 5 detik
      
      // Cleanup interval saat komponen unmount atau modal ditampilkan
      return () => clearInterval(timerInterval);
    }
  }, [isModalOpen]);

  // Tambahkan useEffect untuk mengatur efek blur saat modal terbuka
  useEffect(() => {
    const contentContainer = document.querySelector('.news-container');
    if (contentContainer) {
      if (isModalOpen) {
        // Tambahkan class blur saat modal terbuka
        contentContainer.classList.add('blur-background');
        // Nonaktifkan scrolling pada body
        document.body.style.overflow = 'hidden';
      } else {
        // Hapus class blur saat modal tertutup
        contentContainer.classList.remove('blur-background');
        // Aktifkan kembali scrolling pada body
        document.body.style.overflow = 'auto';
      }
    }

    // Pembersihan saat komponen unmount
    return () => {
      const contentContainer = document.querySelector('.news-container');
      if (contentContainer) {
        contentContainer.classList.remove('blur-background');
      }
      // Pastikan scrolling diaktifkan kembali saat komponen unmount
    document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]); // Efek dijalankan saat isModalOpen berubah

  // Fetch available news sources when component mounts
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await axios.get('http://localhost:5000/news/sources');
        console.log('Sources response:', response.data);
        
        if (response.data && response.data.sources) {
          // Tambahkan opsi "Semua" untuk seluruh sumber berita
          const allSourcesOption = {
            id: 'all',
            name: 'Semua Sumber',
            categories: ['all', 'Terbaru', 'Ekonomi', 'Bisnis', 'Teknologi']
          };
          
          const allSources = [allSourcesOption, ...response.data.sources];
          setSources(allSources);
          
          // Set default source ke "Semua"
          setActiveSource('All');
          
          // Set kategori default
          setCategories(['all', 'Terbaru', 'Ekonomi', 'Bisnis', 'Teknologi']);
        }
      } catch (error) {
        console.error('Error fetching news sources:', error);
        // Fallback categories
        setCategories([
          'all', 'General', 'Ekonomi', 'Bisnis'
        ]);
      }
    };
    
    fetchSources();
  }, []);

  // Update categories when source changes
  useEffect(() => {
    if (activeSource) {
      const selectedSource = sources.find(source => source.id === activeSource);
      if (selectedSource && selectedSource.categories) {
        setCategories(selectedSource.categories);
        // Reset kategori filter ke 'all' saat mengubah sumber
        setActiveFilter('all');
        // Reset pagination saat mengubah sumber
        setCurrentPage(1);
      }
    }
  }, [activeSource, sources]);

  // Fetch news data when source or filter changes
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      
      // Reset pagination saat mengubah filter
      setCurrentPage(1);
      
      try {
        // Jika sumber "Semua" dipilih, kumpulkan berita dari semua sumber
        if (activeSource === 'all') {
          const popularSources = ['cnn', 'tribun', 'republika', 'antara'];
          const allNewsPromises = [];
          let endpoint = '';
          
          // Jika ada filter kategori aktif selain 'all'
          if (activeFilter !== 'all') {
            // Kumpulkan berita dari sumber populer dengan kategori tertentu
            popularSources.forEach(source => {
              endpoint = `http://localhost:5000/news?source=${source}&category=${activeFilter}`;
              allNewsPromises.push(axios.get(endpoint));
            });
            
            // Tambahkan fallback news dari Finnhub/Yahoo dengan kategori yang dipilih
            endpoint = `http://localhost:5000/news?category=${activeFilter}`;
            allNewsPromises.push(axios.get(endpoint));
          } else {
            // Jika kategori 'all', kumpulkan semua berita terbaru dari sumber populer
            popularSources.forEach(source => {
              endpoint = `http://localhost:5000/news?source=${source}`;
              allNewsPromises.push(axios.get(endpoint));
            });
            
            // Tambahkan fallback news dari Finnhub/Yahoo
            endpoint = 'http://localhost:5000/news';
            allNewsPromises.push(axios.get(endpoint));
          }
          
          console.log('Fetching news from multiple sources');
          
          // Tunggu semua promise selesai
          const results = await Promise.allSettled(allNewsPromises);
          
          // Gabungkan hasil dari semua sumber yang berhasil
          let combinedNews = [];
          results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.data && Array.isArray(result.value.data)) {
              combinedNews = [...combinedNews, ...result.value.data];
            }
          });
          
          // Log jumlah berita yang berhasil dikumpulkan
          console.log(`Collected ${combinedNews.length} news items from all sources`);
          
          // Pastikan semua field yang diperlukan ada dan format tanggal
          const processedNews = combinedNews.map(item => ({
            ...item,
            title: item.title || 'Tidak ada judul',
            description: item.description || item.title || 'Tidak ada deskripsi',
            url: item.url || '#',
            urlToImage: item.urlToImage || null,
            publishedAt: item.publishedAt || new Date().toISOString(),
            source: item.source || { name: 'Unknown' },
            category: item.category || 'general'
          }));
          
          // Hapus duplikat berdasarkan judul
          const uniqueNews = [];
          const titleSet = new Set();
          
          processedNews.forEach(item => {
            if (!titleSet.has(item.title)) {
              titleSet.add(item.title);
              uniqueNews.push(item);
            }
          });
          
          // Urutkan berita berdasarkan tanggal (terbaru dulu)
          const sortedNews = uniqueNews.sort((a, b) => 
            new Date(b.publishedAt) - new Date(a.publishedAt)
          );
          
          setNews(sortedNews);
        } else {
          // Logic lama untuk sumber tunggal
          let endpoint = 'http://localhost:5000/news';
          
          // Jika bukan opsi "Semua", tambahkan parameter sumber
          endpoint += `?source=${activeSource}`;
          
          // Tambahkan parameter kategori jika bukan 'all'
          if (activeFilter !== 'all') {
            endpoint += `&category=${activeFilter}`;
          }
          
          console.log('Fetching news from:', endpoint);
          const response = await axios.get(endpoint);
          
          // Log respons untuk debugging
          console.log('API Response:', response.data);
          
          if (response.data && Array.isArray(response.data)) {
            // Pastikan semua field yang diperlukan ada dan format tanggal
            const processedNews = response.data.map(item => ({
              ...item,
              title: item.title || 'Tidak ada judul',
              description: item.description || item.title || 'Tidak ada deskripsi',
              url: item.url || '#',
              urlToImage: item.urlToImage || null,
              publishedAt: item.publishedAt || new Date().toISOString(),
              source: item.source || { name: 'Unknown' },
              category: item.category || 'general'
            }));
            
            // Urutkan berita berdasarkan tanggal (terbaru dulu)
            const sortedNews = processedNews.sort((a, b) => 
              new Date(b.publishedAt) - new Date(a.publishedAt)
            );
            
            setNews(sortedNews);
          } else {
            console.warn('API tidak mengembalikan array:', response.data);
            setNews([]);
          }
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Gagal memuat berita. Silakan coba lagi nanti.');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [activeSource, activeFilter]);

  // Perbaikan untuk filter pencarian berita berdasarkan kata kunci
  const filteredNews = useMemo(() => {
    if (!searchTerm) {
      return news;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return news.filter(item => 
      (item.title && item.title.toLowerCase().includes(searchTermLower)) ||
      (item.description && item.description.toLowerCase().includes(searchTermLower)) ||
      (item.source && item.source.name && item.source.name.toLowerCase().includes(searchTermLower)) ||
      (item.category && item.category.toLowerCase().includes(searchTermLower))
    );
  }, [news, searchTerm]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to previous page
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  // Go to next page
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Ubah function formatDate untuk menambahkan informasi jam
const formatDate = (dateString) => {
  try {
    // Format tanggal lengkap termasuk jam
    const dateOptions = { 
      weekday: 'long', // Menampilkan nama hari (Senin, Selasa, dst)
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const formattedDate = new Date(dateString).toLocaleDateString('id-ID', dateOptions);
    
    // Format: "Senin, 16 Mei 2025, 14:30"
    return formattedDate.replace(',', ',').replace('pukul', '');
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return 'Tanggal tidak tersedia';
  }
};

  // Handle category filter change
  const handleFilterChange = (categoryId) => {
    setActiveFilter(categoryId);
    // Reset pagination when changing filter
    setCurrentPage(1);
  };

  // Handle source change
  const handleSourceChange = (sourceId) => {
    setActiveSource(sourceId);
    // Reset pagination when changing source
    setCurrentPage(1);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset pagination when searching
    setCurrentPage(1);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent page reload on form submission
  };

  // Toggle show all sources
  const toggleShowAllSources = () => {
    setShowAllSources(!showAllSources);
  };

  // Get the current source name
  const getCurrentSourceName = () => {
    if (activeSource === 'all') return 'Semua Sumber';
    const source = sources.find(s => s.id === activeSource);
    return source ? source.name : 'Berita';
  };

  // Get the current category name
  const getCurrentCategoryName = () => {
    if (activeFilter === 'all') return 'Semua';
    
    // Map technical category names to friendly names
    const categoryMap = {
      'terbaru': 'Terbaru',
      'ekonomi': 'Ekonomi',
      'bisnis': 'Bisnis',
      'olahraga': 'Olahraga',
      'teknologi': 'Teknologi',
      'hiburan': 'Hiburan',
      'internasional': 'Internasional',
      'lifestyle': 'Gaya Hidup',
      'entertainment': 'Hiburan',
      'otomotif': 'Otomotif',
      'sport': 'Olahraga',
      'tekno': 'Teknologi'
    };
    
    return categoryMap[activeFilter] || activeFilter;
  };

  // Filter source untuk tampilan (batasi jika tidak showAllSources)
  const displayedSources = showAllSources 
    ? sources 
    : sources.slice(0, 7); // Tampilkan 7 sumber pertama + opsi "Semua" yang sudah ditambahkan di awal

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Function to render pagination buttons with ellipsis for large number of pages
  const renderPaginationButtons = () => {
    const maxButtonsToShow = 5;
    
    if (totalPages <= maxButtonsToShow) {
      // If total pages is small, show all page buttons
      return pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={`pagination-button ${currentPage === number ? 'active' : ''}`}
        >
          {number}
        </button>
      ));
    } else {
      // For large number of pages, show current page with neighbors and ellipsis
      const buttons = [];
      
      // Always show first page
      buttons.push(
        <button
          key={1}
          onClick={() => paginate(1)}
          className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
        >
          1
        </button>
      );
      
      // Calculate start and end of visible page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust to show 3 pages + first & last
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
      
      // Add middle page buttons
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          >
            {i}
          </button>
        );
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      
      // Always show last page
      if (totalPages > 1) {
        buttons.push(
          <button
            key={totalPages}
            onClick={() => paginate(totalPages)}
            className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
          >
            {totalPages}
          </button>
        );
      }
      
      return buttons;
    }
  };

  return (
    <div className="news-container">
      {/* DevNoticeModal di luar konten utama agar tidak terkena efek blur */}
      <DevNoticeModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <section className="news-hero-section">
        <div className="news-hero-content">
          <h1>Berita & Analisis Pasar</h1>
          <p>Dapatkan informasi terkini seputar pasar modal, ekonomi, dan bisnis</p>
        </div>
      </section>

      <section className="news-filter-section">
        <form className="news-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Cari berita..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <i className="search-icon">🔍</i>
          </button>
        </form>

        {/* Header untuk sumber berita */}
        <div className="section-header source-header">
          <h3>Sumber Berita</h3>
        </div>
        
        {/* Source selection */}
        <div className="source-filters">
          {displayedSources.map(source => (
            <button
              key={source.id}
              className={`source-filter-btn ${activeSource === source.id ? 'active' : ''}`}
              onClick={() => handleSourceChange(source.id)}
            >
              {source.name}
            </button>
          ))}
          
          {sources.length > 7 && (
            <button 
              className="source-filter-btn show-more-btn"
              onClick={toggleShowAllSources}
            >
              {showAllSources ? '← Tampilkan Lebih Sedikit' : 'Tampilkan Semua →'}
            </button>
          )}
        </div>

        {/* Header untuk kategori */}
        <div className="section-header category-header">
          <h3>Kategori</h3>
        </div>
        
        {/* Category filters */}
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-filter-btn ${activeFilter === category ? 'active' : ''}`}
              onClick={() => handleFilterChange(category)}
            >
              {category === 'all' ? 'Semua' : 
               category === 'terbaru' ? 'Terbaru' : 
               category}
            </button>
          ))}
        </div>
      </section>

      <section className="news-content-section">
        <div className="section-header">
          <h2 className="section-title">
            {`${getCurrentSourceName()} - ${getCurrentCategoryName()}`}
          </h2>
          <div className="section-divider"></div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="center-loader">
            <Loader />
          </div>
        ) : currentItems.length > 0 ? (
          <>
            <div className="news-grid">
              {currentItems.map((article, index) => (
                <div className="news-card" key={index}>
                  <div className="news-card-gradient"></div>
                  {article.urlToImage ? (
                    <div 
                      className="news-image" 
                      style={{ 
                        backgroundImage: `url(${article.urlToImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  ) : (
                    <div 
                      className="news-image" 
                      style={{ 
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span style={{ color: '#aaa', fontSize: '2rem' }}>📰</span>
                    </div>
                  )}
                  <div className="news-card-content">
                    <div className="news-meta">
                      <span className="news-category">{article.category || 'Umum'}</span>
                      <span className="news-date">{formatDate(article.publishedAt)}</span>
                    </div>
                    <h2 className="news-title">{article.title}</h2>
                    <p className="news-description">{article.description}</p>
                    <div className="news-source">
                      {article.source && article.source.name && (
                        <span>Sumber: {article.source.name}</span>
                      )}
                      {article.related && (
                        <span className="news-related">Terkait: {article.related}</span>
                      )}
                    </div>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="read-more-btn"
                    >
                      Baca Selengkapnya
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination">
                  <button 
                    onClick={goToPrevPage} 
                    className="pagination-button nav-button"
                    disabled={currentPage === 1}
                  >
                    &#8592; Sebelumnya
                  </button>
                  
                  <div className="pagination-numbers">
                    {renderPaginationButtons()}
                  </div>
                  
                  <button 
                    onClick={goToNextPage} 
                    className="pagination-button nav-button"
                    disabled={currentPage === totalPages}
                  >
                    Berikutnya &#8594;
                  </button>
                </div>
                
                <div className="pagination-info">
                  Halaman {currentPage} dari {totalPages} ({filteredNews.length} berita)
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-news-found">
            <h3>Tidak ada berita yang ditemukan</h3>
            <p>Coba ubah filter atau kata kunci pencarian Anda</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default NewsPage;