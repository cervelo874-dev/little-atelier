```javascript
"use client"

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Palette, KeyRound, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const error = params.get('error')
        const errorDescription = params.get('error_description')

        if (error && errorDescription) {
            setMessage({ type: 'error', text: `${ error }: ${ errorDescription } ` })
        }
    }, [])

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                }
            })

            if (error) {
                setMessage({ type: 'error', text: "エラーが発生しました: " + error.message })
            } else {
                setIsOtpSent(true)
                setMessage({ type: 'success', text: "確認コードをメールで送信しました。入力してください。" })
            }
        } catch (error) {
             setMessage({ type: 'error', text: "予期せぬエラーが発生しました。" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!otp) return

        setIsLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email',
            })

            if (error) {
                setMessage({ type: 'error', text: "コードが正しくないか、期限切れです。" })
            } else {
                setMessage({ type: 'success', text: "ログイン成功！リダイレクト中..." })
                router.refresh()
                router.push('/')
            }
        } catch (error) {
            setMessage({ type: 'error', text: "認証中にエラーが発生しました。" })
        } finally {
            setIsLoading(false)
        }
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
                        {!isOtpSent ? "メールアドレスでログインして始めましょう。" : "届いた6桁のコードを入力してください。"}
                    </p>
                </div>

                <div className="flex flex-col gap-4">

                    {!isOtpSent ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="pl-10"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                確認コードを送信
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="000000"
                                    className="pl-10 text-center tracking-widest text-lg"
                                    maxLength={6}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                ログインする
                            </Button>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                className="w-full" 
                                onClick={() => setIsOtpSent(false)}
                                disabled={isLoading}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> メールアドレスに戻る
                            </Button>
                        </form>
                    )}

                    {message && (
                        <div className={`p - 4 rounded - md text - sm ${ message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600' } `}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
```
