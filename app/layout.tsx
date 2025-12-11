import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Little Atelier | The Pocket Museum",
  description: "Preserve your child's masterpieces forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={cn(
          zenMaruGothic.variable,
          "antialiased bg-background text-foreground font-sans"
        )}
      >
        {children}
      </body>
    </html>
  );
}
