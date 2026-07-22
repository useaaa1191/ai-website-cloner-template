import Link from "next/link";
import { ArrowUpRightIcon, ForwardMark, GlobeIcon } from "@/components/icons";
import type { FooterGroup } from "@/types/home";

interface SiteFooterProps {
  groups: FooterGroup[];
}

export function SiteFooter({ groups }: SiteFooterProps) {
  return (
    <footer className="mt-8 border-t border-black/10 pb-10 pt-12">
      <div className="ff-container">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Forward Foundation home">
              <ForwardMark className="size-8" />
              <span className="text-[15px] font-semibold tracking-[-0.02em]">Forward Foundation</span>
            </Link>
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-black/50">
              Free, human-confirmed decision support for family dementia caregivers and the direct-care workforce.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-[13px] font-semibold">{group.title}</h3>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <a href={link.href} className="inline-flex items-center gap-1 text-[13px] text-black/50 transition hover:text-black">
                        {link.label}
                        {link.href.startsWith("mailto:") ? <ArrowUpRightIcon className="size-2.5" /> : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-black/10 pt-7 text-[12px] text-black/45 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Forward Foundation © 2024–{new Date().getFullYear()}</span>
            <a href="mailto:info@forwardfnd.org" className="hover:text-black">info@forwardfnd.org</a>
            <a href="tel:+19162446341" className="hover:text-black">(916) 244-6341</a>
          </div>
          <span className="inline-flex items-center gap-1.5"><GlobeIcon className="size-3.5" /> English · Español support planned</span>
        </div>
      </div>
    </footer>
  );
}
