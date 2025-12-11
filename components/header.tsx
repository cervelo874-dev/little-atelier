
import Link from "next/link"
import { Button } from "./ui/button"
import { Palette } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { MobileMenu } from "./mobile-menu"

export async function Header() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
                        <span className="text-xl">🎨</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">Little Atelier</span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            {/* Desktop Nav */}
                            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground mr-4">
                                <Link href="/" className="hover:text-primary transition-colors">ギャラリー</Link>
                                <Link href="/share" className="hover:text-primary transition-colors flex items-center gap-1">
                                    家族と共有 <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">New</span>
                                </Link>
                                <Link href="/settings" className="hover:text-primary transition-colors">設定</Link>
                            </nav>

                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/upload">
                                    <Button size="sm" className="gap-2">
                                        + 作品を追加
                                    </Button>
                                </Link>
                                <form action="/auth/signout" method="post">
                                    <Button variant="ghost" size="sm" type="submit">
                                        ログアウト
                                    </Button>
                                </form>
                            </div>

                            {/* Mobile Nav */}
                            <MobileMenu />
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    ログイン
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button size="sm">
                                    はじめる
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
