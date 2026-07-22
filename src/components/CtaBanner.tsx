import { ArrowUpRightIcon } from "@/components/icons";

interface CtaBannerProps {
  heading: string;
  button: { text: string; href: string } | null;
}

export function CtaBanner({ heading, button }: CtaBannerProps) {
  return (
    <section className="ff-container py-8">
      <div className="flex min-h-96 flex-col items-center justify-center rounded-[2rem] bg-black px-6 py-16 text-center text-white">
        <h2 className="ff-balance max-w-4xl text-[44px] font-medium leading-none tracking-[-0.05em] md:text-[64px]">{heading}</h2>
        {button ? (
          <a href={button.href} className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-black">
            {button.text}<ArrowUpRightIcon className="size-3" />
          </a>
        ) : null}
      </div>
    </section>
  );
}
