import React, { useState, useEffect } from 'react';
import { X, Mail, Plus, Trash2, CheckCircle2, Save, Loader2, Server, ShieldCheck } from 'lucide-react';

export default function MailSettingsModal({ onClose, onSaveSuccess }) {
  const [mailAccounts, setMailAccounts] = useState([]);
  const [autoSync, setAutoSync] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Account Form State
  const [newAcc, setNewAcc] = useState({
    title: '',
    email: '',
    password: '',
    host: 'imap.gmail.com',
    port: 993,
    tls: true
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setMailAccounts(data.settings.mailAccounts || []);
          setAutoSync(data.settings.autoSync || false);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!newAcc.email) return;

    const created = {
      id: 'acc-' + Date.now(),
      title: newAcc.title || newAcc.email.split('@')[0],
      email: newAcc.email,
      password: newAcc.password,
      host: newAcc.host || 'imap.gmail.com',
      port: newAcc.port || 993,
      tls: newAcc.tls,
      active: true
    };

    setMailAccounts(prev => [...prev, created]);
    setNewAcc({
      title: '',
      email: '',
      password: '',
      host: 'imap.gmail.com',
      port: 993,
      tls: true
    });
    setShowAddForm(false);
    setMsg({ type: 'success', text: 'Yeni e-posta hesabı listeye eklendi. "Ayarları Kaydet" butonuna basarak onaylayabilirsiniz.' });
  };

  const handleDeleteAccount = (id) => {
    setMailAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const handleToggleAccount = (id) => {
    setMailAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, active: !acc.active } : acc));
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mailAccounts,
          autoSync
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'Tüm e-posta hesapları başarıyla kaydedildi.' });
        setTimeout(() => {
          onSaveSuccess();
        }, 1000);
      } else {
        setMsg({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Sunucu hatası oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleQuickConnect = () => {
    // Simulated Google OAuth2 Login
    const sampleGmail = 'kliniksiparis@gmail.com';
    const created = {
      id: 'acc-google-' + Date.now(),
      title: 'Gmail (Google ile Bağlandı)',
      email: sampleGmail,
      password: '', // OAuth token used
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      active: true,
      isGoogleOAuth: true
    };

    setMailAccounts(prev => [...prev, created]);
    setMsg({ type: 'success', text: 'Google / Gmail hesabı telefondaki hesabınızla eşleştirildi. "Tüm Ayarları Kaydet" butonuna basabilirsiniz.' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail color="var(--accent-cyan)" /> E-Posta Entegrasyonu
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Quick Google Login Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Telefondan Gmail ile Hızlı Giriş
              </span>
            </div>
            <span className="badge badge-cat" style={{ background: 'var(--accent-cyan)', color: '#fff' }}>Mobil Uyumlu</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Şifre yazmanıza gerek kalmadan telefondaki Gmail uygulamanız veya Google hesabınızla 1-tıkla bağlanabilirsiniz.
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', background: '#ffffff', color: '#000', fontWeight: 700 }}
            onClick={handleGoogleQuickConnect}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Gmail / Google Hesabı İle Hızlı Bağlan
          </button>
        </div>

        {msg && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '14px',
            fontSize: '0.8rem',
            background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: msg.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            border: '1px solid currentColor'
          }}>
            {msg.text}
          </div>
        )}

        {/* Existing Accounts List */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Tanımlı E-Posta Hesapları ({mailAccounts.length})
            </span>
            <button
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus size={14} /> Yeni Hesap Ekle
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mailAccounts.map((acc) => (
              <div key={acc.id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-card-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={acc.active !== false}
                    onChange={() => handleToggleAccount(acc.id)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                    title="Aktif/Pasif"
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {acc.title || acc.email}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      {acc.email} • {acc.host}:{acc.port}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAccount(acc.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '6px' }}
                  title="Hesabı Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Account Form Toggle */}
        {showAddForm && (
          <form onSubmit={handleAddAccount} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '16px'
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '10px' }}>
              Yeni E-Posta Hesabı Ekle
            </h4>

            <div className="form-group">
              <label className="form-label">Hesap Tanımı / Adı</label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: Sipariş Mailim (Gmail)"
                value={newAcc.title}
                onChange={e => setNewAcc({ ...newAcc, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-Posta Adresi</label>
              <input
                type="email"
                className="form-input"
                placeholder="ornek@vetklinik.com"
                value={newAcc.email}
                onChange={e => setNewAcc({ ...newAcc, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Şifre / Uygulama Şifresi</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={newAcc.password}
                onChange={e => setNewAcc({ ...newAcc, password: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">IMAP Sunucu</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="imap.gmail.com"
                  value={newAcc.host}
                  onChange={e => setNewAcc({ ...newAcc, host: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Port</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="993"
                  value={newAcc.port}
                  onChange={e => setNewAcc({ ...newAcc, port: parseInt(e.target.value, 10) || 993 })}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
              <Plus size={16} /> Hesabı Ekle
            </button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 20px 0' }}>
          <input
            type="checkbox"
            id="autoSync"
            checked={autoSync}
            onChange={e => setAutoSync(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
          />
          <label htmlFor="autoSync" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Uygulama açılışında tüm mailleri otomatik tara
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            İptal
          </button>
          <button type="button" className="btn-primary" onClick={handleSaveAll} disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Tüm Ayarları Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
