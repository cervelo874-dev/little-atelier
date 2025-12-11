"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, UserPlus, Save } from "lucide-react"

type Child = {
    id: string
    name: string
    birth_date: string | null
    color: string
}

export function SettingsManager() {
    const [children, setChildren] = useState<Child[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState("")
    const [newBirthDate, setNewBirthDate] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchChildren()
    }, [])

    const fetchChildren = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('children')
            .select('*')
            .eq('user_id', user.id)
            .order('birth_date', { ascending: false })

        if (data) {
            setChildren(data)
        }
        setLoading(false)
    }

    const addChild = async () => {
        if (!newName) return
        setSubmitting(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('children')
            .insert({
                user_id: user.id,
                name: newName,
                birth_date: newBirthDate || null,
                color: 'blue' // Default for now
            })

        if (!error) {
            setNewName("")
            setNewBirthDate("")
            fetchChildren()
        } else {
            alert("エラーが発生しました")
        }
        setSubmitting(false)
    }

    const deleteChild = async (id: string) => {
        if (!confirm("本当に削除しますか？\n（このお子様に紐付いた作品のタグ情報は残りますが、自動計算などは解除されます）")) return

        const { error } = await supabase
            .from('children')
            .delete()
            .eq('id', id)

        if (!error) {
            fetchChildren()
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">設定</h1>

            <div className="bg-card border rounded-xl p-6 shadow-sm mb-8">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    お子様の登録
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                    登録すると、アップロード時に年齢を自動計算したり、ギャラリーで絞り込みができるようになります。
                </p>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">お名前（ニックネーム）</label>
                        <Input
                            placeholder="例：はなちゃん"
                            value={newName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">誕生日</label>
                        <Input
                            type="date"
                            value={newBirthDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBirthDate(e.target.value)}
                        />
                    </div>
                    <Button onClick={addChild} disabled={submitting || !newName} className="self-end gap-2">
                        <Save className="h-4 w-4" /> 登録する
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold">登録済みのお子様</h2>
                {loading ? (
                    <p className="text-muted-foreground">読み込み中...</p>
                ) : children.length === 0 ? (
                    <div className="text-center py-8 bg-muted/30 rounded-lg text-muted-foreground text-sm">
                        まだ登録されていません
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {children.map((child) => (
                            <div key={child.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                                <div>
                                    <p className="font-bold text-lg">{child.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {child.birth_date ? new Date(child.birth_date).toLocaleDateString() + " 生まれ" : "誕生日未登録"}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteChild(child.id)} className="text-muted-foreground hover:text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
