"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative z-50">
                {isOpen ? <X /> : <Menu />}
            </Button>

            {isOpen && (
                <div className="fixed inset-0 top-16 bg-background border-t p-4 z-40 animate-in slide-in-from-top-5">
                    <nav className="flex flex-col gap-4 text-lg font-medium p-4">
                        <Link href="/" onClick={() => setIsOpen(false)} className="py-2 border-b">
                            ギャラリー
                        </Link>
                        <Link href="/upload" onClick={() => setIsOpen(false)} className="py-2 border-b">
                            作品を追加
                        </Link>
                        <Link href="/share" onClick={() => setIsOpen(false)} className="py-2 border-b">
                            家族と共有
                        </Link>
                        <Link href="/settings" onClick={() => setIsOpen(false)} className="py-2 border-b">
                            設定
                        </Link>
                        <form action="/auth/signout" method="post">
                            <button type="submit" className="text-left w-full py-2 text-red-500">
                                ログアウト
                            </button>
                        </form>
                    </nav>
                </div>
            )}
        </div>
    )
}
