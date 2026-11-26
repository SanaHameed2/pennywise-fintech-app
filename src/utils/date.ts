// src/utils/date.ts
import i18n from '../lib/i18n';

export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  // Agar Urdu select hai, toh 'ur-PK' use karein
  const isUrdu = i18n.language === 'ur';
  const locale = isUrdu ? 'ur-PK' : 'en-PK';

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};