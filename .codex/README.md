# Project-local Codex MCP setup

This repository uses a project-scoped TON MCP server for Codex.

- The server package is installed locally via `npm install`.
- Codex reads `.codex/config.toml` in this repo and adds the `ton` MCP server only here.
- Wallet registry/state is stored in `.codex/ton/config.json` via `TON_CONFIG_PATH`, so it does not use `~/.config/ton/config.json`.

Optional environment variables you can export before running `codex`:

- `NETWORK=testnet` to avoid mainnet by default during development.
- `TONCENTER_API_KEY=...` for higher-quality RPC access.
- `MNEMONIC=...` or `PRIVATE_KEY=...` if you want direct key-based mode instead of agentic wallet mode.
