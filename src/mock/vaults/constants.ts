/**
 * Re-exports product tab helpers. Canonical definitions live in
 * `src/mock/_shared/product-tabs.ts` so USN / sUSN / swap shells share one source.
 */
export {
  heroSubtitleForPath,
  PRODUCT_HERO_SUBTITLES,
  PRODUCT_TABS,
  type ProductTabId,
  productTabsForPath,
  resolveProductTabId,
} from '@/mock/_shared/product-tabs'
