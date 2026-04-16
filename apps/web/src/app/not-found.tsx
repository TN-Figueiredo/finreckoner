import Link from 'next/link'

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-5xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-4 text-lg text-slate-600">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <nav className="mt-8 flex flex-wrap gap-4 justify-center text-sm" aria-label="Site navigation">
        <Link href="/" className="underline">Home</Link>
        <Link href="/pillars" className="underline">Pillars</Link>
        <Link href="/blog" className="underline">Blog</Link>
      </nav>
    </main>
  )
}
