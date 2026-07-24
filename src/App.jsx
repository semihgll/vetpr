import React, { useState, useEffect } from 'react';
import {
  Pill,
  Stethoscope,
  Syringe,
  Search,
  ArrowUpDown,
  UploadCloud,
  Mail,
  FileText,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Trash2,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { auth, logoutUser } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import PriceHistoryModal from './components/PriceHistoryModal';
import PdfUploaderModal from './components/PdfUploaderModal';
import MailSettingsModal from './components/MailSettingsModal';
import InvoicesModal from './components/InvoicesModal';
import AuthModal from './components/AuthModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [medicines, setMedicines] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('currentPrice');
  const [order, setOrder] = useState('asc'); // asc = Düşükten Yükseğe (Geliş Fiyatı)
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);

  // Syncing state
  const [mailSyncing, setMailSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState(null);

  // Fetch medicines data
  const loadData = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        sort,
        order,
        search,
        category: selectedCategory
      });
      
      const [medRes, invRes] = await Promise.all([
        fetch(`/api/medicines?${query.toString()}`),
        fetch('/api/invoices')
      ]);

      const medData = await medRes.json();
      const invData = await invRes.json();

      if (medData.success) setMedicines(medData.medicines);
      if (invData.success) setInvoices(invData.invoices);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadData();
  }, [sort, order, search, selectedCategory, currentUser]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  // Trigger E-Mail Fetch
  const handleFetchMails = async () => {
    setMailSyncing(true);
    setSyncNotice(null);
    try {
      const res = await fetch('/api/fetch-mails', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setSyncNotice({
          type: 'success',
          text: data.message
        });
        await loadData();
      } else {
        setSyncNotice({ type: 'error', text: data.message });
      }
    } catch (err) {
      setSyncNotice({ type: 'error', text: 'Mailler taranırken bir hata oluştu.' });
    } finally {
      setMailSyncing(false);
    }
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'price-asc') {
      setSort('currentPrice');
      setOrder('asc');
    } else if (val === 'price-desc') {
      setSort('currentPrice');
      setOrder('desc');
    } else if (val === 'name-asc') {
      setSort('name');
      setOrder('asc');
    } else if (val === 'change-desc') {
      setSort('changeRate');
      setOrder('desc');
    } else if (val === 'date-desc') {
      setSort('lastUpdate');
      setOrder('desc');
    }
  };

  const formatCurrency = (val) => `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

  // Compute stats
  const avgPrice = medicines.length > 0 
    ? medicines.reduce((acc, m) => acc + m.currentPrice, 0) / medicines.length 
    : 0;

  const categories = ['All', 'Antibiyotik', 'Metabolik / Vitamin', 'Solunum / Antibiyotik', 'Anti-enflamatuar'];

  const handleClearData = async () => {
    if (!window.confirm('Tüm kayıtlı ilaç ve fatura verileri silinecektir. Emin misiniz?')) return;
    try {
      const res = await fetch('/api/clear-data', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncNotice({ type: 'success', text: 'Tüm test verileri temizlendi. Artık kendi PDF faturalarınızı veya maillerinizi yükleyebilirsiniz.' });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      {/* Auth Modal overlay if not logged in */}
      {!authChecking && !currentUser && (
        <AuthModal onLoginSuccess={(user) => setCurrentUser(user)} />
      )}

      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon" title="VetPr - Veteriner & İlaç">
            <img src="/favicon.svg" alt="VetPr Icon" style={{ width: 26, height: 26, borderRadius: 6 }} />
          </div>
          <div>
            <div className="brand-title">VetPr Mail & PDF</div>
            <div className="brand-subtitle">Veteriner İlaç Geliş Fiyatı & Takip</div>
          </div>
        </div>

        <div className="header-actions">
          {currentUser && (
            <div className="user-profile-badge" title={currentUser.email}>
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || 'Kullanıcı'} className="user-avatar" />
              ) : (
                <UserIcon size={18} />
              )}
              <span className="user-name">{currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'Profil'}</span>
              <button className="btn-icon" onClick={handleLogout} title="Çıkış Yap" style={{ width: 28, height: 28, border: 'none', background: 'transparent', padding: 0 }}>
                <LogOut size={15} style={{ color: 'var(--accent-rose)' }} />
              </button>
            </div>
          )}

          <button className="btn-icon" onClick={handleClearData} title="Test Verilerini Temizle" style={{ color: 'var(--accent-rose)' }}>
            <Trash2 size={18} />
          </button>
          <button className="btn-icon" onClick={toggleTheme} title="Tema Değiştir">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn-icon" onClick={() => setShowMailModal(true)} title="Mail Ayarları">
            <Mail size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {/* Quick Action Banner */}
        <div className="action-banner">
          <div className="banner-text">
            <h3><Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: 'var(--accent-cyan)' }} /> E-Posta & Fatura PDF Entegrasyonu</h3>
            <p>Maillere gelen PDF faturalar otomatik taranır ve ilaç geliş fiyatları sıralanır.</p>
          </div>
          <div className="banner-buttons">
            <button className="btn-primary" onClick={handleFetchMails} disabled={mailSyncing}>
              <RefreshCw size={15} className={mailSyncing ? 'spin' : ''} />
              {mailSyncing ? 'Mailler Taranıyor...' : 'Mailleri Tara'}
            </button>
            <button className="btn-secondary" onClick={() => setShowPdfModal(true)}>
              <UploadCloud size={15} /> PDF Yükle
            </button>
          </div>
        </div>

        {syncNotice && (
          <div style={{
            margin: '0 16px 14px 16px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            background: syncNotice.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: syncNotice.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            border: '1px solid currentColor'
          }}>
            {syncNotice.text}
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Kayıtlı İlaç</span>
            <span className="stat-value">{medicines.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Ort. Geliş Fiyatı</span>
            <span className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{formatCurrency(avgPrice)}</span>
          </div>
          <div style={{ cursor: 'pointer' }} className="stat-card" onClick={() => setShowInvoicesModal(true)}>
            <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              Faturalar <ChevronRight size={12} />
            </span>
            <span className="stat-value">{invoices.length}</span>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <section className="controls-section">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="İlaç adı, ecza deposu veya kategori ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} color="var(--text-muted)" />
              <select className="sort-select" onChange={handleSortChange}>
                <option value="price-asc">Geliş Fiyatı: En Ucuz → En Pahalı</option>
                <option value="price-desc">Geliş Fiyatı: En Pahalı → En Ucuz</option>
                <option value="change-desc">Fiyat Artış Oranı (% Yüksek)</option>
                <option value="name-asc">İlaç Adı (A-Z)</option>
                <option value="date-desc">En Son Güncellenen</option>
              </select>
            </div>

            {/* Category Chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'All' ? 'Tüm İlaçlar' : cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Medicine List */}
        <section className="medicines-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              İlaç fiyatları yükleniyor...
            </div>
          ) : medicines.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--bg-card-border)'
            }}>
              <Pill size={36} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>İlaç Bulunamadı</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Arama kriterinize uygun ilaç kaydı veya fatura bulunamadı.</p>
            </div>
          ) : (
            medicines.map((med) => (
              <div
                key={med.id}
                className="medicine-card"
                onClick={() => setSelectedMedicine(med)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-header-row">
                  <div>
                    <h3 className="medicine-title">{med.name}</h3>
                    <div className="medicine-meta">
                      <span className="badge badge-supplier">
                        <Building2 size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        {med.supplier}
                      </span>
                      <span className="badge badge-cat">{med.category}</span>
                      <span className="badge badge-cat" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
                        <Calendar size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        {med.lastUpdate ? `Güncellendi: ${med.lastUpdate}` : 'Tarih Belirtilmemiş'}
                      </span>
                    </div>
                  </div>

                  <button
                    className="history-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMedicine(med);
                    }}
                  >
                    Fiyat İlerlemesi →
                  </button>
                </div>

                <div className="price-row">
                  <div className="price-box">
                    <span className="price-label">Geliş (Alış) Fiyatı</span>
                    <span className="price-amount">{formatCurrency(med.currentPrice)}</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {med.previousPrice > 0 ? `Önceki: ${formatCurrency(med.previousPrice)}` : 'İlk Alış'}
                    </div>

                    <div className={`price-change-badge ${med.changeRate > 0 ? 'price-up' : med.changeRate < 0 ? 'price-down' : 'price-neutral'}`} style={{ marginTop: '4px' }}>
                      {med.changeRate > 0 ? <TrendingUp size={13} /> : med.changeRate < 0 ? <TrendingDown size={13} /> : null}
                      {med.changeRate > 0 ? `+%${med.changeRate}` : med.changeRate < 0 ? `%${med.changeRate}` : 'Değişim Yok'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Bottom Nav Bar (Mobile Native Experience) */}
      <nav className="bottom-nav">
        <button className="nav-item active" onClick={() => loadData()}>
          <Pill size={18} />
          <span>İlaçlar</span>
        </button>
        <button className="nav-item" onClick={() => setShowInvoicesModal(true)}>
          <FileText size={18} />
          <span>Faturalar</span>
        </button>
        <button className="nav-item" onClick={() => setShowPdfModal(true)}>
          <UploadCloud size={18} />
          <span>PDF Yükle</span>
        </button>
        <button className="nav-item" onClick={() => setShowMailModal(true)}>
          <Mail size={18} />
          <span>Mail Ayarı</span>
        </button>
      </nav>

      {/* Modals */}
      {selectedMedicine && (
        <PriceHistoryModal
          medicine={selectedMedicine}
          onClose={() => setSelectedMedicine(null)}
        />
      )}

      {showPdfModal && (
        <PdfUploaderModal
          onClose={() => setShowPdfModal(false)}
          onUploadSuccess={() => {
            setShowPdfModal(false);
            loadData();
          }}
        />
      )}

      {showMailModal && (
        <MailSettingsModal
          onClose={() => setShowMailModal(false)}
          onSaveSuccess={() => {
            setShowMailModal(false);
            loadData();
          }}
        />
      )}

      {showInvoicesModal && (
        <InvoicesModal
          invoices={invoices}
          onClose={() => setShowInvoicesModal(false)}
        />
      )}
    </div>
  );
}
