
import { Header } from "@/components/header"
import { SettingsManager } from "@/components/settings/settings-manager"

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />
            <main>
                <SettingsManager />
            </main>
        </div>
    )
}
