import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenAI | Research & Deployment",
  description:
    "We believe our research will eventually lead to artificial general intelligence, a system that can solve human-level problems. Building safe and beneficial AGI is our mission.",
  icons: {
    icon: [
      { url: "/seo/favicon.ico", sizes: "48x48" },
      { url: "/seo/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/seo/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "OpenAI | Research & Deployment",
    description:
      "We believe our research will eventually lead to artificial general intelligence, a system that can solve human-level problems. Building safe and beneficial AGI is our mission.",
    images: ["/seo/og.png"],
  },
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
