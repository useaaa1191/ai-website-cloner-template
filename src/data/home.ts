import type { HomeContent } from "@/types/home";

export const homeContent: HomeContent = {
  nav: [
    { label: "Programs", href: "#programs" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Evidence", href: "#evidence" },
    { label: "Principles", href: "#principles" },
    { label: "About", href: "#about" },
  ],
  hero: {
    eyebrow: "California nonprofit · public-benefit technology",
    title: "Care decisions, not autopilot.",
    description:
      "Forward Foundation builds free, human-confirmed decision support for family dementia caregivers and the direct-care workforce.",
    primaryAction: { label: "Try the KinSight demo", href: "#try-kinsight" },
    secondaryAction: { label: "See both programs", href: "#programs" },
  },
  programs: [
    {
      id: "kinsight",
      name: "KinSight",
      audience: "For family dementia caregivers",
      headline: "A careful next step when something feels different.",
      description:
        "A short voice or text observation is compared with the person’s own baseline. KinSight returns one of three reviewable bands, shows its reasons, and waits for the caregiver.",
      facts: [
        "Manage at home, contact the care team, or seek urgent help",
        "Bilingual English and Spanish, built for voice-first use",
        "Free to families, with export and delete under caregiver control",
      ],
    },
    {
      id: "steadycrew",
      name: "SteadyCrew",
      audience: "For direct-care teams",
      headline: "Coverage without forced overtime or silent tradeoffs.",
      description:
        "SteadyCrew proposes explainable matches using skills, language, location, continuity, availability, and hard safety constraints. Supervisors approve every change. Workers can decline.",
      facts: [
        "Credential gaps and maximum-hour violations block a proposal",
        "Match and coverage-risk reasons are visible in plain language",
        "Free to aides and supported through agency licensing",
      ],
    },
  ],
  principles: [
    {
      title: "Personal context",
      description:
        "KinSight compares observations to a caregiver-controlled baseline, not a generic dementia profile.",
      visual: "baseline",
      tone: "sage",
    },
    {
      title: "Visible reasons",
      description:
        "Every care band and workforce match shows reason codes a person can inspect and challenge.",
      visual: "reasons",
      tone: "blue",
    },
    {
      title: "Clean refusal",
      description:
        "Incomplete, contradictory, or prohibited requests are flagged for review instead of guessed through.",
      visual: "refusal",
      tone: "gold",
    },
    {
      title: "Human gate",
      description:
        "Confirm, override, ignore, approve, edit, reject, or decline. Nothing acts or publishes silently.",
      visual: "humanGate",
      tone: "clay",
    },
    {
      title: "Protection by design",
      description:
        "Privacy, dignity, decline rights, and a ban on disciplinary scoring are enforced as product requirements.",
      visual: "protection",
      tone: "plum",
    },
    {
      title: "Built for real conditions",
      description:
        "Voice-first, bilingual, mobile-friendly flows are designed for late nights, one-handed use, and imperfect connectivity.",
      visual: "language",
      tone: "mint",
    },
  ],
  evidence: {
    eyebrow: "Prototype evidence",
    title: "Built to say “I don’t know.”",
    description:
      "Both prototypes were exercised across 40 controlled cycles covering noisy inputs, missing information, unsafe requests, ordinary decisions, overrides, refusals, and recovery. The point was not to make a perfect demo. It was to expose the guardrails.",
    metrics: [
      {
        value: "87%",
        label: "KinSight F1 score",
        detail: "Observation structuring and three-band classification in a controlled labeled set.",
      },
      {
        value: "84%",
        label: "SteadyCrew F1 score",
        detail: "Open-visit fill and coverage-risk classification in a controlled labeled set.",
      },
      {
        value: "100%",
        label: "Human-gated test actions",
        detail: "No tested recommendation or schedule proposal bypassed the required person.",
      },
      {
        value: "40 + 40",
        label: "Logged test cycles",
        detail: "Separate stress, safety, standard, edge, and override logs for each prototype.",
      },
    ],
    note:
      "These are internal prototype results from synthetic and de-identified scenarios. They are not clinical validation, agency outcomes, or a claim of real-world effectiveness.",
  },
  scenarios: [
    {
      eyebrow: "A quiet change",
      title: "“She skipped breakfast and lunch, and she’s more withdrawn than usual.”",
      body:
        "KinSight can surface a reviewable “contact the care team” band, explain that appetite and withdrawal changed from baseline, then wait for the caregiver to confirm or choose another path.",
      meta: "KinSight · baseline-aware reasoning",
      accent: "sage",
    },
    {
      eyebrow: "A last-minute call-out",
      title: "A 2 p.m. visit opens with language and continuity needs.",
      body:
        "SteadyCrew can present qualified candidates, show language, distance, continuity, and credential reasons, then hold the proposal until a supervisor approves and the worker accepts.",
      meta: "SteadyCrew · explainable matching",
      accent: "blue",
    },
    {
      eyebrow: "A line the tool will not cross",
      title: "“Rank aides by speed for a disciplinary scorecard.”",
      body:
        "SteadyCrew refuses the request. KinSight likewise refuses to prescribe, guess through missing context, or treat an unknown protocol as an instruction.",
      meta: "Shared safeguards · explicit refusal",
      accent: "clay",
    },
  ],
  safety: {
    eyebrow: "Caregiver AI Principles",
    title: "The recommendation is not the decision.",
    description:
      "Both programs follow the same accountable pattern: explain the reasoning, protect the person, and wait for confirmation.",
    cards: [
      {
        label: "When information is incomplete",
        title: "Ask, flag, or refuse.",
        description:
          "Low-confidence and contradictory inputs go to human review. Urgent red-flag language follows deterministic crisis routing rather than improvisation.",
      },
      {
        label: "Before anything happens",
        title: "A person makes the call.",
        description:
          "Caregivers and supervisors see the recommendation and reasons, then confirm, change, ignore, or reject it. Overrides remain visible in the record.",
      },
    ],
  },
  access: {
    title: "Start with the tool that fits the day.",
    description:
      "Tell us whether you are caring for family or coordinating a care team. We will follow up directly, without putting you into a generic sales funnel.",
    primaryAction: {
      label: "I care for a family member",
      href: "mailto:info@forwardfnd.org?subject=KinSight%20access",
    },
    secondaryAction: {
      label: "I coordinate a care team",
      href: "mailto:info@forwardfnd.org?subject=SteadyCrew%20access",
    },
  },
  footer: [
    {
      title: "Programs",
      links: [
        { label: "KinSight", href: "#kinsight" },
        { label: "SteadyCrew", href: "#steadycrew" },
        { label: "Request access", href: "#access" },
      ],
    },
    {
      title: "Approach",
      links: [
        { label: "How it works", href: "#how-it-works" },
        { label: "Prototype evidence", href: "#evidence" },
        { label: "Caregiver AI Principles", href: "#principles" },
      ],
    },
    {
      title: "Foundation",
      links: [
        { label: "About", href: "#about" },
        { label: "Contact", href: "mailto:info@forwardfnd.org" },
        { label: "Sacramento, California", href: "#about" },
      ],
    },
  ],
};
