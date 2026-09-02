export { BRAND_LIGHT, BRAND_DARK } from "@shared/brand";
export type { BrandPalette } from "@shared/brand";

import { BRAND_LIGHT, BRAND_DARK, type BrandPalette } from "@shared/brand";

export function brandFor(dark: boolean): BrandPalette {
  return dark ? BRAND_DARK : BRAND_LIGHT;
}
