
import { Header } from "@/components/header"
import { ShareManager } from "@/components/share/share-manager"

export default function SharePage() {
    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />
            <ShareManager />
        </div>
    )
}
