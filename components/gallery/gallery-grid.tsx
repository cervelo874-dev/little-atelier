"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { Calendar, User, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Artwork = {
    id: string
    storage_path: string
    shot_at_date: string | null
    age_at_creation: string | null
    memo: string | null
    created_at: string
    child_id: string | null
}

type Child = {
    id: string
    name: string
    color: string
}

export function GalleryGrid() {
    const [artworks, setArtworks] = useState<Artwork[]>([])
    const [children, setChildren] = useState<Child[]>([])
    const [activeFilter, setActiveFilter] = useState<string>("all")
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch Children
        const { data: childrenData } = await supabase
            .from('children')
            .select('id, name, color')
            .eq('user_id', user.id)

        if (childrenData) setChildren(childrenData)

        // Fetch Artworks
        const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .eq('user_id', user.id)
            .order('shot_at_date', { ascending: false })

        if (data) {
            setArtworks(data)

            // Generate Signed URLs
            const urlPromises = data.map(async (art: Artwork) => {
                const { data: signedData } = await supabase.storage
                    .from('artworks')
                    .createSignedUrl(art.storage_path, 3600)

                return {
                    id: art.id,
                    url: signedData?.signedUrl || null
                }
            })

            const results = await Promise.all(urlPromises)
            const urls: Record<string, string> = {}
            results.forEach(item => {
                if (item.url) urls[item.id] = item.url
            })
            setImageUrls(urls)
        }
        setLoading(false)
    }

    const handleDelete = async (id: string, storagePath: string) => {
        if (!confirm("本当に削除しますか？\nこの操作は取り消せません。")) return

        // 1. Delete from Storage
        const { error: storageError } = await supabase.storage
            .from('artworks')
            .remove([storagePath])

        if (storageError) {
            console.error("Storage delete error:", storageError)
            alert("画像の削除に失敗しました")
            return
        }

        // 2. Delete from DB
        const { error: dbError } = await supabase
            .from('artworks')
            .delete()
            .eq('id', id)

        if (dbError) {
            console.error("DB delete error:", dbError)
            alert("データの削除に失敗しました")
            return
        }

        // 3. Update UI
        setArtworks(prev => prev.filter(art => art.id !== id))
    }

    const filteredArtworks = activeFilter === "all"
        ? artworks
        : artworks.filter(art => art.child_id === activeFilter)

    if (loading) {
        return <div className="text-center py-20 text-muted-foreground animate-pulse">読み込み中...</div>
    }

    if (!artworks || artworks.length === 0) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-muted-foreground text-lg">作品がまだありません。</p>
                <p className="text-sm text-muted-foreground">右上のボタンから最初の作品を追加してみましょう！</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            {children.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                    <Button
                        variant={activeFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("all")}
                        className="rounded-full"
                    >
                        すべて
                    </Button>
                    {children.map(child => (
                        <Button
                            key={child.id}
                            variant={activeFilter === child.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveFilter(child.id)}
                            className="rounded-full"
                        >
                            {child.name}
                        </Button>
                    ))}
                </div>
            )}

            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {filteredArtworks.map((art) => (
                    <div key={art.id} className="break-inside-avoid relative group rounded-xl overflow-hidden bg-muted/20 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="relative aspect-auto">
                            {imageUrls[art.id] ? (
                                <Image
                                    src={imageUrls[art.id]}
                                    alt="Artwork"
                                    width={500}
                                    height={500}
                                    className="w-full h-auto object-cover"
                                />
                            ) : (
                                <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
                                    Loading...
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <div className="absolute top-2 right-2">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handleDelete(art.id, art.storage_path)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {art.memo && (
                                    <p className="text-white text-sm font-medium line-clamp-2 mb-2">
                                        {art.memo}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 text-white/80 text-xs">
                                    {art.shot_at_date && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {art.shot_at_date}
                                        </span>
                                    )}
                                    {art.age_at_creation && (
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {art.age_at_creation}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
