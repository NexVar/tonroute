# 🚀 TonRoute

> ⚡ **The smart strategy router for the TON ecosystem.** Turn idle TON into informed action — in seconds.

TonRoute is a testnet-first TON strategy router built with Next.js. It helps users inspect idle TON, compare Safe / Balanced / Yield outcomes, and route the next action through STON.fi and Tonstakers.

---

## 💡 About

**TonRoute** is your personal co-pilot for navigating the TON blockchain. 🧭

In a world where every TON holder faces the same question — *"What should I do with my idle balance?"* — TonRoute answers it instantly. Instead of jumping between wallets, DEXs, and staking dashboards, you get a single, beautifully simple interface that:

- 🔍 **Scans** your idle TON in real time
- 📊 **Compares** three strategy paths side-by-side: **Safe**, **Balanced**, and **Yield**
- 🎯 **Routes** your next action straight into trusted protocols like **STON.fi** and **Tonstakers**
- 🤖 Plugs into **Telegram** so you can act anywhere, anytime

Whether you're a cautious holder who values capital preservation, a balanced thinker hunting for sustainable returns, or a yield maximizer chasing the best APY — TonRoute makes the decision easier, faster, and smarter. 💎

> 🧪 **Testnet-first**, production-ready architecture. Built for builders, traders, and the next wave of TON adopters.

---

## ✨ Key Highlights

- 🌐 **Next.js + Cloudflare Workers** — globally distributed, lightning fast
- 🔐 **Non-custodial flow** — your keys, your TON, always
- 🤝 **STON.fi & Tonstakers integrations** out of the box
- 💬 **Telegram bot** for on-the-go strategy execution
- 🛠️ **Open and extensible** — drop in new strategies or routes

---

## ☁️ Cloudflare deployment

TonRoute is configured for **full-stack deployment on Cloudflare Workers** using the official Cloudflare OpenNext adapter. 🚀

### 📚 Official references
- Next.js on Workers: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- Workers Builds (Git auto deploy): https://developers.cloudflare.com/workers/ci-cd/builds/
- Node.js compatibility: https://developers.cloudflare.com/workers/runtime-apis/nodejs/
- Telegram Bot API webhooks: https://core.telegram.org/bots/api#setwebhook

### 🔑 Required Cloudflare env vars
Set these in **Workers Builds → Build variables and secrets** and in the deployed Worker env:

- `NETWORK`
- `NEXT_PUBLIC_APP_URL`
- `TONCENTER_API_KEY`
- `TONAPI_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`

Optional local/demo-only vars:
- `NEXT_PUBLIC_ENABLE_DEMO_WALLET`
- `ENABLE_DEMO_WALLET`
- `WALLET_VERSION`
- `TON_WALLET_ADDRESS`
- `MNEMONIC`
- `PRIVATE_KEY`
- `TON_WALLET_PUBLIC_KEY`

> ⚠️ Do not enable the demo-wallet vars in public production unless you intentionally want server-side signing.

### 💻 Local commands
- `npm run dev` — Next.js dev server
- `npm run preview` — Cloudflare/OpenNext local preview
- `npm run deploy` — build + deploy to Cloudflare
- `npm run cf-typegen` — generate Cloudflare env typings

### 🤖 Telegram bot commands
- `npm run bot:smoke` — verify bot token/API access
- `npm run bot:webhook:set` — register the deployed webhook URL
- `npm run bot:webhook:info` — inspect webhook status
- `npm run bot:webhook:delete` — remove webhook
- `npm run bot:polling` — local long-polling dev mode only

### 🔄 Git auto-deploy
Use **Cloudflare Workers Builds** and connect the `main` branch of this repository. The Worker name in the dashboard must match `wrangler.jsonc` (`tonroute`).

### 🔗 Telegram webhook path
The deployed bot webhook endpoint is:

`/api/telegram/webhook`

After deploying, register it with:

```bash
NEXT_PUBLIC_APP_URL=https://<your-app>.workers.dev npm run bot:webhook:set
```

---

<p align="center">
  <strong>🌟 Built with ❤️ for the TON community 🌟</strong><br/>
  <em>Route smarter. Stake confidently. Grow with TonRoute.</em> 💎
</p>
