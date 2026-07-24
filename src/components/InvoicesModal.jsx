import React from 'react';
import { X, FileText, Calendar, Building2, CheckCircle2, DollarSign } from 'lucide-react';

export default function InvoicesModal({ invoices, onClose }) {
  const formatCurrency = (val) => `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText color="var(--accent-cyan)" /> İşlenen Fatura Geçmişi ({invoices.length})
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          E-posta veya manuel yüklenen PDF faturalarının listesi. Her fatura ile ilaç alış fiyatları güncellenmiştir.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {invoices.map((inv) => (
            <div key={inv.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-card-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} color="var(--accent-cyan)" /> {inv.supplier}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span><FileText size={12} style={{ verticalAlign: 'middle' }} /> {inv.invoiceNo}</span>
                  <span><Calendar size={12} style={{ verticalAlign: 'middle' }} /> {inv.date}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', marginTop: '2px', fontWeight: 600 }}>
                  {inv.source} • {inv.itemsCount} İlaç
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fatura Tutarı</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
                  {formatCurrency(inv.totalAmount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
