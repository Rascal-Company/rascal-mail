import { format, formatDistanceToNow } from 'date-fns';
import { fi } from 'date-fns/locale';

// Finnish date formatting (pp.kk.vvvv)
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'd.M.yyyy', { locale: fi });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'd.M.yyyy HH:mm', { locale: fi });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: fi });
}

// Finnish number formatting (1 234,56)
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fi-FI').format(num);
}

export function formatPercent(num: number): string {
  return new Intl.NumberFormat('fi-FI', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num / 100);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace('.', ',')} M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace('.', ',')} k`;
  }
  return formatNumber(num);
}
