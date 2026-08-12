import { getSeedIpos } from "@/data/ipos.seed";
import type { RawIpo } from "@/lib/types";
import type { DataProvider } from "./index";

/** Serves the bundled fixture dataset. Zero external dependencies. */
export class SeedProvider implements DataProvider {
  readonly name = "seed";

  async fetchAll(now: Date = new Date()): Promise<RawIpo[]> {
    return getSeedIpos(now);
  }
}
