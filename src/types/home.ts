export interface NavItem {
  label: string;
  href: string;
}

export interface ActionLink {
  label: string;
  href: string;
}

export interface Program {
  id: "kinsight" | "steadycrew";
  name: string;
  audience: string;
  headline: string;
  description: string;
  facts: string[];
}

export type PrincipleVisual =
  | "baseline"
  | "reasons"
  | "refusal"
  | "humanGate"
  | "protection"
  | "language";

export interface Principle {
  title: string;
  description: string;
  visual: PrincipleVisual;
  tone: "sage" | "clay" | "blue" | "gold" | "plum" | "mint";
}

export interface EvidenceMetric {
  value: string;
  label: string;
  detail: string;
}

export interface Scenario {
  eyebrow: string;
  title: string;
  body: string;
  meta: string;
  accent: "sage" | "clay" | "blue";
}

export interface FooterGroup {
  title: string;
  links: ActionLink[];
}

export interface HomeContent {
  nav: NavItem[];
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryAction: ActionLink;
    secondaryAction: ActionLink;
  };
  programs: Program[];
  principles: Principle[];
  evidence: {
    eyebrow: string;
    title: string;
    description: string;
    metrics: EvidenceMetric[];
    note: string;
  };
  scenarios: Scenario[];
  safety: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{
      title: string;
      description: string;
      label: string;
    }>;
  };
  access: {
    title: string;
    description: string;
    primaryAction: ActionLink;
    secondaryAction: ActionLink;
  };
  footer: FooterGroup[];
}
