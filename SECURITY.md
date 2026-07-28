# Security Policy

## Reporting a vulnerability

Please report security issues privately to the Noon Capital / DCLF Labs maintainers.
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
- Production deploys must set a real `VITE_WALLETCONNECT_PROJECT_ID` (empty values fail closed at runtime)
