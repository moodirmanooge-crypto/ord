// Helpers for photos & videos attached to pages.

// Firestore collection that stores the photos & videos (one document per file).
export const MEDIA_COL = 'rda_media'

/** Detect YouTube / Vimeo links, otherwise treat the URL as a direct video file. */
export function parseVideo(url = '') {
  const u = String(url).trim()
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i)
  if (m) {
    return { kind: 'youtube', id: m[1], embed: `https://www.youtube-nocookie.com/embed/${m[1]}`, thumb: `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`, src: u }
  }
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (m) return { kind: 'vimeo', id: m[1], embed: `https://player.vimeo.com/video/${m[1]}`, thumb: '', src: u }
  return { kind: 'file', embed: '', thumb: '', src: u }
}