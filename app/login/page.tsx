"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Loader2, Mail, Palette } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Check for error parameters in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const error = params.get('error')
        const errorDescription = params.get('error_description')
        if (error && errorDescription) {
            setMessage({ type: 'error', text: `${error}: ${errorDescription}` })
        }
    }, [])

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        setMessage(null)

        const supabase = createClient()
        // Try Magic Link first as it's cleaner for this app type
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // Use relative path - Supabase will append this to the configured Site URL
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: "ログイン用のリンクをメールで送信しました！" })
        }
        setIsLoading(false)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Palette className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Little Atelier
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        ポケットの中の美術館へようこそ。<br />
                        メールアドレスでログインして始めましょう。
                    </p>
                </div>

                <div className="flex flex-col gap-4">

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full rounded-md border border-input bg-background px-10 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            ログイン用リンクを送信
                        </Button>
                    </form>

                    {message && (
                        <div className={`p-4 rounded-md text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
