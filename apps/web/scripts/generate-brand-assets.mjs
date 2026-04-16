// Generate branded logo + OG placeholder PNGs using Playwright headless Chromium.
// Run: `node apps/web/scripts/generate-brand-assets.mjs`
// Outputs: apps/web/public/logo.png (512×512), apps/web/public/og/default.png (1200×630)
//
// Why Playwright and not sharp? sharp rasterizes SVG via librsvg, which needs
// fontconfig + pango to render SVG <text>. Pre-built sharp binaries often don't
// bundle pango, so SVG text renders as empty rectangles. Headless Chromium has
// system fonts available and renders HTML/CSS text reliably on any machine that
// can run Playwright (required anyway for e2e tests).

import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const LOGO_HTML = `<!doctype html>
<html><head><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:512px;height:512px;display:flex;align-items:center;justify-content:center;
       background:#0f172a;color:#ffffff;font-family:'Arial Black',Arial,sans-serif;
       font-size:220px;font-weight:900;letter-spacing:-0.06em}
</style></head><body>fr</body></html>`

const OG_HTML = `<!doctype html>
<html><head><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;display:flex;flex-direction:column;
       align-items:center;justify-content:center;gap:24px;
       background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);
       color:#ffffff;font-family:Arial,Helvetica,sans-serif}
  h1{font-size:120px;font-weight:900;letter-spacing:-0.035em}
  p{font-size:36px;opacity:0.85}
</style></head><body><h1>finreckoner</h1><p>Financial calculators for creators</p></body></html>`

const browser = await chromium.launch()
try {
  await mkdir('apps/web/public/og', { recursive: true })

  const logoCtx = await browser.newContext({
    viewport: { width: 512, height: 512 },
    deviceScaleFactor: 1,
  })
  const logoPage = await logoCtx.newPage()
  await logoPage.setContent(LOGO_HTML)
  await logoPage.screenshot({ path: 'apps/web/public/logo.png', type: 'png' })
  await logoCtx.close()
  console.log('✓ apps/web/public/logo.png (512×512)')

  const ogCtx = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  const ogPage = await ogCtx.newPage()
  await ogPage.setContent(OG_HTML)
  await ogPage.screenshot({ path: 'apps/web/public/og/default.png', type: 'png' })
  await ogCtx.close()
  console.log('✓ apps/web/public/og/default.png (1200×630)')
} finally {
  await browser.close()
}
