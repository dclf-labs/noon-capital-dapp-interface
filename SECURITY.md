# Security Policy

## Reporting a vulnerability

Please report security issues **privately** to the Noon Capital / DCLF Labs maintainers (for example via the GitHub Security Advisories “Report a vulnerability” flow on this repository when enabled).
Do not open a public GitHub issue for vulnerabilities that could put user funds or keys at risk.

## Scope

This repository is a frontend interface. Especially sensitive areas:

- Wallet connection flows
- Transaction signing UX (mint/redeem, stake/unstake, buy/sell, bridge)
- Dependency / supply-chain changes
- Environment variable handling
- Calldata amount encoding (`toTruncatedTokenUnits`, slippage / min-out helpers)

## Guidelines for contributors

- Never commit secrets, private keys, seed phrases, or production API keys
- Prefer wallet extensions / WalletConnect — never ask users to paste private keys
- Treat new npm packages as untrusted until reviewed (publisher, age, downloads, advisories)
- Remember every `VITE_*` variable is public in the browser bundle; restrict third-party API keys by HTTP referrer / domain when the provider supports it
- Read runtime config via `appEnv` (`src/lib/env`) — do not scatter raw `import.meta.env` reads in features
- Gate transaction writes with `canWriteSession(connection)`; never treat typed receiver addresses as connected wallets
- Production deploys (Vercel or otherwise) **must** set a real `VITE_WALLETCONNECT_PROJECT_ID` — empty values fail closed at AppKit bootstrap (`resolveWalletConnectProjectId`)
- Optional `VITE_GA_MEASUREMENT_ID` is HTML-injected only; omit it to disable analytics
- Starknet uses **Infura** (`VITE_STARKNET_INFURA_API_KEY`) or an explicit `VITE_STARKNET_RPC_URL`
- Production CSP lives in `vercel.json`. New API/RPC origins must be added to `connect-src` (and `src/lib/env/vercel-csp.test.ts`) or browsers will block them on Vercel. Local Vite does not apply this CSP
- Gate on-chain writes and wallet-signed API calls with `canWriteSession(connection)` before prompting the wallet
- Username / referral signing currently uses a static `Authentication <address>` message while the HTTP body carries an unbound nonce + payload. Treat backend verification of that signature carefully; prefer binding nonce + action + fields into the signed message (or EIP-712) in a coordinated API change
- Restrict Infura / other RPC / WalletConnect project keys by HTTP referrer or domain in the provider dashboards — all `VITE_*` values are public in the bundle

## CI notes

- GitHub Actions may build with a placeholder WalletConnect project id when the repo secret is unset (forks / bootstrap). That does **not** satisfy production deploy requirements.
- `npm audit --audit-level=moderate` runs in CI (aligned with `.npmrc`).
