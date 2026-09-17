import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import { PlayerGate } from "@/components/PlayerGate";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RuleBreakers — spot what's wrong, fix the world",
  description:
    "Something is broken in every little world. Kids discover the hidden rule, repair it, explain how they knew — and the AI invents the next world to test what they really understand.",
};

export const viewport: Viewport = {
  themeColor: "#2bb6d9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fredoka.variable} h-full`}>
      <body className="min-h-full">
        <PlayerGate>{children}</PlayerGate>
      </body>
    </html>
  );
}
