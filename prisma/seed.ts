import { PrismaClient } from "@prisma/client";
import { getSeedIpos } from "@/data/ipos.seed";
import { deriveIpo } from "@/lib/ipo-math";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const raws = getSeedIpos(now);

  for (const raw of raws) {
    const status = deriveIpo(raw, 0, now).status;
    const data = {
      name: raw.name,
      board: raw.board,
      status,
      priceMin: raw.priceMin,
      priceMax: raw.priceMax,
      lotSize: raw.lotSize,
      issueSize: raw.issueSize ?? null,
      gmp: raw.gmp,
      subOverall: raw.subscription.overall,
      subRetail: raw.subscription.retail,
      subQib: raw.subscription.qib,
      subNii: raw.subscription.nii,
      listingPrice: raw.listingPrice ?? null,
      openDate: new Date(raw.openDate),
      closeDate: new Date(raw.closeDate),
      listingDate: raw.listingDate ? new Date(raw.listingDate) : null,
      source: "seed",
    };
    await prisma.ipo.upsert({
      where: { slug: raw.slug },
      create: { slug: raw.slug, ...data },
      update: data,
    });
  }

  console.log(`Seeded ${raws.length} IPOs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
