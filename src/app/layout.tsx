import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "Forward Foundation | Care decisions, not autopilot";
const description =
  "Free, human-confirmed decision support for family dementia caregivers and the direct-care workforce.";

export const metadata: Metadata = {
  metadataBase: new URL("https://forwardfnd.org"),
  title,
  description,
  applicationName: "Forward Foundation",
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/seo/forward-favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Forward Foundation",
    title,
    description,
    images: [
      {
        url: "/seo/forward-og.svg",
        width: 1200,
        height: 630,
        alt: "Forward Foundation. Care decisions, not autopilot.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/seo/forward-og.svg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
