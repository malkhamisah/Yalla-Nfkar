import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const arabic = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "يلا نفكر · Yalla Nfkar",
  description:
    "ألعاب قصيرة تخليك تشوف الأشياء من زاوية ثانية. مو لازم تكون عندك فكرة — نبدأ سوا.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FBF7F0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={arabic.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
