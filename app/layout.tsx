import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Center for Digital Democracy",
    template: "%s · Center for Digital Democracy",
  },
  description:
    "Independent research and policy design advancing tech policy, civic AI, data rights, and election integrity for better democratic outcomes. Design prototype.",
  keywords: [
    "digital democracy",
    "tech policy",
    "civic AI",
    "election integrity",
    "platform governance",
    "data rights",
  ],
  openGraph: {
    title: "Center for Digital Democracy",
    description:
      "Advancing tech policy for better democratic outcomes. Design prototype.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
