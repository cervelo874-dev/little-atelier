"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Copy, Link as LinkIcon, Lock, RefreshCw, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ShareManager() {
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [baseUrl, setBaseUrl] = useState("")

    useEffect(() => {
        setBaseUrl(window.location.origin)
        fetchShareKey()
    }, [])

    const fetchShareKey = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('share_links')
            .select('token')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single()

        if (data) {
            setToken(data.token)
        }
        setLoading(false)
    }

    const generateLink = async () => {
        setGenerating(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Simple random token generation
        const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

        // Deactivate old links first (optional, but keeps it simple: 1 active link per user)
        await supabase.from('share_links')
            .update({ is_active: false })
            .eq('user_id', user.id)

        // Create new link
        const { error } = await supabase.from('share_links').insert({
            user_id: user.id,
            token: newToken,
            label: 'Grandparents',
            is_active: true
        })

        if (!error) {
            setToken(newToken)
        }
        setGenerating(false)
    }

    const shareUrl = token ? `${baseUrl}/share/${token}` : ""

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl)
        alert("リンクをコピーしました！")
    }

    return (
        <main className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="mb-8">
                <Link href="/" className="text-muted-foreground hover:text-primary flex items-center gap-2 mb-4">
                    <ArrowLeft className="h-4 w-4" /> ギャラリーに戻る
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">家族と共有</h1>
                <p className="text-muted-foreground">
                    専用のリンクを作成して、おじいちゃん・おばあちゃんにアルバムを見せてあげましょう。<br />
                    アプリのインストールは不要です。
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-8">
                {loading ? (
                    <div className="py-10 text-center text-muted-foreground">読み込み中...</div>
                ) : token ? (
                    <div className="space-y-6">
                        <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-start gap-3">
                            <Lock className="h-5 w-5 mt-0.5 shrink-0" />
                            <div className="text-sm">
                                <p className="font-bold mb-1">共有ボットが有効です</p>
                                <p>このリンクを知っている人だけが、あなたのギャラリーを閲覧できます。</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">招待リンク</label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={shareUrl}
                                    className="flex-1 bg-muted/50 border border-input rounded-md px-4 py-3 text-sm font-mono text-muted-foreground focus:outline-none"
                                />
                                <Button onClick={copyToClipboard} size="lg" className="shrink-0 gap-2 cursor-pointer">
                                    <Copy className="h-4 w-4" /> コピー
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">リンクを無効にして再発行しますか？</span>
                            <Button variant="ghost" onClick={generateLink} disabled={generating} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                                リンクを再発行
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 space-y-6">
                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LinkIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">まだ共有されていません</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                「招待リンクを作成」ボタンを押すと、閲覧専用のURLが発行されます。
                            </p>
                        </div>
                        <Button size="lg" onClick={generateLink} disabled={generating} className="w-full sm:w-auto px-8 cursor-pointer">
                            {generating ? "作成中..." : "招待リンクを作成する"}
                        </Button>
                    </div>
                )}
            </div>
        </main>
    )
}
