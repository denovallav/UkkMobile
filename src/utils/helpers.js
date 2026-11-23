import moment from 'moment';
import 'moment/locale/id';

moment.locale('id');

export const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateStr) => {
  return moment(dateStr).format('D MMMM YYYY');
};

export const formatDateShort = (dateStr) => {
  return moment(dateStr).format('DD MMM YYYY');
};

export const formatDateTime = (dateStr) => {
  return moment(dateStr).format('D MMMM YYYY, HH:mm');
};

export const getDaysUntil = (dateStr) => {
  const diff = moment(dateStr).diff(moment(), 'days');
  return diff;
};

export const getQuotaPercent = (remaining, total) => {
  return (remaining / total) * 100;
};

export const getQuotaColor = (percent) => {
  if (percent <= 10) return '#FF6B6B';
  if (percent <= 30) return '#FFD93D';
  return '#43E97B';
};

export const generateOrderId = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${dateStr}-${random}`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'verified': return '#43E97B';
    case 'waiting': return '#FFD93D';
    case 'rejected': return '#FF6B6B';
    default: return '#A0A0C0';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'verified': return 'Terverifikasi';
    case 'waiting': return 'Menunggu Verifikasi';
    case 'rejected': return 'Ditolak';
    default: return 'Menunggu Pembayaran';
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'verified': return 'checkmark-circle';
    case 'waiting': return 'time';
    case 'rejected': return 'close-circle';
    default: return 'ellipse-outline';
  }
};
