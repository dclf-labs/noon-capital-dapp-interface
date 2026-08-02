/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Address } from '@/lib/address'

export type UniV3Pool = {
  path: string[]
  feePath: bigint[]
  name: string
  pool: Address
}

export type UniV4PoolKey = {
  currency0: string
  currency1: string
  fee: bigint
  tickSpacing: bigint
  hooks: Address
}

export type UniV4Pool = {
  poolKeyPath: UniV4PoolKey[]
}

export type CurvePool = {
  route: string[]
  swapParams: Array<Array<number>>
}

import { type PermitSingle } from '@uniswap/permit2-sdk'
import { AbiCoder, ethers, getBytes } from 'ethers'

export { slippageAdjustedAmount, toDeadline } from '@/features/swap/lib/amounts'

export function encodePath(path: string[], fees: bigint[]): string {
  const UNI_FEE_SIZE = 3

  if (path.length != fees.length + 1) {
    throw new Error('Path and fee lengths do not match.')
  }

  let encoded = '0x'
  for (let i = 0; i < fees.length; i++) {
    // A 20 byte encoding of the address.
    encoded += path.at(i)?.slice(2)
    // A 3 byte encoding of the fee.
    encoded += fees
      .at(i)
      ?.toString(16)
      ?.padStart(2 * UNI_FEE_SIZE, '0')
  }

  // Encode the final token.
  encoded += path[path.length - 1].slice(2)

  return encoded.toLowerCase()
}

export const encodeUniV4Path = (poolKeys: any[], currencyIn: string): any[] => {
  const pathKeys = []
  for (let i = 0; i < poolKeys.length; i++) {
    const currencyOut =
      currencyIn?.toLowerCase() == poolKeys[i].currency0.toLowerCase()
        ? poolKeys[i].currency1
        : poolKeys[i].currency0
    const pathKey = {
      intermediateCurrency: currencyOut,
      fee: poolKeys[i].fee,
      tickSpacing: poolKeys[i].tickSpacing,
      hooks: poolKeys[i].hooks,
      hookData: '0x',
    }
    pathKeys.push(pathKey)
    currencyIn = currencyOut
  }
  return pathKeys
}

/**
 * CommandTypes
 * @description Flags that modify a command's execution
 * @enum {number}
 */
export enum CommandType {
  V3_SWAP_EXACT_IN = 0x00,
  V3_SWAP_EXACT_OUT = 0x01,
  PERMIT2_TRANSFER_FROM = 0x02,
  PERMIT2_PERMIT_BATCH = 0x03,
  SWEEP = 0x04,
  TRANSFER = 0x05,
  PAY_PORTION = 0x06,

  V2_SWAP_EXACT_IN = 0x08,
  V2_SWAP_EXACT_OUT = 0x09,
  PERMIT2_PERMIT = 0x0a,
  WRAP_ETH = 0x0b,
  UNWRAP_WETH = 0x0c,
  PERMIT2_TRANSFER_FROM_BATCH = 0x0d,
  BALANCE_CHECK_ERC20 = 0x0e,

  V4_SWAP = 0x10,
  V3_POSITION_MANAGER_PERMIT = 0x11,
  V3_POSITION_MANAGER_CALL = 0x12,
  V4_INITIALIZE_POOL = 0x13,
  V4_POSITION_MANAGER_CALL = 0x14,

  EXECUTE_SUB_PLAN = 0x21,
}

const ALLOW_REVERT_FLAG = 0x80

const REVERTIBLE_COMMANDS = new Set<CommandType>([
  CommandType.EXECUTE_SUB_PLAN,
  CommandType.PERMIT2_PERMIT,
  CommandType.PERMIT2_PERMIT_BATCH,
])

const PERMIT_STRUCT =
  '((address token,uint160 amount,uint48 expiration,uint48 nonce) details, address spender, uint256 sigDeadline)'

const POOL_KEY_STRUCT =
  '(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks)'

const PERMIT_BATCH_STRUCT =
  '((address token,uint160 amount,uint48 expiration,uint48 nonce)[] details, address spender, uint256 sigDeadline)'

const PERMIT2_TRANSFER_FROM_STRUCT = '(address from,address to,uint160 amount,address token)'
const PERMIT2_TRANSFER_FROM_BATCH_STRUCT = PERMIT2_TRANSFER_FROM_STRUCT + '[]'

const ABI_DEFINITION: { [key in CommandType]: string[] } = {
  // Batch Reverts
  [CommandType.EXECUTE_SUB_PLAN]: ['bytes', 'bytes[]'],

  // Permit2 Actions
  [CommandType.PERMIT2_PERMIT]: [PERMIT_STRUCT, 'bytes'],
  [CommandType.PERMIT2_PERMIT_BATCH]: [PERMIT_BATCH_STRUCT, 'bytes'],
  [CommandType.PERMIT2_TRANSFER_FROM]: ['address', 'address', 'uint160'],
  [CommandType.PERMIT2_TRANSFER_FROM_BATCH]: [PERMIT2_TRANSFER_FROM_BATCH_STRUCT],

  // Uniswap Actions
  [CommandType.V3_SWAP_EXACT_IN]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
  [CommandType.V3_SWAP_EXACT_OUT]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
  [CommandType.V2_SWAP_EXACT_IN]: ['address', 'uint256', 'uint256', 'address[]', 'bool'],
  [CommandType.V2_SWAP_EXACT_OUT]: ['address', 'uint256', 'uint256', 'address[]', 'bool'],

  // Token Actions and Checks
  [CommandType.WRAP_ETH]: ['address', 'uint256'],
  [CommandType.UNWRAP_WETH]: ['address', 'uint256'],
  [CommandType.SWEEP]: ['address', 'address', 'uint256'],
  [CommandType.TRANSFER]: ['address', 'address', 'uint256'],
  [CommandType.PAY_PORTION]: ['address', 'address', 'uint256'],
  [CommandType.BALANCE_CHECK_ERC20]: ['address', 'address', 'uint256'],

  [CommandType.V4_SWAP]: ['bytes', 'bytes[]'],
  [CommandType.V3_POSITION_MANAGER_PERMIT]: ['bytes'],
  [CommandType.V3_POSITION_MANAGER_CALL]: ['bytes'],
  [CommandType.V4_INITIALIZE_POOL]: [POOL_KEY_STRUCT, 'uint160'],
  [CommandType.V4_POSITION_MANAGER_CALL]: ['bytes'],
}

export class RoutePlanner {
  commands: string
  inputs: string[]

  constructor() {
    this.commands = '0x'
    this.inputs = []
  }

  addSubPlan(subplan: RoutePlanner): void {
    this.addCommand(CommandType.EXECUTE_SUB_PLAN, [subplan.commands, subplan.inputs], true)
  }

  addCommand(type: CommandType, parameters: any[], allowRevert = false): void {
    const command = createCommand(type, parameters)
    this.inputs.push(command.encodedInput)
    if (allowRevert) {
      if (!REVERTIBLE_COMMANDS.has(command.type)) {
        throw new Error(`command type: ${command.type} cannot be allowed to revert`)
      }
      command.type = command.type | ALLOW_REVERT_FLAG
    }

    this.commands = this.commands.concat(command.type.toString(16).padStart(2, '0'))
  }
}

export type RouterCommand = {
  type: CommandType
  encodedInput: string
}

export function createCommand(type: CommandType, parameters: any[]): RouterCommand {
  if (
    type === CommandType.V3_POSITION_MANAGER_CALL ||
    type === CommandType.V3_POSITION_MANAGER_PERMIT ||
    type === CommandType.V4_POSITION_MANAGER_CALL
  ) {
    return { type, encodedInput: parameters[0] }
  } else {
    const encodedInput = new AbiCoder().encode(ABI_DEFINITION[type], parameters as never)
    return { type, encodedInput }
  }
}

/**
 * Actions
 * @description Constants that define what action to perform
 * @enum {number}
 */
export enum Actions {
  // pool actions
  // liquidity actions
  INCREASE_LIQUIDITY = 0x00,
  DECREASE_LIQUIDITY = 0x01,
  MINT_POSITION = 0x02,
  BURN_POSITION = 0x03,
  INCREASE_LIQUIDITY_FROM_DELTAS = 0x04,
  MINT_POSITION_FROM_DELTAS = 0x05,

  // swapping
  SWAP_EXACT_IN_SINGLE = 0x06,
  SWAP_EXACT_IN = 0x07,
  SWAP_EXACT_OUT_SINGLE = 0x08,
  SWAP_EXACT_OUT = 0x09,
  // donate
  // DONATE = 0x0a,

  // closing deltas on the pool manager
  // settling
  SETTLE = 0x0b,
  SETTLE_ALL = 0x0c,
  // SETTLE_PAIR = 0x0d,
  // taking
  TAKE = 0x0e,
  TAKE_ALL = 0x0f,
  TAKE_PORTION = 0x10,
  // TAKE_PAIR = 0x11,

  CLOSE_CURRENCY = 0x12,
  // CLEAR_OR_TAKE = 0x13,
  SWEEP = 0x14,

  WRAP = 0x15,
  UNWRAP = 0x16,

  // minting/burning 6909s to close deltas
  // MINT_6909 = 0x17,
  // BURN_6909 = 0x18,
}

const PATH_KEY_STRUCT =
  '(address intermediateCurrency,uint256 fee,int24 tickSpacing,address hooks,bytes hookData)'

const SWAP_EXACT_IN_SINGLE_STRUCT =
  '(' +
  POOL_KEY_STRUCT +
  ' poolKey,bool zeroForOne,uint128 amountIn,uint128 amountOutMinimum,bytes hookData)'

const SWAP_EXACT_IN_STRUCT =
  '(address currencyIn,' + PATH_KEY_STRUCT + '[] path,uint128 amountIn,uint128 amountOutMinimum)'

const SWAP_EXACT_OUT_SINGLE_STRUCT =
  '(' +
  POOL_KEY_STRUCT +
  ' poolKey,bool zeroForOne,uint128 amountOut,uint128 amountInMaximum,bytes hookData)'

const SWAP_EXACT_OUT_STRUCT =
  '(address currencyOut,' + PATH_KEY_STRUCT + '[] path,uint128 amountOut,uint128 amountInMaximum)'

const PLANNER_ABI_DEFINITION: { [key in Actions]: string[] } = {
  // Liquidity commands
  [Actions.INCREASE_LIQUIDITY]: ['uint256', 'uint256', 'uint128', 'uint128', 'bytes'],
  [Actions.DECREASE_LIQUIDITY]: ['uint256', 'uint256', 'uint128', 'uint128', 'bytes'],
  [Actions.MINT_POSITION]: [
    POOL_KEY_STRUCT,
    'int24',
    'int24',
    'uint256',
    'uint128',
    'uint128',
    'address',
    'bytes',
  ],
  [Actions.BURN_POSITION]: ['uint256', 'uint128', 'uint128', 'bytes'],
  [Actions.INCREASE_LIQUIDITY_FROM_DELTAS]: ['uint256', 'uint128', 'uint128', 'bytes'],
  [Actions.MINT_POSITION_FROM_DELTAS]: [
    POOL_KEY_STRUCT,
    'int24',
    'int24',
    'uint128',
    'uint128',
    'address',
    'bytes',
  ],

  // Swapping commands
  [Actions.SWAP_EXACT_IN_SINGLE]: [SWAP_EXACT_IN_SINGLE_STRUCT],
  [Actions.SWAP_EXACT_IN]: [SWAP_EXACT_IN_STRUCT],
  [Actions.SWAP_EXACT_OUT_SINGLE]: [SWAP_EXACT_OUT_SINGLE_STRUCT],
  [Actions.SWAP_EXACT_OUT]: [SWAP_EXACT_OUT_STRUCT],

  // Payments commands
  [Actions.SETTLE]: ['address', 'uint256', 'bool'],
  [Actions.SETTLE_ALL]: ['address', 'uint256'],
  [Actions.TAKE]: ['address', 'address', 'uint256'],
  [Actions.TAKE_ALL]: ['address', 'uint256'],
  [Actions.TAKE_PORTION]: ['address', 'address', 'uint256'],

  [Actions.CLOSE_CURRENCY]: ['address'],
  [Actions.SWEEP]: ['address', 'address'],

  [Actions.WRAP]: ['uint256'],
  [Actions.UNWRAP]: ['uint256'],
}

export class V4Planner {
  actions: string
  params: string[]

  constructor() {
    this.actions = '0x'
    this.params = []
  }

  addAction(type: Actions, parameters: any[]): void {
    const command = createAction(type, parameters)
    this.params.push(command.encodedInput)
    this.actions = this.actions.concat(command.action.toString(16).padStart(2, '0'))
  }

  finalize(): string {
    return new AbiCoder().encode(['bytes', 'bytes[]'], [this.actions, this.params] as never)
  }
}

export type RouterAction = {
  action: Actions
  encodedInput: string
}

export function createAction(action: Actions, parameters: any[]): RouterAction {
  const encodedInput = new AbiCoder().encode(PLANNER_ABI_DEFINITION[action], parameters as never)
  return { action, encodedInput }
}

export interface Permit2Permit extends PermitSingle {
  signature: string
}

const SIGNATURE_LENGTH = 65
const EIP_2098_SIGNATURE_LENGTH = 64

export function encodePermit(planner: RoutePlanner, permit2: Permit2Permit): RoutePlanner {
  let signature = permit2.signature

  const length = getBytes(permit2.signature).length
  // Signature data provided for EIP-1271 may have length different from ECDSA signature.
  if (length === SIGNATURE_LENGTH || length === EIP_2098_SIGNATURE_LENGTH) {
    // Sanitizes signature to cover edge cases of malformed EIP-2098 sigs and v used as recovery id.
    signature = ethers.Signature.from(ethers.Signature.from(permit2.signature)).serialized
  }

  planner.addCommand(CommandType.PERMIT2_PERMIT, [permit2, signature])

  return planner
}
