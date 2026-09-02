/**
 * Single source of truth for brand colours. Plain data only (no React / DOM),
 * so both the client UI and the server-side PDF generator can import it.
 *
 * To rebrand: change the hex values here. Everything downstream follows.
 */

export interface BrandPalette {
  primary: string;
  primaryDark: string;
  primaryDeep: string;
  ink: string;
  paper: string;
  surface: string;
  surfaceSolid: string;
  muted: string;
  border: string;
  borderSolid: string;
  danger: string;
  dangerBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  glass: string;
  glassBorder: string;
  cardShadow: string;
  isDark: boolean;
}

export const BRAND_LIGHT: BrandPalette = {
  primary: "#897BB9",
  primaryDark: "#6B5E9E",
  primaryDeep: "#564B82",
  ink: "#1D1D1F",
  paper: "#F5F5F7",
  surface: "rgba(255,255,255,0.72)",
  surfaceSolid: "#FFFFFF",
  muted: "#86868B",
  border: "rgba(0,0,0,0.08)",
  borderSolid: "#E5E5EA",
  danger: "#FF3B30",
  dangerBg: "rgba(255,59,48,0.08)",
  success: "#34C759",
  successBg: "rgba(52,199,89,0.08)",
  warning: "#FF9500",
  warningBg: "rgba(255,149,0,0.1)",
  glass: "rgba(255,255,255,0.6)",
  glassBorder: "rgba(255,255,255,0.3)",
  cardShadow: "0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
  isDark: false,
};

export const BRAND_DARK: BrandPalette = {
  primary: "#A99BD4",
  primaryDark: "#BDB1DE",
  primaryDeep: "#D1C8E8",
  ink: "#F5F5F7",
  paper: "#000000",
  surface: "rgba(28,28,30,0.72)",
  surfaceSolid: "#1C1C1E",
  muted: "#98989D",
  border: "rgba(255,255,255,0.08)",
  borderSolid: "#38383A",
  danger: "#FF453A",
  dangerBg: "rgba(255,69,58,0.12)",
  success: "#30D158",
  successBg: "rgba(48,209,88,0.12)",
  warning: "#FF9F0A",
  warningBg: "rgba(255,159,10,0.12)",
  glass: "rgba(28,28,30,0.6)",
  glassBorder: "rgba(255,255,255,0.06)",
  cardShadow: "0 2px 8px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.3)",
  isDark: true,
};

/** Hex-only subset the PDF generator uses (pdfkit needs solid colours). */
export const PDF_COLORS = {
  primary: BRAND_LIGHT.primary,
  primaryDeep: BRAND_LIGHT.primaryDeep,
  ink: BRAND_LIGHT.ink,
  muted: BRAND_LIGHT.muted,
  border: "#E5E5EA",
  rule: "#F0F0F2",
  warning: "#B25A00",
  danger: "#C4302B",
} as const;
