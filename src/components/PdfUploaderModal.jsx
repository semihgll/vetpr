import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function PdfUploaderModal({ onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type === 'application/pdf' || selected.name.endsWith('.pdf')) {
        setFile(selected);
        setStatus(null);
      } else {
        setStatus({ type: 'error', message: 'Lütfen sadece PDF formatında e-Fatura veya irsaliye yükleyin.' });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setStatus({
          type: 'success',
          message: `${data.invoice.supplier} faturası analiz edildi. ${data.invoice.items.length} adet ilacın geliş fiyatı güncellendi.`
        });
        setFile(null);
        setTimeout(() => {
          onUploadSuccess();
        }, 1200);
      } else {
        setStatus({ type: 'error', message: data.message || 'PDF okuma hatası.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Sunucu ile bağlantı kurulamadı.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud color="var(--accent-cyan)" /> Fatura PDF Yükle
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Selçuk Ecza, Hedef Ecza, e-Fatura veya e-Arşiv PDF belgenizi buraya yükleyin. Sistem ilaç adlarını ve birim geliş fiyatlarını otomatik ayıklayacaktır.
        </p>

        {status && (
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            color: status.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
          }}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {status.message}
          </div>
        )}

        {/* Dropzone Area */}
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 20px',
          border: '2px dashed var(--bg-card-border)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease',
          marginBottom: '20px'
        }}>
          <FileText size={40} color="var(--accent-cyan)" style={{ marginBottom: '10px' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {file ? file.name : 'PDF Dosyası Seçin veya Buraya Sürükleyin'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Dokunun veya dosya seçiciyi açın'}
          </span>
          <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            İptal
          </button>
          <button className="btn-primary" onClick={handleUpload} disabled={!file || loading}>
            {loading ? <><Loader2 size={16} className="spin" /> Analiz Ediliyor...</> : 'PDF Otomatik Analiz Et'}
          </button>
        </div>
      </div>
    </div>
  );
}
