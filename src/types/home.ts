import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";

export type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export interface StatusConfig {
  bg: string;
  text: string;
  border: string;
  label: string;
  icon: LucideIcon;
}

export type RankCategory = "xtreino" | "campeonato" | "scrim";