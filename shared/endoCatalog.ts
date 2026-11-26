/**
 * Endodontic file catalogue for the photo-based endo order page.
 *
 * Products, option names and Dentsply Sirona item codes were read from the
 * Dentsply Sirona Canada shop ("Rotary & Reciprocating Files"). Photos are
 * loaded from Dentsply Sirona's image server (not copied into this repo).
 *
 * A product has several "options" (a file size / taper / colour). Most options
 * come in several lengths; the orderable item code is the option's base code
 * plus the length (e.g. WGPRIME + 25 = WGPRIME25). A code containing "{L}" has
 * the length inserted at that spot instead (Reciproc).
 */

export interface EndoOption {
  label: string;
  /** Base code, or a template containing {L}. */
  code: string;
  /** Available lengths in mm. Empty/undefined = a single item with no length. */
  lengths?: number[];
  /** Extra plain-language detail, e.g. "20 / .07 taper". */
  detail?: string;
  /** Explicit supplier item number for each length (used instead of code + length). */
  codes?: Record<number, string>;
  /** Manufacturer item number for each length, shown next to the supplier number. */
  mfr?: Record<number, string>;
  /** Photo of just this option (same formats as EndoProduct.image). */
  image?: string;
}

export interface EndoProduct {
  id: string;
  name: string;
  family: string;
  /**
   * Photo. A bare name is a Scene7 image on Dentsply Sirona's server; "pd:<file>" is a
   * Patterson Dental product photo (content.pattersondental.com).
   */
  image: string;
  /** Product page path on dentsplysirona.com (en-ca shop). */
  path: string;
  /** Full link to the product on the supplier's own website (overrides `path`). */
  pageUrl?: string;
  /** Who sells it, when it is not Dentsply Sirona. */
  supplier?: string;
  /** The practice's main file system: shown first, with a quick-order grid. */
  main?: boolean;
  note?: string;
  options: EndoOption[];
}

export const ENDO_FAMILIES = ["All", "VaryFlex", "WaveOne Gold", "ProTaper", "Reciproc", "TruNatomy & TruShape", "Vortex", "ProFile"] as const;
export type EndoFamily = (typeof ENDO_FAMILIES)[number];

export function endoImageUrl(image: string, width = 480): string {
  if (image.startsWith("pd:")) {
    const size = width > 400 ? "LargeSquare" : width > 200 ? "MediumSquare" : "SmallSquare";
    return `https://content.pattersondental.com/${size}/images/${image.slice(3)}.jpg`;
  }
  return `https://s7d1.scene7.com/is/image/dentsply/${image}?wid=${width}&qlt=75`;
}

export function endoProductUrl(product: Pick<EndoProduct, "path" | "pageUrl">): string {
  return product.pageUrl ?? `https://www.dentsplysirona.com/en-ca/shop/product-page.html/${product.path}`;
}

/** The orderable Dentsply item code for an option at a given length. */
export function endoItemCode(option: EndoOption, length?: number): string {
  if (length == null) return option.code;
  const explicit = option.codes?.[length];
  if (explicit) return explicit;
  return option.code.includes("{L}") ? option.code.replace("{L}", String(length)) : `${option.code}${length}`;
}

type O = [label: string, code: string, lengths?: number[], detail?: string];
const opts = (rows: O[]): EndoOption[] => rows.map(([label, code, lengths, detail]) => ({ label, code, lengths, detail }));

const L3 = [21, 25, 31];
const L30 = [21, 25, 30];
const L4 = [17, 21, 25, 30];
const L2 = [21, 25];

// ---- generated families (many near-identical sizes) -------------------------

const SIZE_COLORS: Record<string, string> = {
  "15": "White", "20": "Yellow", "25": "Red", "30": "Blue", "35": "Green", "40": "Black",
  "45": "White", "50": "Yellow", "55": "Red", "60": "Blue", "70": "Green", "80": "Black",
};

/** Vortex / Vortex Blue: sizes 15–50 in .04 and .06 plus an assorted pack of each. */
function vortexOptions(prefix: string): EndoOption[] {
  const sizes = ["15", "20", "25", "30", "35", "40", "45", "50"];
  return [".04", ".06"].flatMap((t) => [
    ...sizes.map((s): EndoOption => ({ label: `Size ${s} / ${t} (${SIZE_COLORS[s]})`, code: `${prefix}${t.slice(1)}${s}`, lengths: L30 })),
    { label: `Assorted 15–40 / ${t}`, code: `${prefix}${t.slice(1)}A15`, lengths: L30 },
  ]);
}

function profileIsoOptions(): EndoOption[] {
  const o = (taper: string, s: string, lengths: number[]): EndoOption => ({
    label: `Size ${s} / ${taper} (${SIZE_COLORS[s]})`,
    code: `PIT${taper.slice(1)}${s}`,
    lengths,
  });
  return [
    ...["15", "20", "25", "30", "35", "40", "45"].map((s) => o(".02", s, L2)),
    ...["15", "20", "25", "30", "35", "40", "45", "50", "55", "60", "70", "80"].map((s) => o(".04", s, L30)),
    { label: "Assorted 15–40 / .04", code: "PIT04A15", lengths: L30 },
    { label: "Assorted 45–80 / .04", code: "PIT04A45", lengths: L30 },
    ...["15", "20", "25", "30", "35", "40", "45", "50"].map((s) => o(".06", s, L30)),
  ];
}

function profileGtOptions(): EndoOption[] {
  const colors: Record<string, string> = { "20": "Yellow", "30": "Blue", "40": "Black", "35": "Green", "50": "Yellow", "70": "Green", "90": "White" };
  const o = (taper: string, s: string, lengths: number[]): EndoOption => ({
    label: `Size ${s} / ${taper} (${colors[s]})`,
    code: `GTR${taper.slice(1)}0${s}`,
    lengths,
  });
  return [
    o(".04", "20", L30), o(".04", "30", L30), o(".04", "40", L4),
    ...[".06", ".08", ".10"].flatMap((t) => ["20", "30", "40"].map((s) => o(t, s, L4))),
    ...["20", "35", "50", "70"].map((s) => o(".12", s, L4)),
    o(".12", "90", L30),
  ];
}

// ---- catalogue ----------------------------------------------------------------

// ---- Endoperfection VaryFlex VFO One (Patterson Dental) — the main file system ----

const VARYFLEX_LENGTHS = [21, 25, 31];
/** [label, detail, photo, Patterson item numbers by length, manufacturer numbers by length] */
const VARYFLEX_ROWS: [string, string, string, number[], string[]][] = [
  ["Small", "20 / .07", "pd:JPG_1113634", [71425701, 71425743, 71425784], ["VFO2120", "VFO2520", "VFO3120"]],
  ["Primary", "25 / .07 — most canals", "pd:JPG_1083186", [71425719, 71425750, 71425792], ["VFO2125", "VFO2525", "VFO3125"]],
  ["Medium", "35 / .06", "pd:JPG_1083188", [71425727, 71425768, 71425800], ["VFO2135", "VFO2535", "VFO3135"]],
  ["Large", "45 / .05", "pd:JPG_1083187", [71425735, 71425776, 71425818], ["VFO2145", "VFO2545", "VFO3145"]],
  ["Assorted", "20 / .07 to 45 / .05", "pd:JPG_1116464", [71485184, 71485192, 71485200], ["VFOASM21", "VFOASM25", "VFOASM31"]],
];

const VARYFLEX: EndoProduct = {
  id: "varyflex-vfo-one",
  name: "Endoperfection VaryFlex VFO One",
  family: "VaryFlex",
  image: "pd:JPG_1116464",
  path: "",
  pageUrl: "https://www.pattersondental.com/Supplies/ItemDetail/071425701",
  supplier: "Patterson Dental",
  main: true,
  note: "Variable-taper rotary / reciprocating files, 6 per package. Item numbers are Patterson Dental's.",
  options: VARYFLEX_ROWS.map(([label, detail, image, items, mfr]) => ({
    label,
    detail,
    image,
    code: `VFO-${label.toUpperCase()}`,
    lengths: VARYFLEX_LENGTHS,
    codes: Object.fromEntries(VARYFLEX_LENGTHS.map((len, i) => [len, String(items[i])])),
    mfr: Object.fromEntries(VARYFLEX_LENGTHS.map((len, i) => [len, mfr[i]])),
  })),
};

export const ENDO_PRODUCTS: EndoProduct[] = [
  VARYFLEX,
  {
    id: "waveone-gold",
    name: "WaveOne Gold Reciprocating Files",
    family: "WaveOne Gold",
    image: "END-Product-Image-WaveOne-Gold-files-Assorted-25",
    path: "BP-300485/waveone-gold-reciprocating-files.html",
    options: opts([
      ["Small (Yellow)", "WGSMALL", L3, "20 / .07 taper"],
      ["Primary (Red)", "WGPRIME", L3, "25 / .07 taper — recommended for most canals"],
      ["Medium (Green)", "WGMEDIUM", L3, "35 / .06 taper"],
      ["Large (White)", "WGLARGE", L3, "45 / .05 taper"],
    ]),
  },
  {
    id: "waveone-gold-orifice-shaper",
    name: "WaveOne Gold Orifice Shaper",
    family: "WaveOne Gold",
    image: "END-image-product-WaveOne-Gold-Orifice-Shaper",
    path: "E-BP-1000290000/waveone-gold-orifice-shaper.html",
    options: opts([["Orifice Shaper", "TSTW1G1316OSH"]]),
  },
  {
    id: "protaper-ultimate",
    name: "ProTaper Ultimate Rotary Files",
    family: "ProTaper",
    image: "END-image-product-package-transparent-background-ProTaper-Ultimate-Files-Pack",
    path: "E-BP-300364/protaper-ultimate-rotary-files.html",
    options: opts([
      ["Slider (6-pack)", "PULRSL", L3],
      ["Shaper (6-pack)", "PULRSH", L3],
      ["F1 (6-pack)", "PULRF1", L3],
      ["F2 (6-pack)", "PULRF2", L3],
      ["F3 (6-pack)", "PULRF3", L3],
      ["FX (6-pack)", "PULRFX", L3],
      ["FXL (6-pack)", "PULRFXL", L3],
      ["Sequence pack (5-pack)", "PULRSQC", L3],
      ["SX (6-pack)", "PULRSX", [19]],
    ]),
  },
  {
    id: "protaper-gold-shaping",
    name: "ProTaper Gold Shaping Files",
    family: "ProTaper",
    image: "END-product-image-ProTaper-Gold-SHAPING-Files-all",
    path: "BP-300209/protaper-gold-rotary-files-shaping.html",
    options: opts([
      ["SX", "PTGRSX", [19]],
      ["Shaping 1 (Purple)", "PTGRS1", L3],
      ["Shaping 2 (White)", "PTGRS2", L3],
    ]),
  },
  {
    id: "protaper-gold-finishing",
    name: "ProTaper Gold Finishing Files",
    family: "ProTaper",
    image: "END-product-image-ProTaper-Gold-FINISHING-Files-all",
    path: "BP-300194/protaper-gold-rotary-files-finishing.html",
    options: opts([
      ["Finishing 1 (Yellow)", "PTGRF1", L3],
      ["Finishing 2 (Red)", "PTGRF2", L3],
      ["Finishing 3 (Blue)", "PTGRF3", L3],
      ["Finishing 4 (Double Black)", "PTGRF4", L3],
      ["Finishing 5 (Double Yellow)", "PTGRF5", L3],
    ]),
  },
  {
    id: "protaper-gold-assorted",
    name: "ProTaper Gold Assorted SX–F3",
    family: "ProTaper",
    image: "END-Product-Image-ProTaperGold-Files-ASST-PTGRA1-31",
    path: "BP-300191/protaper-gold-rotary-files-shaping-finishing.html",
    options: opts([["Assorted SX–F3 pack", "PTGRA", L3]]),
  },
  {
    id: "protaper-universal-shaping",
    name: "ProTaper Universal Shaping Files",
    family: "ProTaper",
    image: "END-Product-Image-ProTaper-Universal-Files-TUL-1006748",
    path: "BP-300158/protaper-universal-rotary-files-shaping.html",
    options: opts([
      ["SX", "PTURSX", [19]],
      ["S1 (Purple)", "PTURS1", L3],
      ["S2 (White)", "PTURS2", L3],
    ]),
  },
  {
    id: "protaper-universal-finishing",
    name: "ProTaper Universal Finishing Files",
    family: "ProTaper",
    image: "END-Product-Image-ProTaper-Universal-Files-TUL-1006748",
    path: "BP-300143/protaper-universal-rotary-files-finishing.html",
    options: opts([
      ["F1 (Yellow)", "PTURF1", L3],
      ["F2 (Red)", "PTURF2", L3],
      ["F3 (Blue)", "PTURF3", L3],
      ["F4 (Black)", "PTURF4", L3],
      ["F5 (Yellow)", "PTURF5", L3],
    ]),
  },
  {
    id: "protaper-universal-assorted",
    name: "ProTaper Universal Assorted",
    family: "ProTaper",
    image: "END-Product-Image-ProTaper-Universal-Files-TUL-1006748",
    path: "BP-300140/protaper-universal-rotary-files-shaping-finishing.html",
    options: opts([["Assorted (SX–S2, F1–F3)", "PTURAS", L3]]),
  },
  {
    id: "protaper-next",
    name: "ProTaper Next Rotary Files",
    family: "ProTaper",
    image: "END-image-product-protaper-next-blister-3-files",
    path: "BP-300175/protaper-next-rotary-files.html",
    options: opts([
      ["X1 (Yellow)", "PTNX1", L3],
      ["X2 (Red)", "PTNX2", L3],
      ["X3 (Blue)", "PTNX3", L3],
      ["X4 (Black)", "PTNX4", L3],
      ["X5 (Yellow)", "PTNX5", L3],
      ["Assorted (X1, X2, X3)", "PTNAST", L3],
    ]),
  },
  {
    id: "reciproc-blue",
    name: "Reciproc Blue Reciprocating Files",
    family: "Reciproc",
    image: "END-image-RECIPROC-blue-files-assorted",
    path: "E-BP-1000253009/reciproc-blue-reciprocating-files.html",
    options: opts([
      ["R25 (3-pack)", "TSTRCBP3{L}025", L3],
      ["R40 (3-pack)", "TSTRCBP3{L}040", L3],
      ["R50 (3-pack)", "TSTRCBP3{L}050", L3],
      ["Assorted R25–R50 (3-pack)", "TSTRCBP3{L}AST", L3],
    ]),
  },
  {
    id: "reciproc-minima",
    name: "Reciproc Minima Reciprocating Files",
    family: "Reciproc",
    image: "END-image-product-Reciproc-Minima-all-files",
    path: "E-BP-1000287005/reciproc-minima-reciprocating-files.html",
    options: opts([
      ["R20 (6-pack)", "TSTRCPM6{L}020", L3],
      ["R25 (6-pack)", "TSTRCPM6{L}025", L3],
      ["R35 (6-pack)", "TSTRCPM6{L}035", L3],
      ["R45 (6-pack)", "TSTRCPM6{L}045", L3],
      ["Assortment (6-pack)", "TSTRCPM6{L}AST", L3],
    ]),
  },
  {
    id: "trunatomy-shaping",
    name: "TruNatomy Shaping Files",
    family: "TruNatomy & TruShape",
    image: "END-Product-Image-TruNatomy-Files-BP-1000158086",
    path: "E-BP-1000158086/trunatomy-shaping-files.html",
    options: opts([
      ["Small (3-pack)", "TRNSMALL", L3],
      ["Prime (3-pack)", "TRNPRIME", L3],
      ["Medium (3-pack)", "TRNMEDIUM", L3],
      ["Large (3-pack)", "TRNLARGE", L2],
      ["Sequence pack (3-pack)", "TRNSQC", L3],
      ["Assortment pack (6-pack)", "TRNAST6", L3],
      ["Assortment pack (5-pack)", "TRNAST", [31]],
    ]),
  },
  {
    id: "trunatomy-orifice",
    name: "TruNatomy Orifice Modifiers",
    family: "TruNatomy & TruShape",
    image: "END-product-image-trunatomy-orifice-modifier",
    path: "E-BP-1000158084/trunatomy-orifice-modifiers.html",
    options: opts([["Orifice Modifier (16 mm)", "TRNOM16"]]),
  },
  {
    id: "trushape-s-files",
    name: "TruShape 3D Conforming S-Files",
    family: "TruNatomy & TruShape",
    image: "END-Product-Image-TruShape-Files-BP-300720",
    path: "BP-300720/trushape-3d-conforming-s-files.html",
    note: "Size 30 is a variable taper (30v) at 21 mm and .06 at 25 and 31 mm.",
    options: opts([
      ["20 / .06 (Yellow)", "TSFILE20", L3],
      ["25 / .06 (Red)", "TSFILE25", L3],
      ["30 (Blue)", "TSFILE30", L3],
      ["40 / .06 (Black)", "TSFILE40", L3],
    ]),
  },
  {
    id: "trushape-orifice",
    name: "TruShape Orifice Modifiers",
    family: "TruNatomy & TruShape",
    image: "END-Product-Image-TruShape-Orifice-Modifier-TSOM16-1",
    path: "BP-300732/trushape-orifice-modifiers.html",
    options: opts([["20 / .08", "TSOM", [16]]]),
  },
  {
    id: "vortex-blue",
    name: "Vortex Blue Rotary Files",
    family: "Vortex",
    image: "END-image-product-Vortex-Blue-Rotary-File-Blister-Pack",
    path: "BP-300363/vortex-blue-rotary-files.html",
    options: vortexOptions("VTB"),
  },
  {
    id: "vortex",
    name: "Vortex Rotary Files",
    family: "Vortex",
    image: "END-Product-Image-Vortex-Files-BP-300310",
    path: "BP-300310/vortex-rotary-files.html",
    options: vortexOptions("PFV"),
  },
  {
    id: "vortex-orifice-opener",
    name: "Vortex Orifice Opener",
    family: "Vortex",
    image: "END-Product-Image-Vortex-Orifice-Opener-VOSA16",
    path: "BP-300511/vortex-orifice-opener.html",
    options: opts([
      ["20 / .08 (Yellow)", "VOS2008", [16, 19]],
      ["25 / .08 (Red)", "VOS2508", [16, 19]],
      ["25 / .10 (Red)", "VOS2510", [16, 19]],
      ["25 / .12 (Red)", "VOS2512", [16, 19]],
      ["30 / .12 (Blue)", "VOS3012", [16, 19]],
      ["40 / .10 (Black)", "VOS4010", [16, 19]],
      ["Assorted 20–40", "VOSAS", [16, 19]],
    ]),
  },
  {
    id: "profile-gt",
    name: "ProFile GT Rotary Files",
    family: "ProFile",
    image: "END-Product-Image-GT-Files-GTR1004017-30",
    path: "BP-300217/profile-gt-rotary-files.html",
    options: profileGtOptions(),
  },
  {
    id: "profile-iso",
    name: "ProFile ISO Rotary Files",
    family: "ProFile",
    image: "END-Product-Image-ProfileISO-PIT042021",
    path: "BP-300000/profile-iso-rotary-files.html",
    options: profileIsoOptions(),
  },
  {
    id: "profile-iso-orifice",
    name: "ProFile ISO Orifice Shapers",
    family: "ProFile",
    image: "END-Product-Image-ProfileISO-PIT042021",
    path: "BP-300503/profile-iso-orifice-shapers.html",
    options: opts([
      ["20 / .05 (Yellow, 6-pack)", "OS01", [19]],
      ["30 / .06 (Blue, 6-pack)", "OS02", [19]],
      ["40 / .06 (Black, 6-pack)", "OS03", [19]],
      ["50 / .07 (Yellow, 6-pack)", "OS04", [19]],
      ["60 / .08 (Blue, 6-pack)", "OS05", [19]],
      ["80 / .08 (Black, 6-pack)", "OS06", [19]],
      ["Assorted 20–80 (6-pack)", "OSA01", [19]],
      ["Assorted 2× 30-40-50 (6-pack)", "OSA02", [19]],
    ]),
  },
  {
    id: "profile-series-29",
    name: "ProFile Series 29 Rotary Files",
    family: "ProFile",
    image: "END-Product-Image-ProFile-Series29-Files-PSTA221-30",
    path: "BP-300080/profile-series-29-rotary-files.html",
    options: opts([
      [".129 / .04 (Silver 2)", "PST02", L30],
      [".167 / .04 (Gold 3)", "PST03", L30],
      [".216 / .04 (Red 4)", "PST04", L30],
      [".279 / .04 (Blue 5)", "PST05", L30],
      [".360 / .04 (Green 6)", "PST06", L30],
      [".465 / .04 (Brown 7)", "PST07", L30],
      [".600 / .04 (Silver 8)", "PST08", L30],
      [".775 / .04 (Orange 9)", "PST09", L30],
      ["Assorted .129–.465 / .04", "PSTA2", L30],
      [".129 / .06 (Silver 2)", "PST0602", L30],
      [".167 / .06 (Gold 3)", "PST0603", L30],
      [".216 / .06 (Red 4)", "PST0604", L30],
      [".279 / .06 (Blue 5)", "PST0605", L30],
      [".360 / .06 (Green 6)", "PST0606", L30],
      [".465 / .06 (Brown 7)", "PST0607", L30],
      ["Assorted .129–.465 / .06", "PST06A2", L30],
    ]),
  },
];

/** code -> where it lives, for turning an order line back into product/option/length. */
export interface EndoVariantRef {
  code: string;
  product: EndoProduct;
  option: EndoOption;
  length?: number;
  /** Manufacturer item number, when the supplier's number differs. */
  mfr?: string;
}

/** What goes on the order PDF/email as the item code, e.g. "71425701 (VFO2120)". */
export function endoOrderCode(ref: EndoVariantRef): string {
  return ref.mfr ? `${ref.code} (${ref.mfr})` : ref.code;
}

export const ENDO_INDEX: Map<string, EndoVariantRef> = (() => {
  const m = new Map<string, EndoVariantRef>();
  for (const product of ENDO_PRODUCTS) {
    for (const option of product.options) {
      if (option.lengths && option.lengths.length) {
        for (const length of option.lengths) {
          const code = endoItemCode(option, length);
          m.set(code, { code, product, option, length, mfr: option.mfr?.[length] });
        }
      } else {
        const code = endoItemCode(option);
        m.set(code, { code, product, option });
      }
    }
  }
  return m;
})();
