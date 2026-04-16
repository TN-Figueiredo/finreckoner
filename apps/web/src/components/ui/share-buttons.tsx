import { CopyLinkButton } from './copy-link-button'

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  return (
    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-8">
      <span className="font-medium">Share:</span>
      <a href={`https://x.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">X</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">LinkedIn</a>
      <a href={`https://www.reddit.com/submit?url=${u}&title=${t}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">Reddit</a>
      <CopyLinkButton url={url} />
    </div>
  )
}
