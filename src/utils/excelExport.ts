// Universal Excel / CSV Exporter with UTF-8 BOM Support for English, Urdu & Arabic

export interface ExcelColumn {
  header: string;
  key: string;
  align?: 'left' | 'center' | 'right';
  width?: number;
}

export interface ExcelExportOptions {
  filename: string;
  title: string;
  madrasaName?: string;
  metadata?: Record<string, string | number>;
  columns: ExcelColumn[];
  data: Record<string, any>[];
  totals?: Record<string, string | number>;
}

export function exportToExcelTable(options: ExcelExportOptions) {
  const { filename, title, madrasaName, metadata, columns, data, totals } = options;

  const lines: string[] = [];

  // 1. Institution & Report Header Block
  if (madrasaName) {
    lines.push(`"${madrasaName.replace(/"/g, '""')}"`);
  }
  lines.push(`"${title.replace(/"/g, '""')}"`);
  lines.push(`"Generated On: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}"`);

  // 2. Metadata Block (Filters, Period, etc.)
  if (metadata) {
    const metaEntries = Object.entries(metadata).map(([k, v]) => `"${k}: ${String(v).replace(/"/g, '""')}"`);
    lines.push(metaEntries.join(','));
  }

  // Blank row separator
  lines.push('');

  // 3. Columns Header Row
  const headerRow = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
  lines.push(headerRow);

  // 4. Data Rows
  data.forEach((row, index) => {
    const rowValues = columns.map(col => {
      let val = row[col.key];
      if (col.key === 'sNo' && (val === undefined || val === null)) {
        val = index + 1;
      }
      if (val === undefined || val === null) {
        return '""';
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    lines.push(rowValues.join(','));
  });

  // 5. Totals / Summary Row
  if (totals) {
    const totalRow = columns.map(col => {
      const totalVal = totals[col.key];
      if (totalVal !== undefined && totalVal !== null) {
        return `"${String(totalVal).replace(/"/g, '""')}"`;
      }
      return '""';
    });
    lines.push(totalRow.join(','));
  }

  // UTF-8 BOM prefix (\uFEFF) ensures Excel opens with accurate Urdu/Arabic diacritics
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
