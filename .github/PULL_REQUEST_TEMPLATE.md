## Summary

<!-- What does this PR change and why? -->

-

## Type of change

- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] chore
- [ ] docs
- [ ] test
- [ ] ci

## Test plan

CI runs `format:check`, `lint`, `typecheck`, `test:coverage` (with thresholds), `build`, and `npm audit` (moderate+). Locally:

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test` (or `test:coverage`)
- [ ] `npm run build`
- [ ] Manual check in the browser (if UI changed)
- [ ] Calculation / UI-value tests updated if amounts, quotes, or confirm copy changed (see `docs/TESTING.md`)

## Product surfaces (if applicable)

- [ ] Kept mint/redeem, stake/unstake/withdraw, bridge, and buy/sell as separate surfaces
- [ ] Pay ≤6dp / receive display ≤2dp preserved where relevant
- [ ] Docs/READMEs updated for new routes, helpers, or env keys

## Web3 / security notes

- [ ] No secrets, private keys, or mnemonics added
- [ ] New dependencies reviewed (publisher, downloads, recent advisories)
- [ ] Wallet / chain behavior verified on at least one testnet if applicable
- [ ] Env vars documented if new `VITE_*` keys were added (`.env.example`, README, `src/lib/env`)
- [ ] New keys exposed on `appEnv` (not raw `import.meta.env` in feature code)
- [ ] New production RPC/API hosts allowlisted in `vercel.json` `connect-src` (+ `src/lib/env/vercel-csp.test.ts`)
