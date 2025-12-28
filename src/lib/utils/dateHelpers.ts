import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  return format(new Date(date), formatStr, { locale: enUS });
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: enUS });
}

export function isDue(date: string | Date): boolean {
  return isPast(new Date(date)) || isToday(new Date(date));
}

export function getDaysUntil(date: string | Date): number {
  const now = new Date();
  const target = new Date(date);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

