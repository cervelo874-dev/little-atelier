"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { Calendar, User } from "lucide-react"

type Artwork = {
    id: string
    storage_path: string
    shot_at_date: string | null
    age_at_creation: string | null
    memo: string | null
    created_at: string
}

export function GuestGalleryGrid({ token }: { token: string }) {
    const [artworks, setArtworks] = useState<Artwork[]>([])
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSharedArtworks = async () => {
            const supabase = createClient()

            // Call the RPC function we defined in SQL
            // returns setof artworks
            const { data, error } = await supabase.rpc('get_shared_artworks', {
                share_token: token
            })

            if (error) {
                console.error("Error fetching shared artworks:", error)
            } else if (data) {
                setArtworks(data)

                // Generate Signed URLs for each artwork
                // Using createSignedUrl is safer for private buckets
                const urlPromises = data.map(async (art: Artwork) => {
                    const { data: signedData } = await supabase.storage
                        .from('artworks')
                        .createSignedUrl(art.storage_path, 3600) // Valid for 1 hour

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

        fetchSharedArtworks()
    }, [token])

    if (loading) {
        return <div className="text-center py-20 text-muted-foreground animate-pulse">作品を読み込んでいます...</div>
    }

    if (!artworks || artworks.length === 0) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-muted-foreground text-lg">まだ作品が公開されていません。</p>
            </div>
        )
    }

    return (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {artworks.map((art) => (
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

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
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
    )
}
