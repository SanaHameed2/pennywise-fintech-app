import { useState } from 'react';
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
  const [exporting, setExporting] = useState(false);

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
    try {
      const allData = await fetchAllForExport(user.id, searchQuery, filterType, dateRange);
      if (allData.length === 0) {
        alert("No transactions found matching these filters.");
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
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pennywise_transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || exporting}
      className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}