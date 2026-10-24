import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Martian_Mono } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const martian = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VOLTA – The world’s most uncompromising portable espresso machine. Coming soon.",
  description:
    "The first portable espresso machine that doesn't compromise. Pressure profiling, roast-matched temperature, and a 49 mm basket, the new standard. All on battery power.",
  // Unofficial concept: keep it out of search engines until VOLTA adopts it.
  robots: { index: false, follow: false },
  icons: { icon: "/brand/volta_ico-300x300.png" },
};

export const viewport: Viewport = {
  themeColor: "#131516",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrument.variable} ${martian.variable}`}>
      <body>{children}</body>
    </html>
  );
}
