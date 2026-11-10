// Size limits the maintainer approved raising (2026-11-10: "体积限制可以增加" as the component count grows).
// Every entry is recorded in CHANGELOG.md with old → new and the measured size. Tests that assert "no existing budget
// was raised" compare against these instead of the historical limit; anything not listed must still not be raised.
export const RAISED_BUDGETS: Record<string, number> = {
  "import 'motionary/components/lite'": 80896, // 17.3: 70.00 → 79.00 kB gzip, measured 70.29 kB
};
/** The npm `check:pack` unpacked limit line in scripts/check-pack.mjs (17.3: 14 MB → 16 MB, measured 14.32 MB). */
export const PACK_UNPACKED_LINE = 'unpacked: 16 * 1024 * 1024';
/** The limit a historical budget line may have now. */
export const allowedLimit = (name: string, historical: number): number => RAISED_BUDGETS[name] ?? historical;
