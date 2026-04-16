const dateFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
const yearMonthFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' })

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso))
}

export function formatYearMonth(iso: string): string {
  return yearMonthFmt.format(new Date(iso))
}
