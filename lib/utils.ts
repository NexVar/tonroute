export const NANO = 1_000_000_000;

export function fromNanoString(value: string | bigint | number): number {
  const bigintValue = typeof value === 'bigint' ? value : BigInt(value);
  return Number(bigintValue) / NANO;
}

export function toNanoString(valueTon: number): string {
  return BigInt(Math.round(valueTon * NANO)).toString();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 4): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function percentOf(amount: number, percentage: number): number {
  return round((amount * percentage) / 100, 4);
}
