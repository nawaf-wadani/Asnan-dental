import { Activity, Beaker, Layers, Scissors, Sparkles, Stethoscope, Syringe, Package, type LucideIcon } from "lucide-react";

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  diagnostics: Stethoscope,
  restorative: Layers,
  endodontics: Activity,
  anesthesia: Syringe,
  surgical: Scissors,
  impression: Beaker,
  infection: Sparkles,
};

export function iconFor(categoryKey: string): LucideIcon {
  return CATEGORY_ICON[categoryKey] ?? Package;
}
