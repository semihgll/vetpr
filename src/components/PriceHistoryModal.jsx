import React from 'react';
import { X, TrendingUp, TrendingDown, Calendar, Building2, FileText } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function PriceHistoryModal({ medicine, onClose }) {
  if (!medicine) return null;

  const chartData = medicine.history.map(h => ({
    date: h.date,
    price: h.price,
    supplier: h.supplier
  }));

  const formatCurrency = (val) => `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge badge-cat">{medicine.category}</span>
            <h2 className="modal-title" style={{ marginTop: '4px' }}>{medicine.name}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Current Summary */}
        <div style={{
          background: 'var(--bg-card)',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid var(--bg-card-border)'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Son Alış / Geliş Fiyatı</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {formatCurrency(medicine.currentPrice)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Building2 size={12} /> {medicine.supplier}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fiyat Değişimi</div>
            <div className={`price-change-badge ${medicine.changeRate > 0 ? 'price-up' : medicine.changeRate < 0 ? 'price-down' : 'price-neutral'}`} style={{ display: 'inline-flex', marginTop: '4px' }}>
              {medicine.changeRate > 0 ? <TrendingUp size={14} /> : medicine.changeRate < 0 ? <TrendingDown size={14} /> : null}
              {medicine.changeRate > 0 ? `+${medicine.changeRate}%` : `${medicine.changeRate}%`}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Geliş Fiyatı Değişim Grafiği
          </h4>
          <div style={{ width: '100%', height: 200, background: 'var(--bg-card)', padding: '10px 10px 0 0', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} domain={['auto', 'auto']} tickFormatter={val => `₺${val}`} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [formatCurrency(value), 'Geliş Fiyatı']}
                  labelFormatter={(label) => `Tarih: ${label}`}
                />
                <Line type="monotone" dataKey="price" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ r: 5, fill: 'var(--accent-cyan)' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Purchase History Table / List */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Fiyat Güncelleme Tarihleri ve İlerleme Geçmişi</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{medicine.history.length} Alış Kaydı</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {medicine.history.slice().reverse().map((h, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--bg-card-border)',
                fontSize: '0.82rem'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} color="var(--accent-cyan)" /> {h.supplier}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                      <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                      Güncelleme Tarihi: {h.date}
                    </span>
                    <span><FileText size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} /> {h.invoiceNo}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
                    {formatCurrency(h.price)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Geliş Fiyatı</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
