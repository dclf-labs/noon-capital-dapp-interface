import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

const pageErrors = []
page.on('console', (msg) => {
  const text = msg.text()
  if (
    text.includes('Lit') ||
    text.includes('Illegal') ||
    text.includes('_$AT') ||
    text.includes('[wallet]') ||
    msg.type() === 'error'
  ) {
    console.log(`[browser:${msg.type()}]`, text)
  }
})
page.on('pageerror', (err) => {
  pageErrors.push(err.message)
  console.log('[pageerror]', err.message)
})

await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60_000 })
await page.getByRole('button', { name: 'Connect wallet' }).waitFor({ timeout: 60_000 })
await page.getByRole('button', { name: 'Connect wallet' }).click()
await page
  .getByRole('button', { name: /Ethereum|EVM/i })
  .first()
  .click()
await page.waitForTimeout(4000)

const result = await page.evaluate(() => {
  const modal = document.querySelector('w3m-modal')
  return {
    hasModal: Boolean(modal),
    openProp: modal ? Boolean(modal.open) : null,
    openAttr: modal?.getAttribute('open'),
    multipleLitWarning: false,
  }
})

console.log(JSON.stringify({ ...result, pageErrors }, null, 2))
await page.screenshot({ path: '/tmp/appkit-test.png', fullPage: true })
console.log('screenshot: /tmp/appkit-test.png')

await browser.close()
process.exit(result.openProp ? 0 : 1)
