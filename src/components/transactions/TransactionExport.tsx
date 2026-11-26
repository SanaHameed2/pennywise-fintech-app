import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchAllForExport, FilterType, DateRange } from '../../hooks/useTransactions';

interface Props {
  searchQuery: string;
  filterType: FilterType;
  dateRange: DateRange;
  disabled?: boolean;
}

export function TransactionExport({ searchQuery, filterType, dateRange, disabled }: Props) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const escapeCsvValue = (val: any) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (!isNaN(Number(str))) return str;
    if (/^[=+\-@]/.test(str)) str = `'${str}`;
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    setStatus(null);
    try {
      const allData = await fetchAllForExport(user.id, searchQuery, filterType, dateRange);
      if (allData.length === 0) {
        setStatus({ ok: false, text: t('transactions.exportEmpty') });
        return;
      }

      const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Currency', 'Status'];
      const rows = allData.map(tx => [
        new Date(tx.created_at).toISOString(),
        escapeCsvValue(tx.description),
        escapeCsvValue(tx.category),
        escapeCsvValue(tx.type),
        escapeCsvValue(tx.amount),
        escapeCsvValue(tx.currency),
        escapeCsvValue(tx.status),
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })  // BOM: Excel reads Urdu text correctly;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pennywise_transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus({ ok: true, text: t('transactions.exportDone') });
    } catch {
      setStatus({ ok: false, text: t('transactions.exportFailed') });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-1.5">
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={disabled || exporting}
        aria-busy={exporting}
        className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      >
        {exporting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Download className="w-4 h-4" aria-hidden="true" />}
        {exporting ? t('transactions.exporting') : t('transactions.exportCsv')}
      </button>
      <p role="status" className={`text-xs min-h-[1rem] ${status?.ok ? 'text-emerald-300' : 'text-red-300'}`}>{status?.text}</p>
    </div>
  );
}
