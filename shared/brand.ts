/**
 * Single source of truth for brand colours. Plain data only (no React / DOM),
 * so both the client UI and the server-side PDF generator can import it.
 *
 * Asnan Dental palette: Paisley Purple (#897BB9) with its deep tone (#6862A3),
 * Blue Frosting teal (#80CDC4) as the accent, porcelain (#F9F8FF) as the
 * ground and butter (#FFFCC5) as a rare highlight. Neutrals are derived from
 * the purple rather than grey/black.
 *
 * To rebrand: change the values here. Everything downstream follows.
 */

export interface BrandPalette {
  primary: string;
  primaryDark: string;
  primaryDeep: string;
  accent: string;
  accentDeep: string;
  butter: string;
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
  primaryDark: "#6862A3",
  primaryDeep: "#4F4985",
  accent: "#80CDC4",
  accentDeep: "#2B7F76",
  butter: "#FFFCC5",
  ink: "#2A2543",
  paper: "#F9F8FF",
  surface: "rgba(255,255,255,0.78)",
  surfaceSolid: "#FFFFFF",
  muted: "#6B6684",
  border: "rgba(42,37,67,0.10)",
  borderSolid: "#E4E0F2",
  danger: "#D92D20",
  dangerBg: "rgba(217,45,32,0.08)",
  success: "#2E9E6B",
  successBg: "rgba(46,158,107,0.09)",
  warning: "#B86E00",
  warningBg: "rgba(255,196,80,0.22)",
  glass: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(137,123,185,0.20)",
  cardShadow: "0 1px 3px rgba(42,37,67,0.06), 0 8px 24px rgba(104,98,163,0.08)",
  isDark: false,
};

export const BRAND_DARK: BrandPalette = {
  primary: "#A99BD4",
  primaryDark: "#BDB1DE",
  primaryDeep: "#D1C8E8",
  accent: "#80CDC4",
  accentDeep: "#80CDC4",
  butter: "#FFFCC5",
  ink: "#F1EEFA",
  paper: "#13111F",
  surface: "rgba(29,26,46,0.78)",
  surfaceSolid: "#1D1A2E",
  muted: "#A9A3C2",
  border: "rgba(241,238,250,0.10)",
  borderSolid: "#34304D",
  danger: "#FF6B5E",
  dangerBg: "rgba(255,107,94,0.14)",
  success: "#4CC38A",
  successBg: "rgba(76,195,138,0.14)",
  warning: "#FFB84D",
  warningBg: "rgba(255,184,77,0.14)",
  glass: "rgba(29,26,46,0.70)",
  glassBorder: "rgba(169,155,212,0.16)",
  cardShadow: "0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.35)",
  isDark: true,
};

/** Hex-only subset the PDF generator uses (pdfkit needs solid colours). */
export const PDF_COLORS = {
  primary: BRAND_LIGHT.primary,
  primaryDeep: BRAND_LIGHT.primaryDeep,
  ink: BRAND_LIGHT.ink,
  muted: BRAND_LIGHT.muted,
  border: "#E4E0F2",
  rule: "#EEEBF8",
  warning: "#B86E00",
  danger: "#C4302B",
} as const;
