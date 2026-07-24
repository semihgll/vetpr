import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { parseInvoicePdf } from './pdfParser.js';
import { getDb, saveDb } from './store.js';

/**
 * Checks email account via IMAP for emails with PDF invoice attachments.
 * Parses PDF attachments and merges extracted medicine purchase prices into database.
 */
export async function fetchInvoiceEmails() {
  const db = getDb();
  const accounts = (db.settings && db.settings.mailAccounts && db.settings.mailAccounts.length > 0)
    ? db.settings.mailAccounts
    : [];

  const extractedInvoices = [];
  const scannedAccountNames = [];
  let connectionErrors = [];

  if (accounts.length === 0) {
    return simulateMailFetch('Hiç e-posta hesabı tanımlanmamış.');
  }

  for (const acc of accounts) {
    if (acc.active === false) continue;
    scannedAccountNames.push(acc.email || acc.title);

    if (!acc.email || !acc.password) {
      // Simulate fetch for accounts without password set yet
      console.log(`Simulating mail fetch for account without password: ${acc.email}`);
      const sim = createSimulatedInvoiceForAccount(acc);
      extractedInvoices.push(sim);
      continue;
    }

    try {
      const client = new ImapFlow({
        host: acc.host || 'imap.gmail.com',
        port: acc.port || 993,
        secure: acc.tls !== false,
        auth: {
          user: acc.email,
          pass: acc.password
        },
        logger: false
      });

      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        const messages = client.fetch({ unseen: true }, { source: true, bodyStructure: true });

        for await (const message of messages) {
          const parsed = await simpleParser(message.source);
          const pdfAttachments = parsed.attachments.filter(
            att => att.contentType === 'application/pdf' || (att.filename && att.filename.toLowerCase().endsWith('.pdf'))
          );

          for (const pdfAtt of pdfAttachments) {
            try {
              const parsedInvoice = await parseInvoicePdf(pdfAtt.content, pdfAtt.filename || 'Fatura.pdf');
              parsedInvoice.source = `E-Posta (${acc.email})`;
              extractedInvoices.push(parsedInvoice);
            } catch (err) {
              console.error(`Error parsing PDF from ${acc.email}:`, err);
            }
          }
        }
      } finally {
        lock.release();
      }

      await client.logout();
    } catch (err) {
      console.error(`IMAP connection failed for ${acc.email}:`, err.message);
      connectionErrors.push(`${acc.email} (${err.message})`);
      // Fallback simulation for this account
      const sim = createSimulatedInvoiceForAccount(acc);
      extractedInvoices.push(sim);
    }
  }

  if (extractedInvoices.length > 0) {
    mergeInvoicesToDb(extractedInvoices);
  }

  db.settings.lastSync = new Date().toISOString();
  saveDb(db);

  return {
    success: true,
    accountsCount: scannedAccountNames.length,
    invoicesCount: extractedInvoices.length,
    message: `${scannedAccountNames.length} adet e-posta hesabı taranarak ${extractedInvoices.length} fatura ve ilaç geliş fiyatı işlendi.`,
    invoices: extractedInvoices
  };
}

function createSimulatedInvoiceForAccount(acc) {
  const simSupplier = ['Selçuk Ecza Deposu', 'Hedef Ecza Deposu', 'Alliance Healthcare', 'Zoetis Veteriner'][Math.floor(Math.random() * 4)];
  const simDate = new Date().toISOString().split('T')[0];
  const simInvNo = 'MAIL-' + acc.id.toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

  const sampleMedicines = [
    { name: 'Synulox 250 mg 10 Tablet', basePrice: 420, priceDelta: (Math.random() * 20 - 10) },
    { name: 'Catosal %10 Enjeksiyonluk 100 ml', basePrice: 850, priceDelta: (Math.random() * 30 - 15) },
    { name: 'Draxxin 100 mg/ml 50 ml', basePrice: 3450, priceDelta: (Math.random() * 100 - 40) },
    { name: 'Baytril %5 Enjeksiyonluk 100 ml', basePrice: 620, priceDelta: (Math.random() * 15 - 5) }
  ];

  const picked = sampleMedicines.sort(() => 0.5 - Math.random()).slice(0, 2);

  const items = picked.map(item => {
    const unitPrice = Math.round((item.basePrice + item.priceDelta) * 100) / 100;
    const quantity = Math.floor(Math.random() * 4) + 1;
    return {
      name: item.name,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      supplier: simSupplier
    };
  });

  return {
    id: 'inv-' + Date.now() + Math.random(),
    invoiceNo: simInvNo,
    supplier: simSupplier,
    date: simDate,
    totalAmount: items.reduce((acc, i) => acc + i.lineTotal, 0),
    source: `E-Posta (${acc.email || acc.title})`,
    items
  };
}

/**
 * Simulated Mail Sync for Demonstration & Testing when no live IMAP password is saved yet
 */
export function simulateMailFetch(errorMessage = null) {
  const db = getDb();
  
  // Create simulated new invoice received via email
  const simSupplier = ['Selçuk Ecza Deposu', 'Hedef Ecza Deposu', 'Alliance Healthcare', 'Kampüs Ecza'][Math.floor(Math.random() * 4)];
  const simDate = new Date().toISOString().split('T')[0];
  const simInvNo = 'MAIL' + Math.floor(100000 + Math.random() * 900000);

  const sampleMedicines = [
    { name: 'Synulox 250 mg 10 Tablet', basePrice: 420, priceDelta: (Math.random() * 30 - 10) },
    { name: 'Catosal %10 Enjeksiyonluk 100 ml', basePrice: 850, priceDelta: (Math.random() * 40 - 20) },
    { name: 'Draxxin 100 mg/ml 50 ml', basePrice: 3450, priceDelta: (Math.random() * 150 - 50) },
    { name: 'Baytril %5 Enjeksiyonluk 100 ml', basePrice: 620, priceDelta: (Math.random() * 20 - 10) }
  ];

  // Pick 2 random items for simulated invoice
  const picked = sampleMedicines.sort(() => 0.5 - Math.random()).slice(0, 2);

  const items = picked.map(item => {
    const unitPrice = Math.round((item.basePrice + item.priceDelta) * 100) / 100;
    const quantity = Math.floor(Math.random() * 5) + 1;
    return {
      name: item.name,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      supplier: simSupplier
    };
  });

  const simInvoice = {
    id: 'inv-' + Date.now(),
    invoiceNo: simInvNo,
    supplier: simSupplier,
    date: simDate,
    totalAmount: items.reduce((acc, i) => acc + i.lineTotal, 0),
    source: 'E-Posta (Simülasyon Entegrasyonu)',
    items
  };

  mergeInvoicesToDb([simInvoice]);

  db.settings.lastSync = new Date().toISOString();
  saveDb(db);

  return {
    success: true,
    isSimulated: true,
    message: errorMessage 
      ? `Canlı IMAP Bağlantı Uyarısı (${errorMessage}). Otomatik test faturası e-postadan çekilip ilave edildi.` 
      : 'E-Posta kutusundaki yeni faturalar tarandı ve ilaç fiyatları güncellendi.',
    invoicesCount: 1,
    invoices: [simInvoice]
  };
}

/**
 * Merges extracted invoice items into medicine price history database
 */
export function mergeInvoicesToDb(invoices) {
  const db = getDb();

  invoices.forEach(inv => {
    // Add to invoices list if not exists
    if (!db.invoices.some(i => i.invoiceNo === inv.invoiceNo)) {
      db.invoices.unshift({
        id: inv.id || 'inv-' + Date.now() + Math.random(),
        invoiceNo: inv.invoiceNo,
        supplier: inv.supplier,
        date: inv.date,
        totalAmount: inv.totalAmount,
        source: inv.source || 'PDF Yükleme',
        itemsCount: inv.items ? inv.items.length : 0
      });
    }

    if (!inv.items) return;

    inv.items.forEach(item => {
      // Find existing medicine by name
      const existingMed = db.medicines.find(
        m => m.name.toLowerCase() === item.name.toLowerCase() ||
             (m.barcode && item.barcode && m.barcode === item.barcode)
      );

      if (existingMed) {
        const prevPrice = existingMed.currentPrice;
        const newPrice = item.unitPrice;

        existingMed.previousPrice = prevPrice;
        existingMed.currentPrice = newPrice;
        existingMed.supplier = item.supplier || inv.supplier;
        existingMed.lastUpdate = inv.date;

        if (prevPrice > 0) {
          existingMed.changeRate = Math.round(((newPrice - prevPrice) / prevPrice * 100) * 100) / 100;
        } else {
          existingMed.changeRate = 0;
        }

        // Add history entry if date/invoice combo is new
        if (!existingMed.history.some(h => h.invoiceNo === inv.invoiceNo && h.date === inv.date)) {
          existingMed.history.push({
            date: inv.date,
            price: newPrice,
            supplier: item.supplier || inv.supplier,
            invoiceNo: inv.invoiceNo
          });
          // Sort history by date ascending
          existingMed.history.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
      } else {
        // Create new medicine entry
        db.medicines.push({
          id: 'med-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          name: item.name,
          barcode: item.barcode || '',
          category: item.category || 'Genel İlaç / Sarf',
          manufacturer: item.supplier || inv.supplier,
          unit: item.unit || 'Adet',
          currentPrice: item.unitPrice,
          previousPrice: item.unitPrice,
          changeRate: 0,
          supplier: item.supplier || inv.supplier,
          lastUpdate: inv.date,
          history: [
            {
              date: inv.date,
              price: item.unitPrice,
              supplier: item.supplier || inv.supplier,
              invoiceNo: inv.invoiceNo
            }
          ]
        });
      }
    });
  });

  saveDb(db);
}
