import { z } from 'zod';
import { fail, ok } from '@/lib/api';
import { analyzePortfolio } from '@/lib/ton/api';

const requestSchema = z.object({
  address: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const analysis = await analyzePortfolio(body.address);
    return ok(analysis);
  } catch (error) {
    return fail('Unable to analyze wallet', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
