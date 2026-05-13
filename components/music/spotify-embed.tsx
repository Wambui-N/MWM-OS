"use client"

interface SpotifyEmbedProps {
  url: string
}

function toEmbedUrl(url: string): string {
  // https://open.spotify.com/playlist/37i9dQ... → https://open.spotify.com/embed/playlist/37i9dQ...
  return url.replace("open.spotify.com/", "open.spotify.com/embed/")
}

export function SpotifyEmbed({ url }: SpotifyEmbedProps) {
  const embedUrl = `${toEmbedUrl(url)}?utm_source=generator&theme=0`
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="152"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-xl"
    />
  )
}
