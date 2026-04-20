import { Address } from '@ton/core';

export function normalizeAddress(raw: string): string {
  const friendly = Address.parse(raw);
  return friendly.toString({ bounceable: false, urlSafe: true });
}
