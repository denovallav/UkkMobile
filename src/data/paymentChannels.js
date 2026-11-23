// Kanal pembayaran yang ditampilkan di halaman checkout & payment gateway.
// Semua transaksi di sini masih simulasi (frontend only).

export const PAYMENT_GROUPS = [
  {
    group: 'QRIS',
    items: [
      {
        id: 'qris',
        name: 'QRIS',
        desc: 'Satu kode untuk semua bank & e-wallet',
        mark: 'QR',
        color: '#B32E2E',
      },
    ],
  },
  {
    group: 'Virtual Account',
    items: [
      { id: 'va-bca', name: 'BCA Virtual Account', desc: 'Verifikasi otomatis', mark: 'BCA', color: '#0060AF' },
      { id: 'va-bni', name: 'BNI Virtual Account', desc: 'Verifikasi otomatis', mark: 'BNI', color: '#F15A22' },
      { id: 'va-mandiri', name: 'Mandiri Virtual Account', desc: 'Verifikasi otomatis', mark: 'MDR', color: '#003D79' },
      { id: 'va-bri', name: 'BRI Virtual Account', desc: 'Verifikasi otomatis', mark: 'BRI', color: '#00529C' },
    ],
  },
  {
    group: 'E-Wallet',
    items: [
      { id: 'gopay', name: 'GoPay', desc: 'Bayar dari saldo GoPay', mark: 'GP', color: '#00A86B' },
      { id: 'ovo', name: 'OVO', desc: 'Bayar dari saldo OVO', mark: 'OVO', color: '#4C3494' },
      { id: 'dana', name: 'DANA', desc: 'Bayar dari saldo DANA', mark: 'DANA', color: '#118EEA' },
      { id: 'shopeepay', name: 'ShopeePay', desc: 'Bayar dari saldo ShopeePay', mark: 'SP', color: '#EE4D2D' },
    ],
  },
  {
    group: 'Kartu',
    items: [
      { id: 'card', name: 'Kartu Kredit / Debit', desc: 'Visa, Mastercard, JCB', mark: 'CARD', color: '#3A4A63' },
    ],
  },
];

export const ALL_CHANNELS = PAYMENT_GROUPS.reduce((acc, group) => acc.concat(group.items), []);

export const findChannel = (id) => ALL_CHANNELS.find((item) => item.id === id) || ALL_CHANNELS[0];

const VA_PREFIX = {
  'va-bca': '8808',
  'va-bni': '8810',
  'va-mandiri': '8888',
  'va-bri': '8881',
};

export const EWALLET_NUMBER = '0812-3456-7890';

// Nomor VA dibuat deterministik dari ID pesanan supaya tidak berubah saat layar di-render ulang.
export const buildVaNumber = (channelId, orderId) => {
  const digits = String(orderId || '').replace(/\D/g, '').slice(-8).padStart(8, '0');
  return `${VA_PREFIX[channelId] || '8888'}${digits}`;
};

export const buildQrisPayload = (order) => {
  const id = String(order?.id || '').replace(/\W/g, '');
  const amount = Math.round(Number(order?.totalPrice) || 0);
  return `00020101021226${id}5204581253033605802ID5910FIX YOU6007JAKARTA54${String(amount).length}${amount}6304`;
};
