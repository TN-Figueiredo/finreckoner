export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="motion-safe:animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
        <div className="h-10 w-3/4 rounded bg-slate-200" />
        <div className="h-5 w-1/2 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-4/5 rounded bg-slate-200" />
      </div>
    </main>
  )
}
