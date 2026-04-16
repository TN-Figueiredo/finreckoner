interface Props {
  title: string
  description: string
  comingDate: string
}

export function CalcCardPlaceholder({ title, description, comingDate }: Props) {
  return (
    <div
      role="article"
      aria-disabled="true"
      className="border border-slate-300 bg-slate-50 rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold mb-2 text-slate-900">{title}</h2>
      <p className="text-sm text-slate-700 mb-3">{description}</p>
      <span className="inline-block bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded font-medium">
        Coming {comingDate}
      </span>
    </div>
  )
}
