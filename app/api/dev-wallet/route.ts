import { fail, ok } from '@/lib/api';
import { getServerWalletSigner } from '@/lib/ton/signer';
import { fromNanoString } from '@/lib/utils';

export async function GET() {
  try {
    const signer = getServerWalletSigner();
    const { address } = await signer.getWalletContext();
    const balance = await signer.getBalance();
    return ok({
      address,
      balanceTon: fromNanoString(balance),
      mode: 'local-demo',
    });
  } catch (error) {
    return fail('Unable to load local demo wallet', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
