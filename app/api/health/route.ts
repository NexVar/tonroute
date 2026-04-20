import { ok } from '@/lib/api';
import { env } from '@/lib/env';

export function GET() {
  return ok({
    name: 'tonroute',
    network: env.NETWORK,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
