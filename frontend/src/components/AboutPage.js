import React from 'react';
import DevNoticeModal from './DevNoticeModal';
import '../styles/AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-container">
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Tentang StockAdvice</h1>
          <p>Platform analisis saham modern karya anak bangsa</p>
        </div>
      </section>

      <section className="about-story-section">
        <div className="about-section-header">
          <h2 className="section-title">Cerita Kami</h2>
        </div>
        
        <div className="story-card">
          <div className="founder-image">
            <div className="founder-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="koalaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9575CD" />
                    <stop offset="100%" stopColor="#5E35B1" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="8" r="5" fill="#E8EAF6" stroke="url(#koalaGradient)"/>
                <path d="M20 21v-2a7 7 0 0 0-14 0v2" fill="#E8EAF6" stroke="url(#koalaGradient)"/>
              </svg>
              <span className="founder-name">Koala</span>
            </div>
          </div>
          <div className="story-content">
            <h3>Visi yang Tumbuh dari Kebutuhan</h3>
            <p>
              StockAdvice bermula dari pengalaman personal "Koala", seorang trader muda yang frustasi 
              dengan kurangnya alat analisis saham yang terjangkau dan mudah digunakan untuk investor 
              Indonesia. Pada awal 2025, dengan modal pengetahuan pemrograman dan passion di dunia investasi, 
              Koala memutuskan untuk membangun platform analisis saham yang dapat diakses oleh siapa saja.
            </p>
            <p>
              "Saya ingin demokratisasi analisis saham. Informasi dan alat analisis yang berkualitas 
              seharusnya tidak hanya tersedia untuk kalangan elit finansial," ujar Koala, pendiri StockAdvice 
              yang memilih untuk tetap anonim dan dikenal hanya dengan nama samaran tersebut.
            </p>
          </div>
        </div>
      </section>

      <section className="about-mission-section">
        <div className="mission-vision-container">
          <div className="mission-card">
            <div className="mission-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="missionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00BCD4" />
                    <stop offset="100%" stopColor="#4DB6AC" />
                  </linearGradient>
                </defs>
                <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="#E0F7FA" stroke="url(#missionGradient)" strokeWidth="2" />
                <path d="M3 7V17L12 22L21 17V7" stroke="url(#missionGradient)" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 12V22" stroke="url(#missionGradient)" strokeWidth="2" />
                <path d="M7 9.5L17 4.5" stroke="url(#missionGradient)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Misi Kami</h3>
            <p>
              Menyediakan akses ke alat analisis pasar saham yang mudah digunakan dan berkualitas tinggi 
              untuk semua investor Indonesia, dari pemula hingga profesional, dengan biaya yang terjangkau.
            </p>
          </div>

          <div className="vision-card">
            <div className="vision-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="visionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5C6BC0" />
                    <stop offset="100%" stopColor="#3F51B5" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="9" fill="#E8EAF6" stroke="url(#visionGradient)" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" fill="#C5CAE9" stroke="url(#visionGradient)" strokeWidth="2" />
                <line x1="12" y1="3" x2="12" y2="7" stroke="url(#visionGradient)" strokeWidth="2" />
                <line x1="12" y1="17" x2="12" y2="21" stroke="url(#visionGradient)" strokeWidth="2" />
                <line x1="3" y1="12" x2="7" y2="12" stroke="url(#visionGradient)" strokeWidth="2" />
                <line x1="17" y1="12" x2="21" y2="12" stroke="url(#visionGradient)" strokeWidth="2" />
              </svg>
            </div>
            <h3>Visi Kami</h3>
            <p>
              Menjadi platform analisis saham terdepan di Indonesia yang membantu investor membuat 
              keputusan investasi lebih cerdas dan meningkatkan literasi keuangan di masyarakat.
            </p>
          </div>
        </div>
      </section>

      <section className="about-timeline-section">
        <div className="about-section-header">
          <h2 className="section-title">Perjalanan Kami</h2>
        </div>
        
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Januari 2025</h3>
              <p>Koala mulai mengembangkan prototype pertama StockAdvice sebagai project personal.</p>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Maret 2025</h3>
              <p>Beta version pertama diluncurkan dengan dukungan 50 pengguna awal yang menguji platform.</p>
            </div>
          </div>
          
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Mei 2025</h3>
              <p>Peluncuran resmi StockAdvice v1.0 public dengan fitur dan fungsional yang masih dasar.</p>
            </div>
          </div>

          <div className="timeline-item active">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Sekarang</h3>
              <p>StockAdvice v1.1.2 sedang dalam development dengan peningkatan performa dan fitur analisis yang lebih komprehensif.</p>
            </div>
          </div>
          
          <div className="timeline-item future">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h3>Target Q4 2025</h3>
              <p>Integrasi AI untuk prediksi tren pasar dan rekomendasi personalisasi.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values-section">
        <div className="about-section-header">
          <h2 className="section-title">Nilai-Nilai Kami</h2>
        </div>
        
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="accessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF9800" />
                    <stop offset="100%" stopColor="#FB8C00" />
                  </linearGradient>
                </defs>
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="url(#accessGradient)" strokeWidth="2" fill="#FFF3E0" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="url(#accessGradient)" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <h3>Aksesibilitas</h3>
            <p>Kami percaya bahwa alat analisis pasar saham berkualitas tinggi harus tersedia untuk semua orang.</p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="transGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#66BB6A" />
                    <stop offset="100%" stopColor="#43A047" />
                  </linearGradient>
                </defs>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="url(#transGradient)" strokeWidth="2" fill="#E8F5E9" />
                <path d="M12 16v-4m0-4h.01" stroke="url(#transGradient)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Transparansi</h3>
            <p>Kami berkomitmen untuk menyajikan informasi pasar modal dengan jujur dan transparan.</p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="eduGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#26C6DA" />
                    <stop offset="100%" stopColor="#00ACC1" />
                  </linearGradient>
                </defs>
                <path d="M2 7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V7Z" stroke="url(#eduGradient)" strokeWidth="2" fill="#E0F7FA" />
                <path d="M16 2V5" stroke="url(#eduGradient)" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 2V5" stroke="url(#eduGradient)" strokeWidth="2" strokeLinecap="round" />
                <path d="M2 9H22" stroke="url(#eduGradient)" strokeWidth="2" />
                <path d="M9 14H15" stroke="url(#eduGradient)" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 17H13" stroke="url(#eduGradient)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Edukasi</h3>
            <p>Kami berupaya meningkatkan literasi keuangan melalui konten dan alat yang informatif.</p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="innoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EC407A" />
                    <stop offset="100%" stopColor="#D81B60" />
                  </linearGradient>
                </defs>
                <path d="M9.663 17h4.673M12 12v5m3-13.5V8m-6-4.5V8" stroke="url(#innoGradient)" strokeWidth="2" strokeLinecap="round" />
                <path d="M6.4 9.05A6.5 6.5 0 1 1 17.6 9.05" stroke="url(#innoGradient)" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" stroke="url(#innoGradient)" strokeWidth="2" fill="#FCE4EC" />
              </svg>
            </div>
            <h3>Inovasi</h3>
            <p>Kami terus mengembangkan fitur baru yang memudahkan proses analisis dan pengambilan keputusan.</p>
          </div>
        </div>
      </section>

      <section className="about-team-section">
        <div className="about-section-header">
          <h2 className="section-title">Tim Kami</h2>
        </div>
        
        <div className="team-description">
          <p>
            StockAdvice dikembangkan oleh "Koala" sendiri namun berdedikasi. "Koala" beroperasi dengan filosofi "Percaya Diri Dulu" - fokus pada pengembangan 
            fitur yang benar-benar dibutuhkan pengguna dan peningkatan berkelanjutan.
          </p>
          
          <p>
            Dengan pendiri "Koala" yang memilih untuk tetap anonim, kami mempertahankan fokus pada produk dan 
            fitur - bukan personalitas. Kami percaya bahwa karya harus berbicara lebih keras daripada nama.
          </p>
        </div>
      </section>

      <section className="about-contact-section">
        <div className="contact-card">
          <div className="contact-info">
            <h3>Hubungi Kami</h3>
            <p>Punya pertanyaan atau saran? Kami senang mendengar dari Anda!</p>
            
            <div className="contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="contact-icon">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
              </svg>
              <span>info@stockadvice.id</span>
            </div>
            
            <div className="contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="contact-icon">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
              </svg>
              <span>Jakarta, Indonesia</span>
            </div>
            
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="contact-form">
            <h3>Kirim Pesan</h3>
            <form>
              <div className="form-group">
                <label htmlFor="name">Nama</label>
                <input type="text" id="name" placeholder="Nama Anda" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Email Anda" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Pesan</label>
                <textarea id="message" rows="4" placeholder="Tulis pesan Anda di sini"></textarea>
              </div>
              <button type="submit" className="submit-button">Kirim Pesan</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;