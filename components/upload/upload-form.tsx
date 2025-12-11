"use client"

import { useState, useEffect } from "react"
import { compressImage } from "@/lib/image-compression"
import { calculateAge } from "@/lib/age-calculator"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, Calendar, User } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function UploadForm() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [isCompressing, setIsCompressing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()

    // Metadata State
    const [shotDate, setShotDate] = useState(new Date().toISOString().split('T')[0])
    const [birthDate, setBirthDate] = useState("")
    const [age, setAge] = useState("")
    const [memo, setMemo] = useState("")

    // Child Profile State
    type Child = { id: string, name: string, birth_date: string | null }
    const [children, setChildren] = useState<Child[]>([])
    const [selectedChildId, setSelectedChildId] = useState<string>("none")

    useEffect(() => {
        const fetchChildren = async () => {
            const supabase = createClient()
            const { data } = await supabase.from('children').select('*')
            if (data) setChildren(data)
        }
        fetchChildren()
    }, [])

    useEffect(() => {
        if (selectedChildId && selectedChildId !== "none") {
            const child = children.find(c => c.id === selectedChildId)
            if (child && child.birth_date) {
                setBirthDate(child.birth_date)
            }
        }
    }, [selectedChildId, children])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setIsCompressing(true)
        try {
            const compressed = await compressImage(selectedFile)
            setFile(compressed)
            setPreview(URL.createObjectURL(compressed))
        } catch (err) {
            console.error(err)
            setFile(selectedFile)
            setPreview(URL.createObjectURL(selectedFile))
        } finally {
            setIsCompressing(false)
        }
    }

    const handleRemove = () => {
        setFile(null)
        setPreview(null)
        setAge("")
        setMemo("")
        setBirthDate("")
        setSelectedChildId("none")
    }

    // Auto calculate age
    useEffect(() => {
        if (shotDate && birthDate) {
            const calculatedAge = calculateAge(birthDate, shotDate)
            setAge(calculatedAge)
        }
    }, [shotDate, birthDate])

    const handleSubmit = async () => {
        if (!file) return
        setIsUploading(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                alert("ログインしてください")
                return
            }

            // 1. Upload Image
            const filename = `${Date.now()}-${file.name}`
            const filePath = `${user.id}/${filename}`

            const { error: uploadError } = await supabase.storage
                .from('artworks')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Insert DB Record
            const { error: dbError } = await supabase
                .from('artworks')
                .insert({
                    user_id: user.id,
                    storage_path: filePath,
                    shot_at_date: shotDate,
                    age_at_creation: age,
                    memo: memo,
                    child_id: selectedChildId !== "none" ? selectedChildId : null
                })

            if (dbError) throw dbError

            router.push('/')
            router.refresh()

        } catch (error) {
            console.error(error)
            alert("アップロードに失敗しました")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-4 space-y-6">
            {!preview ? (
                <label className="border-2 border-dashed border-input hover:border-primary/50 bg-muted/10 hover:bg-muted/30 rounded-2xl aspect-[3/4] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <div className="bg-primary/10 text-primary p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <span className="font-semibold text-lg text-foreground">作品を追加</span>
                    <span className="text-sm text-muted-foreground mt-2 px-8 text-center">タップして写真を撮るか<br />ライブラリから選択</span>
                </label>
            ) : (
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-black shadow-lg">
                    <Image src={preview} alt="Preview" fill className="object-contain" />
                    <button onClick={handleRemove} className="absolute top-3 right-3 bg-black/60 text-white p-2.5 rounded-full hover:bg-black/80 backdrop-blur-sm transition-colors z-10">
                        <X className="h-5 w-5" />
                    </button>
                    {isCompressing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <span className="font-medium text-lg">圧縮中...</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {file && !isCompressing && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    {/* Child Selection */}
                    {children.length > 0 && (
                        <div>
                            <label className="text-sm font-medium mb-1 block">誰の作品ですか？</label>
                            <select
                                className="w-full p-2 border rounded-md bg-transparent"
                                value={selectedChildId}
                                onChange={(e) => setSelectedChildId(e.target.value)}
                            >
                                <option value="none">選択しない（または新規）</option>
                                {children.map(child => (
                                    <option key={child.id} value={child.id}>{child.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" /> 撮影日
                            </label>
                            <input
                                type="date"
                                value={shotDate}
                                onChange={(e) => setShotDate(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="h-3.5 w-3.5" /> お子様の誕生日
                            </label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                    </div>

                    {age && (
                        <div className="bg-primary/5 text-primary text-center py-2 rounded-md font-medium text-sm">
                            制作時の月齢: {age}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">メモ (任意)</label>
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="例: 保育園で描いたパパの似顔絵"
                            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                        />
                    </div>

                    <Button onClick={handleSubmit} disabled={isUploading} className="w-full h-12 text-lg shadow-md cursor-pointer" size="lg">
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 保存中...
                            </>
                        ) : (
                            "ギャラリーに保存"
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}
