import { YmylFooter } from '@tn-figueiredo/ymyl-ui/react'
import { AUTHOR, BRAND, JURISDICTIONS, LEGAL_LINKS, REVIEWER } from '@/lib/brand-config'
import { SITE_CONFIG } from '@/lib/site-config'

export function Footer() {
  return (
    <YmylFooter
      brand={{ ...BRAND, launchedAt: SITE_CONFIG.launchedAt }}
      author={AUTHOR}
      reviewer={REVIEWER}
      jurisdictions={JURISDICTIONS}
      legalLinks={LEGAL_LINKS}
      showDnsmpi
      className="border-t mt-16 py-8 text-sm text-slate-500"
    />
  )
}
