const ExcelJS = require('exceljs');

async function generateExcel(title, columns, rows) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EIMS';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title, {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  // Title row
  sheet.mergeCells(1, 1, 1, columns.length);
  const titleCell = sheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  // Date row
  sheet.mergeCells(2, 1, 2, columns.length);
  const dateCell = sheet.getCell('A2');
  dateCell.value = `Generated: ${new Date().toLocaleDateString('en-PK')}`;
  dateCell.font = { italic: true, size: 10 };
  dateCell.alignment = { horizontal: 'center' };

  // Header row
  const headerRow = sheet.addRow(columns.map(c => c.header));
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
  });

  // Set column widths
  columns.forEach((col, i) => {
    sheet.getColumn(i + 1).width = col.width || 18;
  });

  // Data rows
  rows.forEach((row, idx) => {
    const dataRow = sheet.addRow(row);
    const isEven = idx % 2 === 0;
    dataRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFFFFFFF' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
    });
  });

  return workbook.xlsx.writeBuffer();
}

module.exports = { generateExcel };
