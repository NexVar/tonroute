import { z } from 'zod';
import { fail, ok } from '@/lib/api';
import { runtimeFlags } from '@/lib/env';
import { executeTonToJettonSwapWithServerWallet } from '@/lib/integrations/ston';

const requestSchema = z.object({
  asset: z.enum(['tesreed', 'testblue']),
  amountTon: z.number().positive(),
});

export async function POST(request: Request) {
  if (!runtimeFlags.demoWalletServerEnabled) {
    return fail('Demo wallet execution is disabled.', 'Server-side wallet execution should stay off in public Cloudflare deployments.', 403);
  }

  try {
    const body = requestSchema.parse(await request.json());
    const result = await executeTonToJettonSwapWithServerWallet(body.asset, body.amountTon);
    return ok(result);
  } catch (error) {
    return fail('Unable to execute STON.fi swap with the local demo wallet', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
