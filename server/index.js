import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { getDb, saveDb } from './store.js';
import { parseInvoicePdf } from './pdfParser.js';
import { fetchInvoiceEmails, mergeInvoicesToDb } from './mailService.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Multer memory storage for PDF file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// GET /api/medicines - Fetch medicines with sorting and searching
app.get('/api/medicines', (req, res) => {
  try {
    const db = getDb();
    let medicines = [...db.medicines];
    const { sort, order, search, category } = req.query;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      medicines = medicines.filter(
        m => m.name.toLowerCase().includes(q) ||
             (m.supplier && m.supplier.toLowerCase().includes(q)) ||
             (m.category && m.category.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (category && category !== 'All') {
      medicines = medicines.filter(m => m.category === category);
    }

    // Sorting: default by currentPrice (Geliş Fiyatı)
    const sortKey = sort || 'currentPrice';
    const isAsc = order === 'asc';

    medicines.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (typeof valA === 'string') {
        return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return isAsc ? valA - valB : valB - valA;
    });

    res.json({
      success: true,
      count: medicines.length,
      medicines
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/invoices - Fetch invoice history
app.get('/api/invoices', (req, res) => {
  try {
    const db = getDb();
    res.json({ success: true, invoices: db.invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/upload-pdf - Handle manual PDF invoice upload
app.post('/api/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF dosyası yüklenmedi.' });
    }

    const parsedInvoice = await parseInvoicePdf(req.file.buffer, req.file.originalname);
    parsedInvoice.source = 'Manuel PDF Yükleme';

    mergeInvoicesToDb([parsedInvoice]);

    res.json({
      success: true,
      message: 'PDF başarıyla analiz edildi ve ilaç geliş fiyatları güncellendi.',
      invoice: parsedInvoice
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ success: false, message: 'PDF işlenirken hata oluştu: ' + error.message });
  }
});

// POST /api/clear-data - Clear all test medicines and invoices
app.post('/api/clear-data', (req, res) => {
  try {
    const db = getDb();
    db.medicines = [];
    db.invoices = [];
    saveDb(db);
    res.json({ success: true, message: 'Tüm test verileri (ilaçlar ve faturalar) başarıyla temizlendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/fetch-mails - Trigger mail sync
app.post('/api/fetch-mails', async (req, res) => {
  try {
    const result = await fetchInvoiceEmails();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET & POST /api/settings - IMAP config
app.get('/api/settings', (req, res) => {
  const db = getDb();
  // Hide password in response
  const settings = { ...db.settings };
  delete settings.password;
  res.json({ success: true, settings });
});

app.post('/api/settings', (req, res) => {
  try {
    const db = getDb();
    db.settings = {
      ...db.settings,
      ...req.body
    };
    saveDb(db);
    res.json({ success: true, message: 'E-Posta ayarları başarıyla kaydedildi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VetPr Express backend server running on http://0.0.0.0:${PORT}`);
});
