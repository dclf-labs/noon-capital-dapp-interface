// Public surface for the vault feature.

export type { ProductVaultDefinition, ProductVaultId } from './catalog'
export { PRODUCT_VAULT_DEFINITIONS } from './catalog'
export { default as useProductVaults } from './hooks/useProductVaults'
export { default as useVaultShareToAsset } from './hooks/useVaultShareToAsset'
export { default as useVaultTvl } from './hooks/useVaultTvl'
