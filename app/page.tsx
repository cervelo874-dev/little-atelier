
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { GalleryGrid } from "@/components/gallery/gallery-grid";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center space-y-8">
          <div className="bg-primary/10 text-primary rounded-full px-6 py-2 text-sm font-bold tracking-wider">
            子供の作品専用 ポケット美術館
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-widest text-foreground max-w-5xl leading-snug text-balance">
            冷蔵庫に貼りきれない思い出を、<br className="md:hidden" />
            <span className="text-primary relative inline-block whitespace-nowrap">
              <span className="relative z-10">ずっとキレイに・コンパクトに</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 -rotate-1 rounded-full -z-0"></span>
            </span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl leading-relaxed font-medium text-balance">
            Little Atelierは、どんどん増える子供の絵や工作を、スマホで撮影して整理するだけのシンプルなアプリです。
            容量を気にせず、成長の記録を一生の宝物にしましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-6 pt-6">
            <Link href="/upload">
              <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all gap-3 cursor-pointer">
                ギャラリーを作る <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full border-2 gap-3 cursor-pointer hover:bg-muted/50">
                <Upload className="h-5 w-5" /> 作品をアップロード
              </Button>
            </Link>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-wide text-foreground">最近の傑作たち</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">すべて見る</Button>
          </div>

          <Suspense fallback={<div className="text-center py-20 text-muted-foreground">ギャラリーを読み込み中...</div>}>
            <GalleryGrid />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
