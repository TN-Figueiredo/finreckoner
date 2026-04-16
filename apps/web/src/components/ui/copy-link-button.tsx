'use client'
import { useState } from 'react'

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch { /* silent: clipboard unavailable */ }
      }}
      className="underline text-sm hover:text-slate-900"
      aria-label="Copy link to this page"
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}
