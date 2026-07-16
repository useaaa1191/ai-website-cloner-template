import {
  DiscordIcon,
  ExternalArrowIcon,
  GitHubIcon,
  GlobeIcon,
  InstagramIcon,
  LinkedInIcon,
  OpenAILogo,
  TikTokIcon,
  XSocialIcon,
  YouTubeIcon,
} from "@/components/icons";
import type { FooterGroup } from "@/types/home";

interface SiteFooterProps {
  groups: FooterGroup[];
}

const socials = [
  { label: "X", href: "https://x.com/OpenAI", Icon: XSocialIcon },
  { label: "YouTube", href: "https://www.youtube.com/OpenAI", Icon: YouTubeIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/openai", Icon: LinkedInIcon },
  { label: "GitHub", href: "https://github.com/openai", Icon: GitHubIcon },
  { label: "Instagram", href: "https://www.instagram.com/openai", Icon: InstagramIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@openai", Icon: TikTokIcon },
  { label: "Discord", href: "https://discord.com/invite/openai", Icon: DiscordIcon },
] as const;

export function SiteFooter({ groups }: SiteFooterProps) {
  // Show primary columns; skip sparse ones if needed
  const columns = groups.filter((g) => g.links.length > 0).slice(0, 11);

  return (
    <footer className="mt-8 border-t border-oai-border pt-12 pb-10">
      <div className="oai-container">
        <div className="mb-10">
          <OpenAILogo className="h-[17px] w-auto text-black" />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {columns.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-[14px] font-medium text-black">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1 text-[14px] text-oai-muted transition hover:text-black"
                    >
                      {link.label}
                      {link.external ? (
                        <ExternalArrowIcon className="h-2.5 w-2.5 -translate-y-px opacity-70" />
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-oai-border pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-black transition hover:opacity-60"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-oai-muted">
            <span>OpenAI © 2015–{new Date().getFullYear()}</span>
            <a href="https://openai.com/policies/privacy-policy/" className="hover:text-black">
              Privacy Policy
            </a>
            <a href="https://openai.com/policies/terms-of-use/" className="hover:text-black">
              Terms of Use
            </a>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 hover:text-black"
            >
              <GlobeIcon className="size-3.5" />
              English
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
