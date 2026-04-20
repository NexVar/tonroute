export function formatTon(value: number, fractionDigits = 4): string {
  if (!Number.isFinite(value)) return '—';
  const trimmed = Number(value.toFixed(fractionDigits));
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: fractionDigits }).format(trimmed);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return '—';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: fractionDigits }).format(value)}%`;
}

export function shortenAddress(address: string, head = 6, tail = 4): string {
  if (!address) return '';
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export function formatRelative(iso: string): string {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return iso;
  const diff = Date.now() - target;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.round(sec / 60)} min ago`;
  if (sec < 86_400) return `${Math.round(sec / 3600)} hr ago`;
  return new Date(iso).toLocaleString();
}
