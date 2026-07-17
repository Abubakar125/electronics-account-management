const PDFDocument = require('pdfkit');

function generateReceipt(payment) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A5', margin: 40 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const account = payment.account;
    const customer = account?.customer;
    const settings = payment.settings || {};

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text(settings.company_name || 'Farhan Electronics', { align: 'center' });
    if (settings.phone) doc.fontSize(10).font('Helvetica').text(settings.phone, { align: 'center' });
    if (settings.address) doc.fontSize(9).text(settings.address, { align: 'center' });

    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(14).font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
    doc.moveDown(0.5);

    // Receipt details
    const labelX = 40;
    const valueX = 180;

    const addRow = (label, value) => {
      const y = doc.y;
      doc.fontSize(10).font('Helvetica-Bold').text(label, labelX, y);
      doc.fontSize(10).font('Helvetica').text(String(value || '-'), valueX, y);
      doc.moveDown(0.4);
    };

    addRow('Receipt No:', payment.receipt_no);
    addRow('Date:', new Date(payment.payment_date).toLocaleDateString('en-PK'));
    doc.moveDown(0.3);
    addRow('Customer:', customer?.name || '-');
    addRow('Customer Code:', customer?.customer_code || '-');
    addRow('Phone:', customer?.phone1 || '-');
    doc.moveDown(0.3);
    addRow('Account No:', account?.account_number || '-');
    addRow('Product:', account?.product_name || '-');
    doc.moveDown(0.3);
    addRow('Amount Paid:', `${settings.currency || 'PKR'} ${parseFloat(payment.amount).toLocaleString()}`);
    addRow('Remaining Balance:', `${settings.currency || 'PKR'} ${parseFloat(payment.remaining_balance).toLocaleString()}`);
    if (payment.remarks) addRow('Remarks:', payment.remarks);

    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.5);

    const footer = settings.receipt_footer || 'Thank you for your payment!';
    doc.fontSize(9).font('Helvetica').text(footer, { align: 'center' });

    doc.end();
  });
}

function generateReport(title, headers, rows, totals = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString('en-PK')}`, { align: 'center' });
    doc.moveDown(1);

    // Table headers
    const colWidth = (doc.page.width - 80) / headers.length;
    let x = 40;
    const headerY = doc.y;

    doc.rect(40, headerY - 5, doc.page.width - 80, 20).fill('#1e40af');
    headers.forEach(h => {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('white').text(h, x + 2, headerY, { width: colWidth - 4 });
      x += colWidth;
    });

    doc.fillColor('black');
    doc.moveDown(0.8);

    // Table rows
    rows.forEach((row, idx) => {
      if (doc.y > doc.page.height - 80) {
        doc.addPage();
      }
      x = 40;
      const rowY = doc.y;
      if (idx % 2 === 1) doc.rect(40, rowY - 3, doc.page.width - 80, 16).fill('#f8fafc');
      doc.fillColor('black');
      row.forEach(cell => {
        doc.fontSize(8).font('Helvetica').text(String(cell || '-'), x + 2, rowY, { width: colWidth - 4 });
        x += colWidth;
      });
      doc.moveDown(0.5);
    });

    if (Object.keys(totals).length) {
      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
      doc.moveDown(0.3);
      Object.entries(totals).forEach(([label, value]) => {
        doc.fontSize(10).font('Helvetica-Bold').text(`${label}: ${value}`, { align: 'right' });
      });
    }

    doc.end();
  });
}

module.exports = { generateReceipt, generateReport };
