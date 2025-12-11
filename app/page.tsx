import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

// Force dynamic rendering to ensure the user session is always checked freshly
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      {/* Header is server-rendered for auth state */}
      <Header />

      <main className="flex-1 w-full">
        {/* Hero Section - Re-structured for better stability */}
        <section className="w-full py-20 md:py-32 px-4 flex flex-col items-center justify-center text-center gap-8 animate-in fade-in zoom-in duration-500">

          <div className="bg-primary/10 text-primary rounded-full px-6 py-2 text-sm font-bold tracking-wider shadow-sm">
            子供の作品専用 ポケット美術館
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-widest text-foreground max-w-5xl leading-tight">
            <span className="inline-block whitespace-nowrap">あふれる思い出を、</span><br className="md:hidden" />
            <span className="text-primary relative inline-block mx-2">
              <span className="relative z-10">ずっとキレイに。</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-primary/20 -rotate-1 rounded-full -z-0"></span>
            </span>
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
            Little Atelierは、どんどん増える子供の絵や工作を、スマホで撮影して整理するだけのシンプルなアプリです。
            容量を気にせず、成長の記録を一生の宝物にしましょう。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full justify-center max-w-md sm:max-w-none">
            <Link href="/upload" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-full shadow-xl hover:translate-y-[-2px] transition-all gap-3">
                <Upload className="h-5 w-5" /> 作品をアップロード
              </Button>
            </Link>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="container mx-auto px-4 py-12 border-t">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold tracking-wide">最近の傑作たち</h2>
              <p className="text-sm text-muted-foreground">追加したばかりの作品</p>
            </div>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              すべて見る
            </Button>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted/30 rounded-xl animate-pulse" />
              ))}
            </div>
          }>
            <GalleryGrid />
          </Suspense>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-muted-foreground border-t">
        <p>&copy; 2025 Little Atelier</p>
        <p className="mt-1 opacity-50">Rev.20250101-v2</p>
      </footer>
    </div>
  );
}
