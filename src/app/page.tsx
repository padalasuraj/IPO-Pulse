import { Header } from "@/components/header";
import { Dashboard } from "@/components/dashboard";
import { Disclaimer } from "@/components/disclaimer";
import { getBoard } from "@/server/ipo-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const ipos = await getBoard();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 sm:py-8">
        <div className="mb-6">
          <p className="eyebrow">Indian primary market</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Every live IPO, ranked by what actually matters.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Grey-market premium, subscription, expected listing gains per lot and a quick risk read —
            with a same-day alert rail for issues closing today.
          </p>
        </div>

        <Dashboard initialIpos={ipos} generatedAt={new Date().toISOString()} />

        <Disclaimer />
      </main>
    </>
  );
}
