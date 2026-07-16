interface CtaBannerProps {
  heading: string;
  button: { text: string; href: string } | null;
}

export function CtaBanner({ heading, button }: CtaBannerProps) {
  return (
    <section className="oai-container">
      <div className="flex flex-col items-center justify-center rounded-3xl bg-oai-cta-bg px-6 py-16 text-center md:py-20">
        <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.32px] text-black md:text-[40px]">
          {heading}
        </h2>
        {button ? (
          <a
            href={button.href}
            className="mt-6 inline-flex h-10 items-center rounded-full bg-black px-5 text-[14px] font-medium leading-none text-white transition hover:opacity-85"
          >
            {button.text}
          </a>
        ) : null}
      </div>
    </section>
  );
}
