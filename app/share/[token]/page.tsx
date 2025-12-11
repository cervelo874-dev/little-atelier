
import { GuestGalleryGrid } from "@/components/gallery/guest-gallery-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// This is a Server Component
export default async function GuestPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    return (
        <div className="min-h-screen bg-[#fffcf9] font-sans">
            {/* Simple Guest Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <span className="text-xl">🎨</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">Little Atelier</span>
                    </div>

                    <Link href="/">
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            自分もはじめる
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="text-center mb-10 space-y-2">
                    <div className="inline-block bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-2">
                        SHARED GALLERY
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-foreground">
                        共有ギャラリー
                    </h1>
                    <p className="text-muted-foreground">
                        共有された作品コレクションです。
                    </p>
                </div>

                <GuestGalleryGrid token={token} />

                <footer className="mt-20 py-8 text-center text-sm text-muted-foreground border-t">
                    <p>Powered by Little Atelier</p>
                </footer>
            </main>
        </div>
    )
}
