"use client"

interface YouTubeEmbedProps {
  url: string
}

function toEmbedUrl(url: string): string {
  let videoId: string | null = null
  let playlistId: string | null = null

  // youtu.be/<id>
  const shortMatch = url.match(/youtu\.be\/([^?&\s]+)/)
  if (shortMatch) videoId = shortMatch[1]

  // youtube.com/watch?v=<id>
  const longMatch = url.match(/[?&]v=([^&\s]+)/)
  if (longMatch) videoId = longMatch[1]

  // ?list=<id>
  const listMatch = url.match(/[?&]list=([^&\s]+)/)
  if (listMatch) playlistId = listMatch[1]

  const params = new URLSearchParams({ autoplay: "0", controls: "1" })
  if (playlistId) {
    params.set("list", playlistId)
    params.set("listType", "playlist")
  }

  const base = videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : "https://www.youtube.com/embed/videoseries"

  return `${base}?${params.toString()}`
}

export function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  return (
    <iframe
      src={toEmbedUrl(url)}
      width="100%"
      height="152"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
      allowFullScreen
      className="rounded-xl"
    />
  )
}
