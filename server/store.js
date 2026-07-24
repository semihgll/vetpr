import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/db.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial Mock Seed Data representing real-world veterinary medicines & invoices
const seedData = {
  settings: {
    mailAccounts: [
      {
        id: 'acc-1',
        title: 'Klinik Sipariş Maillleri (Gmail)',
        email: 'siparis@vetklinik.com',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        password: '',
        active: true
      },
      {
        id: 'acc-2',
        title: 'Ecza Deposu Fatura Maili (Outlook)',
        email: 'fatura@vetklinik.com',
        host: 'outlook.office365.com',
        port: 993,
        tls: true,
        password: '',
        active: true
      }
    ],
    autoSync: false,
    lastSync: null
  },
  invoices: [
    {
      id: 'inv-101',
      invoiceNo: 'SEL2026071501',
      supplier: 'Selçuk Ecza Deposu',
      date: '2026-07-15',
      totalAmount: 18450.00,
      source: 'PDF Yükleme',
      itemsCount: 5
    },
    {
      id: 'inv-102',
      invoiceNo: 'HDF2026070204',
      supplier: 'Hedef Ecza Deposu',
      date: '2026-07-02',
      totalAmount: 24100.50,
      source: 'E-Posta (Entegre)',
      itemsCount: 4
    },
    {
      id: 'inv-103',
      invoiceNo: 'ZTS2026061809',
      supplier: 'Zoetis Veteriner Sağlık',
      date: '2026-06-18',
      totalAmount: 31200.00,
      source: 'E-Posta (Entegre)',
      itemsCount: 3
    }
  ],
  medicines: [
    {
      id: 'med-1',
      name: 'Synulox 250 mg 10 Tablet',
      barcode: '8699500010012',
      category: 'Antibiyotik',
      manufacturer: 'Zoetis',
      unit: 'Kutu',
      currentPrice: 420.00, // En son geliş fiyatı
      previousPrice: 380.00, // Önceki geliş fiyatı
      changeRate: 10.53, // % Artış
      supplier: 'Selçuk Ecza Deposu',
      lastUpdate: '2026-07-15',
      history: [
        { date: '2026-05-10', price: 350.00, supplier: 'Hedef Ecza Deposu', invoiceNo: 'HDF2026051001' },
        { date: '2026-06-01', price: 380.00, supplier: 'Selçuk Ecza Deposu', invoiceNo: 'SEL2026060144' },
        { date: '2026-07-15', price: 420.00, supplier: 'Selçuk Ecza Deposu', invoiceNo: 'SEL2026071501' }
      ]
    },
    {
      id: 'med-2',
      name: 'Catosal %10 Enjeksiyonluk Çözelti 100 ml',
      barcode: '8699500020059',
      category: 'Metabolik / Vitamin',
      manufacturer: 'Elanco',
      unit: 'Flakon',
      currentPrice: 850.00,
      previousPrice: 890.00,
      changeRate: -4.49, // % Düşüş (İndirim)
      supplier: 'Hedef Ecza Deposu',
      lastUpdate: '2026-07-02',
      history: [
        { date: '2026-05-15', price: 820.00, supplier: 'Selçuk Ecza Deposu', invoiceNo: 'SEL2026051512' },
        { date: '2026-06-10', price: 890.00, supplier: 'Selçuk Ecza Deposu', invoiceNo: 'SEL2026061088' },
        { date: '2026-07-02', price: 850.00, supplier: 'Hedef Ecza Deposu', invoiceNo: 'HDF2026070204' }
      ]
    },
    {
      id: 'med-3',
      name: 'Draxxin 100 mg/ml Enjeksiyonluk 50 ml',
      barcode: '8699500030119',
      category: 'Solunum / Antibiyotik',
      manufacturer: 'Zoetis',
      unit: 'Flakon',
      currentPrice: 3450.00,
      previousPrice: 3100.00,
      changeRate: 11.29,
      supplier: 'Zoetis Veteriner Sağlık',
      lastUpdate: '2026-06-18',
      history: [
        { date: '2026-04-12', price: 2950.00, supplier: 'Zoetis Veteriner Sağlık', invoiceNo: 'ZTS2026041201' },
        { date: '2026-05-20', price: 3100.00, supplier: 'Selçuk Ecza Deposu', invoiceNo: 'SEL2026052033' },
        { date: '2026-06-18', price: 3450.00, supplier: 'Zoetis Veteriner Sağlık', invoiceNo: 'ZTS2026061809' }
      ]
    },
    {
      id: 'med-4',
      name: 'Baytril %5 Enjeksiyonluk Çözelti 100 ml',
      barcode: '8699500040027',
      category: 'Antibiyotik',
      manufacturer: 'Elanco',
      unit: 'Flakon',
      currentPrice: 620.00,
      previousPrice: 620.00,
      changeRate: 0.00,
      supplier: 'Selçuk Ecza Deposu',
      lastUpdate: '2026-07-15',
      history: [
        { date: '2026-06-05', price: 620.00, supplier: 'Selçuk Ecza Deposu', invoiceNo: 'SEL2026060502' },
        { date: '2026-07-15', price: 620.00, supplier: 'Selçuk Ecza Deposu', invoiceNo: 'SEL2026071501' }
      ]
    },
    {
      id: 'med-5',
      name: 'Rimadyl 50 mg 20 Tablet',
      barcode: '8699500050880',
      category: 'Anti-enflamatuar / Ağrı Kesici',
      manufacturer: 'Zoetis',
      unit: 'Kutu',
      currentPrice: 540.00,
      previousPrice: 490.00,
      changeRate: 10.20,
      supplier: 'Hedef Ecza Deposu',
      lastUpdate: '2026-07-02',
      history: [
        { date: '2026-05-01', price: 460.00, supplier: 'Hedef Ecza Deposu', invoiceNo: 'HDF2026050110' },
        { date: '2026-06-11', price: 490.00, supplier: 'Selçuk Ecza Deposu', invoiceNo: 'SEL2026061109' },
        { date: '2026-07-02', price: 540.00, supplier: 'Hedef Ecza Deposu', invoiceNo: 'HDF2026070204' }
      ]
    },
    {
      id: 'med-6',
      name: 'Vetrimoxin L.A. 250 ml Enjeksiyonluk Süspansiyon',
      barcode: '8699500060308',
      category: 'Antibiyotik',
      manufacturer: 'Ceva',
      unit: 'Flakon',
      currentPrice: 780.00,
      previousPrice: 720.00,
      changeRate: 8.33,
      supplier: 'Selçuk Ecza Deposu',
      lastUpdate: '2026-07-15',
      history: [
        { date: '2026-05-18', price: 700.00, supplier: 'Selçuk Ecza Deposu', invoiceNo: 'SEL2026051877' },
        { date: '2026-06-14', price: 720.00, supplier: 'Hedef Ecza Deposu', invoiceNo: 'HDF2026061405' },
        { date: '2026-07-15', price: 780.00, supplier: 'Selçuk Ecza Deposu', invoiceNo: 'SEL2026071501' }
      ]
    },
    {
      id: 'med-7',
      name: 'Flunixin %5 Enjeksiyonluk 100 ml',
      barcode: '8699500070147',
      category: 'Anti-enflamatuar',
      manufacturer: 'Atafen',
      unit: 'Flakon',
      currentPrice: 390.00,
      previousPrice: 410.00,
      changeRate: -4.88,
      supplier: 'Hedef Ecza Deposu',
      lastUpdate: '2026-07-02',
      history: [
        { date: '2026-05-02', price: 410.00, supplier: 'Hedef Ecza Deposu', invoiceNo: 'HDF2026050201' },
        { date: '2026-07-02', price: 390.00, supplier: 'Hedef Ecza Deposu', invoiceNo: 'HDF2026070204' }
      ]
    }
  ]
};

export function getDb() {
  if (!fs.existsSync(DB_PATH)) {
    saveDb(seedData);
    return seedData;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.settings) data.settings = seedData.settings;
    if (!data.settings.mailAccounts) {
      data.settings.mailAccounts = seedData.settings.mailAccounts;
      saveDb(data);
    }
    return data;
  } catch (err) {
    console.error('Error reading db.json, returning seed:', err);
    return seedData;
  }
}

export function saveDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}
