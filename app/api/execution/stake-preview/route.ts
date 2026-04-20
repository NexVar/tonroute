import { z } from 'zod';
import { fail, ok } from '@/lib/api';
import { prepareStakeTransaction } from '@/lib/integrations/tonstakers';

const requestSchema = z.object({
  address: z.string().min(1),
  amountTon: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const tx = await prepareStakeTransaction(body.address, body.amountTon);
    return ok(tx);
  } catch (error) {
    return fail('Unable to prepare Tonstakers stake transaction', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
