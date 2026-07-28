# Contract ABIs

Family-scoped contract ABIs for the Noon Capital dapp.

```text
src/lib/abis/
  evm/        # Solidity JSON ABIs (viem / wagmi / ethers)
  starknet/   # Cairo ABIs (starknet.js / starknet-react)
  index.ts    # Typed barrel — prefer importing from here
```

## Naming

- Filenames are **kebab-case** (`layerzero-oft.json`, `uniswap-v3-quoter-v2.json`)
- Export keys in `index.ts` are **camelCase** (`evmAbis.layerzeroOft`)

## Conventions

| Folder      | Format                                     | Runtime                      |
| ----------- | ------------------------------------------ | ---------------------------- |
| `evm/`      | Solidity JSON ABI (`stateMutability`, …)   | wagmi / viem / ethers        |
| `starknet/` | Cairo ABI (`interface`, `impl`, `members`) | starknet.js / starknet-react |

Do **not** put Solidity ABIs under `starknet/` (or Cairo ABIs under `evm/`).
Shared protocol names (e.g. Hyperlane mailbox) may exist in **both** folders with different formats.

## sNOON variants

Both are EVM/Solidity ABIs (ERC-721 staking NFTs) with slightly different surfaces:

| Export                        | File                             | Distinguishing methods                                       |
| ----------------------------- | -------------------------------- | ------------------------------------------------------------ |
| `evmAbis.snoon`               | `evm/snoon.json`                 | `claimWithdrawalReward`, `withdrawWithReward`, `updateStake` |
| `evmAbis.snoonPermanentStake` | `evm/snoon-permanent-stake.json` | `extendStake`, `restakePermanent`, `unstakePermanent`        |

Confirm which deployment each address uses before wiring UI.

## Usage

```ts
import { evmAbis, starknetAbis } from '@/lib/abis'

// wagmi / viem
const abi = evmAbis.mintHandler

// starknet.js
const cairoAbi = starknetAbis.ekuboRouter
```
