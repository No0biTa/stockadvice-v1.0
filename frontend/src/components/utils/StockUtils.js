// Data for popular stocks, stock categories and company profiles
export const popularStocks = [
  { symbol: 'BBCA.JK', name: 'Bank Central Asia' },
  { symbol: 'BBRI.JK', name: 'Bank Rakyat Indonesia' },
  { symbol: 'BMRI.JK', name: 'Bank Mandiri' },
  { symbol: 'TLKM.JK', name: 'Telkom Indonesia' },
  { symbol: 'ASII.JK', name: 'Astra International' },
  { symbol: 'UNVR.JK', name: 'Unilever Indonesia' },
  { symbol: 'ICBP.JK', name: 'Indofood CBP' },
  { symbol: 'INDF.JK', name: 'Indofood Sukses Makmur' },
  { symbol: 'HMSP.JK', name: 'HM Sampoerna' },
  { symbol: 'ANTM.JK', name: 'Aneka Tambang' }
];

export const stockCategories = [
  {
    name: 'Indeks',
    stocks: [
      { symbol: '^JKSE', name: 'IDX Composite' },
      { symbol: 'IDXBASIC.JK', name: 'IDX Basic Industry' },
      { symbol: 'IDXINDUST.JK', name: 'IDX Industrial' },
      { symbol: 'IDXFINANCE.JK', name: 'IDX Finance' },
      { symbol: 'IDXENERGY.JK', name: 'IDX Energy' }
    ]
  },
  {
    name: 'Perbankan',
    stocks: [
      { symbol: 'BBCA.JK', name: 'Bank Central Asia' },
      { symbol: 'BBRI.JK', name: 'Bank Rakyat Indonesia' },
      { symbol: 'BMRI.JK', name: 'Bank Mandiri' },
      { symbol: 'BBNI.JK', name: 'Bank Negara Indonesia' },
      { symbol: 'BJTM.JK', name: 'Bank Jatim' }
    ]
  },
  {
    name: 'Teknologi',
    stocks: [
      { symbol: 'GOTO.JK', name: 'GoTo Gojek Tokopedia' },
      { symbol: 'BUKA.JK', name: 'Bukalapak' },
      { symbol: 'TLKM.JK', name: 'Telkom Indonesia' },
      { symbol: 'EXCL.JK', name: 'XL Axiata' },
      { symbol: 'ISAT.JK', name: 'Indosat Ooredoo Hutchison' }
    ]
  },
  {
    name: 'Konsumer',
    stocks: [
      { symbol: 'UNVR.JK', name: 'Unilever Indonesia' },
      { symbol: 'ICBP.JK', name: 'Indofood CBP' },
      { symbol: 'INDF.JK', name: 'Indofood Sukses Makmur' },
      { symbol: 'HMSP.JK', name: 'HM Sampoerna' },
      { symbol: 'KLBF.JK', name: 'Kalbe Farma' }
    ]
  }
];

export const companyProfiles = {
  // Bank
  'BBCA.JK': {
    fullName: 'PT Bank Central Asia Tbk',
    industry: 'Perbankan',
    founded: '1957',
    headquarters: 'Jakarta, Indonesia',
    description: 'Bank Central Asia (BCA) adalah bank swasta terbesar di Indonesia. BCA menawarkan berbagai produk dan layanan perbankan termasuk simpanan, pinjaman, kartu kredit, dan layanan perbankan digital.',
    website: 'https://www.bca.co.id/'
  },
  'BBRI.JK': {
    fullName: 'PT Bank Rakyat Indonesia (Persero) Tbk',
    industry: 'Perbankan',
    founded: '1895',
    headquarters: 'Jakarta, Indonesia',
    description: 'Bank Rakyat Indonesia (BRI) adalah salah satu bank milik pemerintah terbesar di Indonesia. BRI fokus pada layanan perbankan mikro, kecil, dan menengah.',
    website: 'https://bri.co.id/'
  },
  'BMRI.JK': {
    fullName: 'PT Bank Mandiri (Persero) Tbk',
    industry: 'Perbankan',
    founded: '1998',
    headquarters: 'Jakarta, Indonesia',
    description: 'Bank Mandiri adalah bank terbesar di Indonesia dalam hal aset, pinjaman, dan deposit. Bank ini dibentuk melalui merger empat bank pemerintah pada tahun 1998.',
    website: 'https://www.bankmandiri.co.id/'
  },
  'BBNI.JK': {
    fullName: 'PT Bank Negara Indonesia (Persero) Tbk',
    industry: 'Perbankan',
    founded: '1946',
    headquarters: 'Jakarta, Indonesia',
    description: 'Bank Negara Indonesia (BNI) adalah bank komersial tertua di Indonesia. BNI menawarkan berbagai layanan perbankan termasuk perbankan ritel, korporasi, dan internasional.',
    website: 'https://www.bni.co.id/'
  },
  'BJTM.JK': {
    fullName: 'PT Bank Pembangunan Daerah Jawa Timur Tbk',
    industry: 'Perbankan',
    founded: '1961',
    headquarters: 'Surabaya, Indonesia',
    description: 'Bank Jatim adalah bank pembangunan daerah yang beroperasi di Jawa Timur. Bank ini menyediakan layanan perbankan ritel dan komersial dengan fokus pada pengembangan ekonomi daerah.',
    website: 'https://www.bankjatim.co.id/'
  },

  // Telekomunikasi
  'TLKM.JK': {
    fullName: 'PT Telkom Indonesia (Persero) Tbk',
    industry: 'Telekomunikasi',
    founded: '1856',
    headquarters: 'Bandung, Indonesia',
    description: 'Telkom Indonesia adalah perusahaan telekomunikasi terbesar di Indonesia. Perusahaan ini menyediakan layanan telekomunikasi, informasi, media, dan edutainment.',
    website: 'https://www.telkom.co.id/'
  },
  'EXCL.JK': {
    fullName: 'PT XL Axiata Tbk',
    industry: 'Telekomunikasi',
    founded: '1989',
    headquarters: 'Jakarta, Indonesia',
    description: 'XL Axiata adalah salah satu penyedia layanan telekomunikasi seluler terbesar di Indonesia, menawarkan layanan data, suara, SMS, dan solusi digital.',
    website: 'https://www.xl.co.id/'
  },
  'ISAT.JK': {
    fullName: 'PT Indosat Ooredoo Hutchison Tbk',
    industry: 'Telekomunikasi',
    founded: '1967',
    headquarters: 'Jakarta, Indonesia',
    description: 'Indosat Ooredoo Hutchison adalah perusahaan telekomunikasi digital terkemuka di Indonesia yang menyediakan layanan seluler, data, dan internet.',
    website: 'https://indosatooredoo.com/'
  },

  // Konglomerat
  'ASII.JK': {
    fullName: 'PT Astra International Tbk',
    industry: 'Konglomerat',
    founded: '1957',
    headquarters: 'Jakarta, Indonesia',
    description: 'Astra International adalah konglomerat multinasional yang bergerak di berbagai sektor termasuk otomotif, jasa keuangan, alat berat, pertambangan, agribisnis, infrastruktur, dan teknologi informasi.',
    website: 'https://www.astra.co.id/'
  },

  // Barang Konsumen
  'UNVR.JK': {
    fullName: 'PT Unilever Indonesia Tbk',
    industry: 'Barang Konsumen',
    founded: '1933',
    headquarters: 'Jakarta, Indonesia',
    description: 'Unilever Indonesia adalah perusahaan barang konsumen multinasional yang memproduksi makanan, minuman, pembersih, dan perawatan pribadi.',
    website: 'https://www.unilever.co.id/'
  },
  'KLBF.JK': {
    fullName: 'PT Kalbe Farma Tbk',
    industry: 'Farmasi',
    founded: '1966',
    headquarters: 'Jakarta, Indonesia',
    description: 'Kalbe Farma adalah perusahaan farmasi terbesar di Indonesia dan Asia Tenggara, memproduksi obat-obatan, suplemen, nutrisi, dan peralatan kesehatan.',
    website: 'https://www.kalbe.co.id/'
  },

  // Makanan & Minuman
  'ICBP.JK': {
    fullName: 'PT Indofood CBP Sukses Makmur Tbk',
    industry: 'Makanan & Minuman',
    founded: '2009',
    headquarters: 'Jakarta, Indonesia',
    description: 'Indofood CBP adalah produsen berbagai produk makanan kemasan termasuk mi instan, makanan ringan, nutrisi, dan makanan khusus, serta minuman.',
    website: 'https://www.indofoodcbp.com/'
  },
  'INDF.JK': {
    fullName: 'PT Indofood Sukses Makmur Tbk',
    industry: 'Makanan & Minuman',
    founded: '1990',
    headquarters: 'Jakarta, Indonesia',
    description: 'Indofood Sukses Makmur adalah perusahaan makanan terkemuka dengan operasi di semua tahapan pembuatan makanan, dari produksi bahan baku hingga produk konsumen di pasar.',
    website: 'https://www.indofood.com/'
  },

  // Rokok
  'HMSP.JK': {
    fullName: 'PT Hanjaya Mandala Sampoerna Tbk',
    industry: 'Rokok',
    founded: '1913',
    headquarters: 'Surabaya, Indonesia',
    description: 'HM Sampoerna adalah produsen rokok terkemuka di Indonesia dan merupakan anak perusahaan dari Philip Morris International.',
    website: 'https://www.sampoerna.com/'
  },

  // Pertambangan
  'ANTM.JK': {
    fullName: 'PT Aneka Tambang Tbk',
    industry: 'Pertambangan',
    founded: '1968',
    headquarters: 'Jakarta, Indonesia',
    description: 'Aneka Tambang (ANTAM) adalah perusahaan pertambangan yang terdiversifikasi dan terintegrasi secara vertikal yang berorientasi ekspor. ANTAM memiliki operasi di bidang emas, perak, nikel, bauksit, dan batubara.',
    website: 'https://www.antam.com/'
  },

  // Teknologi
  'GOTO.JK': {
    fullName: 'PT GoTo Gojek Tokopedia Tbk',
    industry: 'Teknologi',
    founded: '2021',
    headquarters: 'Jakarta, Indonesia',
    description: 'GoTo adalah perusahaan teknologi terbesar di Indonesia, hasil merger antara Gojek dan Tokopedia. Perusahaan ini menyediakan layanan e-commerce, pengiriman makanan, transportasi, dan pembayaran digital.',
    website: 'https://www.gotocompany.com/'
  },
  'BUKA.JK': {
    fullName: 'PT Bukalapak.com Tbk',
    industry: 'E-commerce',
    founded: '2010',
    headquarters: 'Jakarta, Indonesia',
    description: 'Bukalapak adalah salah satu marketplace terbesar di Indonesia yang menghubungkan jutaan penjual dan pembeli online, dengan fokus pada pemberdayaan UMKM.',
    website: 'https://www.bukalapak.com/'
  },

  // Indeks
  '^JKSE': {
    fullName: 'Indeks Harga Saham Gabungan (IHSG)',
    industry: 'Indeks Pasar',
    founded: '1977',
    headquarters: 'Jakarta, Indonesia',
    description: 'IHSG adalah indeks yang mengukur kinerja seluruh saham yang tercatat di Bursa Efek Indonesia. Indeks ini menjadi barometer utama kondisi pasar modal Indonesia.',
    website: 'https://www.idx.co.id/'
  },
  'IDXBASIC.JK': {
    fullName: 'IDX Basic Industry',
    industry: 'Indeks Sektoral',
    founded: '-',
    headquarters: 'Jakarta, Indonesia',
    description: 'Indeks yang mengukur kinerja saham-saham di sektor industri dasar yang tercatat di Bursa Efek Indonesia.',
    website: 'https://www.idx.co.id/'
  },
  'IDXINDUST.JK': {
    fullName: 'IDX Industrial',
    industry: 'Indeks Sektoral',
    founded: '-',
    headquarters: 'Jakarta, Indonesia',
    description: 'Indeks yang mengukur kinerja saham-saham di sektor industri manufaktur yang tercatat di Bursa Efek Indonesia.',
    website: 'https://www.idx.co.id/'
  },
  'IDXFINANCE.JK': {
    fullName: 'IDX Finance',
    industry: 'Indeks Sektoral',
    founded: '-',
    headquarters: 'Jakarta, Indonesia',
    description: 'Indeks yang mengukur kinerja saham-saham di sektor keuangan yang tercatat di Bursa Efek Indonesia, termasuk bank, asuransi, dan perusahaan pembiayaan.',
    website: 'https://www.idx.co.id/'
  },
  'IDXENERGY.JK': {
    fullName: 'IDX Energy',
    industry: 'Indeks Sektoral',
    founded: '-',
    headquarters: 'Jakarta, Indonesia',
    description: 'Indeks yang mengukur kinerja saham-saham di sektor energi yang tercatat di Bursa Efek Indonesia, termasuk perusahaan minyak, gas, dan batubara.',
    website: 'https://www.idx.co.id/'
  }
};

// Function to detect if a symbol is an Indonesian stock
export const isIndonesianStock = (stockSymbol) => {
  return stockSymbol.endsWith('.JK') ||
    stockSymbol === '^JKSE' ||
    stockSymbol === 'IDXENERGY.JK' ||
    stockSymbol === 'IDXBASIC.JK' ||
    stockSymbol === 'IDXINDUST.JK' ||
    stockSymbol === 'IDXNONCYC.JK' ||
    stockSymbol === 'IDXCYCLIC.JK' ||
    stockSymbol === 'IDXHEALTH.JK' ||
    stockSymbol === 'IDXFINANCE.JK' ||
    stockSymbol === 'IDXTECHNO.JK' ||
    stockSymbol.startsWith('^IDX');
};