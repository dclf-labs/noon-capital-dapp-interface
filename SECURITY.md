# Security Policy

## Reporting a vulnerability

Please report security issues **privately** to the Noon Capital / DCLF Labs maintainers (for example via the GitHub Security Advisories “Report a vulnerability” flow on this repository when enabled).
Do not open a public GitHub issue for vulnerabilities that could put user funds or keys at risk.

## Scope

This repository is a frontend interface. Especially sensitive areas:

- Wallet connection flows
- Transaction signing UX
- Dependency / supply-chain changes
- Environment variable handling

## Guidelines for contributors

- Never commit secrets, private keys, seed phrases, or production API keys
- Prefer wallet extensions / WalletConnect — never ask users to paste private keys
- Treat new npm packages as untrusted until reviewed (publisher, age, downloads, advisories)
- Remember every `VITE_*` variable is public in the browser bundle; restrict third-party API keys by HTTP referrer / domain when the provider supports it
- Read runtime config via `appEnv` (`src/lib/env`) — do not scatter raw `import.meta.env` reads in features
- Gate transaction writes with `canWriteSession(connection)`; never treat typed receiver addresses as connected wallets
- Production deploys (Vercel or otherwise) **must** set a real `VITE_WALLETCONNECT_PROJECT_ID` — empty values fail closed at AppKit bootstrap (`resolveWalletConnectProjectId`)
- Optional `VITE_GA_MEASUREMENT_ID` is HTML-injected only; omit it to disable analytics

## CI notes

- GitHub Actions may build with a placeholder WalletConnect project id when the repo secret is unset (forks / bootstrap). That does **not** satisfy production deploy requirements.
- `npm audit --audit-level=moderate` runs in CI (aligned with `.npmrc`).
