import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export default function AuthConfirmPage({
    searchParams,
}: {
    searchParams: { code?: string, error?: string, error_description?: string }
}) {
    // If there's an error passed directly (unlikely if just a link click, but possible)
    if (searchParams.error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                <div className="text-destructive mb-4 text-xl font-bold">ログインエラー</div>
                <p className="text-muted-foreground mb-6">
                    {searchParams.error_description || "リンクが無効、または期限切れです。"}
                </p>
                <Link href="/login">
                    <Button>ログイン画面に戻る</Button>
                </Link>
            </div>
        )
    }

    const code = searchParams.code

    if (!code) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                <div className="mb-4 text-xl font-bold">リンクが無効です</div>
                <Link href="/login">
                    <Button>ログイン画面に戻る</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center space-y-6">
            <div className="bg-primary/10 p-4 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ログインの確認</h1>
            <p className="text-muted-foreground max-w-sm">
                下のボタンを押して、ログインを完了してください。
            </p>

            {/* Pass the code to the actual callback handler */}
            <Link href={`/auth/callback?code=${code}`} prefetch={false}>
                <Button size="lg" className="w-full max-w-xs font-bold text-lg h-12 shadow-lg">
                    ログインを完了する
                </Button>
            </Link>
        </div>
    )
}
