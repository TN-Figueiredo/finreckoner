import { SITE_CONFIG } from '@/lib/site-config'

export function toAbsolute(urlOrPath: string): string {
  try {
    return new URL(urlOrPath).toString()
  } catch {
    return new URL(urlOrPath, SITE_CONFIG.url).toString()
  }
}
