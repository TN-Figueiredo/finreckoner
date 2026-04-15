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
      className="border rounded-lg p-6 opacity-60 cursor-not-allowed"
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-3">{description}</p>
      <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
        Coming {comingDate}
      </span>
    </div>
  )
}
