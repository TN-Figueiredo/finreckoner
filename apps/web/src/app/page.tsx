import { HeroCreator } from '@/components/HeroCreator'
import { CalcCardPlaceholder } from '@/components/CalcCardPlaceholder'

export default function Home() {
  return (
    <main>
      <HeroCreator />
      <section className="max-w-4xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CalcCardPlaceholder
          title="Mortgage Calculator (US + CA)"
          description="Principal, interest, taxes, insurance, amortization. Conventional and FHA (US); CMHC (CA)."
          comingDate="May 2026"
        />
        <CalcCardPlaceholder
          title="Compound Interest Calculator"
          description="Visualize savings growth over time, with creator income volatility in mind."
          comingDate="May 2026"
        />
        <CalcCardPlaceholder
          title="Income Tax (US + CA + QC)"
          description="Federal + provincial brackets for TY2026. 1099-NEC, T4A, self-employed lens."
          comingDate="June 2026"
        />
        <CalcCardPlaceholder
          title="Currency Converter"
          description="10 currencies, prioritized for creator income (CAD/USD/BRL/EUR). Live FX coming."
          comingDate="May 2026"
        />
      </section>
    </main>
  )
}
