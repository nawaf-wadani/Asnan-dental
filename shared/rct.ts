/** WaveOne / endodontic rotary-file order constants. Shared so the PDF
 *  generator and the UI stay in lockstep. */

export const RCT_FILE_TYPES = [
  "WaveOne Gold Small",
  "WaveOne Gold Primary",
  "WaveOne Gold Medium",
  "WaveOne Gold Large",
  "WaveOne Gold SX",
  "WaveOne (Original) Small",
  "WaveOne (Original) Primary",
  "WaveOne (Original) Large",
  "WaveOne Gold Glider",
] as const;

export const RCT_TAPERS = [
  ".02 / #15",
  ".02 / #20",
  ".04 / #25 (Primary)",
  ".06 / #25 (Primary+)",
  ".03 / #25 (Small)",
  ".05 / #35 (Medium)",
  ".08 / #45 (Large)",
  "Other",
] as const;

export const RCT_LENGTHS = ["21 mm", "25 mm", "31 mm"] as const;

export const RCT_PAPER_POINTS = ["Small (15-20)", "Medium (25-30)", "Large (35-40)", "Assorted"] as const;
export const RCT_OBTURATION = ["WaveOne Small Tips", "WaveOne Primary Tips", "WaveOne Large Tips", "WaveOne Gold Glider Tips"] as const;
export const RCT_NEEDLES = ['27G (1.5")', '30G (1")', "NaviTip 30G"] as const;

export const URGENCIES = ["Routine", "Priority", "Urgent"] as const;
export type Urgency = (typeof URGENCIES)[number];
