import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../firebase';

export default function AuthModal({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    setLoading(true);
    setError('');

    let res;
    if (activeTab === 'register') {
      res = await registerWithEmail(email, password);
    } else {
      res = await loginWithEmail(email, password);
    }

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else if (res.user) {
      if (onLoginSuccess) onLoginSuccess(res.user);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { user, error: err } = await loginWithGoogle();
    setLoading(false);
    if (err) {
      setError('Google ile giriş yapılırken bir hata oluştu: ' + err);
    } else if (user) {
      if (onLoginSuccess) onLoginSuccess(user);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <img src="/favicon.svg" alt="VetPr Logo" className="auth-logo" />
          </div>
          <h2>VetPr Cloud'a Hoş Geldiniz</h2>
          <p>Veteriner İlaç Geliş Fiyatı & E-Fatura Takip Sistemi</p>
        </div>

        {/* Tab Selector */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setError(''); }}
          >
            <LogIn size={15} /> Giriş Yap
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setError(''); }}
          >
            <UserPlus size={15} /> Kayıt Ol
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">E-Posta Adresi</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                className="form-input icon-padded" 
                placeholder="veteriner@ornek.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Şifre</label>
            <div className="input-with-icon">
              <KeyRound size={16} className="input-icon" />
              <input 
                type="password" 
                className="form-input icon-padded" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'İşlem yapılıyor...' : (activeTab === 'register' ? 'Hesap Oluştur' : 'E-Posta ile Giriş Yap')}
          </button>
        </form>

        <div className="auth-divider">
          <span>VEYA</span>
        </div>

        {/* Google Login Button */}
        <button 
          type="button"
          className="btn-google-login" 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="google-svg" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Google ile Hızlı Giriş Yap
        </button>

        <div className="auth-footer">
          <Lock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Verileriniz 256-bit Firestore Güvenlik Kuralları ile gizlidir.
        </div>
      </div>
    </div>
  );
}
