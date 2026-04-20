import 'dotenv/config';
import { createTelegramBot } from '@/lib/telegram/bot';

async function main() {
  const bot = createTelegramBot();
  const me = await bot.telegram.getMe();
  console.log(JSON.stringify({ ok: true, username: me.username, canJoinGroups: me.can_join_groups }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
});
