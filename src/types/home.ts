export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface HeroChip {
  label: string;
  href: string;
  external?: boolean;
}

export interface FeaturedCard {
  title: string;
  href: string;
  category: string | null;
  readTime: string | null;
  image: string | null;
  imageAlt: string;
  video: string | null;
  variant: "primary" | "side";
}

export interface ContentCard {
  title: string;
  href: string;
  category: string | null;
  date: string | null;
  readTime: string | null;
  image: string | null;
  imageAlt: string;
}

export interface ContentSection {
  heading: string;
  viewMore: { text: string; href: string } | null;
  cards: ContentCard[];
}

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

export interface HomeContent {
  meta: { title: string; description: string };
  nav: NavItem[];
  hero: {
    title: string;
    placeholder: string;
    rotatingPrompts: string[];
    chips: HeroChip[];
    moreChip: HeroChip;
  };
  featured: FeaturedCard[];
  news: ContentSection;
  stories: ContentSection;
  research: ContentSection;
  business: ContentSection;
  cta: {
    heading: string;
    button: { text: string; href: string } | null;
    textAll?: string;
  };
  footer: FooterGroup[];
}
