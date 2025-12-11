import { UploadForm } from "@/components/upload/upload-form"
import { Header } from "@/components/header"

export default function UploadPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-center mb-6">作品をアップロード</h1>
                <UploadForm />
            </main>
        </div>
    )
}
