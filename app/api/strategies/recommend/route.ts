import { z } from 'zod';
import { fail, ok } from '@/lib/api';
import { recommendStrategy } from '@/lib/strategy/engine';
import { analyzePortfolio } from '@/lib/ton/api';

const requestSchema = z.object({
  address: z.string().min(1),
  goal: z.enum(['safe', 'balanced', 'yield'])
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const analysis = await analyzePortfolio(body.address);
    const recommendation = recommendStrategy(body.goal, analysis);
    return ok(recommendation);
  } catch (error) {
    return fail('Unable to build recommendation', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
