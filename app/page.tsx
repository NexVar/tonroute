import { runtimeFlags } from '@/lib/env';
import { TonRouteApp } from '@/components/TonRouteApp';

export default function HomePage() {
  return <TonRouteApp demoWalletEnabled={runtimeFlags.demoWalletServerEnabled} />;
}
