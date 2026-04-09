import { SiteNav } from "@/components/marketing/site-nav";

const PLANS = [
  { name: "Club Local", price: "1.00€", detail: "Por atleta / mes, operación base." },
  { name: "Alianza Sectorial", price: "0.85€", detail: "Redes y academias de mayor volumen." },
  { name: "Red Federativa", price: "0.70€", detail: "Modelo masivo para despliegues amplios." },
];

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-[#1b1f27] text-white">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <header className="max-w-3xl space-y-3">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/85">Precios</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tight md:text-6xl">Modelo comercial</h1>
          <p className="text-white/70">Estructura de precios diseñada para crecimiento progresivo y adopción a escala.</p>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <article key={plan.name} className="rounded-3xl border border-white/10 bg-[#222833] p-6">
              <h2 className="text-xl font-black uppercase italic tracking-tight">{plan.name}</h2>
              <p className="mt-3 text-4xl font-black text-primary">{plan.price}</p>
              <p className="mt-2 text-sm text-white/70">{plan.detail}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
