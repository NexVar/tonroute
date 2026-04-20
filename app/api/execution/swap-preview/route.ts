import { z } from 'zod';
import { fail, ok } from '@/lib/api';
import { buildTonToJettonSwapPreview } from '@/lib/integrations/ston';

const requestSchema = z.object({
  address: z.string().min(1),
  asset: z.enum(['tesreed', 'testblue']),
  amountTon: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const preview = await buildTonToJettonSwapPreview(body.address, body.asset, body.amountTon);
    return ok(preview);
  } catch (error) {
    return fail('Unable to prepare STON.fi swap preview', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
