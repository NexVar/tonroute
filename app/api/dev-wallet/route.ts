import { fail, ok } from '@/lib/api';
import { runtimeFlags } from '@/lib/env';
import { getServerWalletSigner } from '@/lib/ton/signer';
import { fromNanoString } from '@/lib/utils';

export async function GET() {
  if (!runtimeFlags.demoWalletServerEnabled) {
    return fail('Demo wallet is disabled.', 'Enable ENABLE_DEMO_WALLET=1 only for local or protected environments.', 403);
  }

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
