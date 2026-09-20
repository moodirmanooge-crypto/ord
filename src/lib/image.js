import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

async function toBitmap(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file)
    } catch {
      /* fall through */
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}

async function compress(file, { max, quality, png }) {
  const bmp = await toBitmap(file)
  const w0 = bmp.width
  const h0 = bmp.height
  const scale = Math.min(1, max / Math.max(w0, h0))
  const w = Math.max(1, Math.round(w0 * scale))
  const h = Math.max(1, Math.round(h0 * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!png) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
  }
  ctx.drawImage(bmp, 0, 0, w, h)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('The image could not be processed.'))), png ? 'image/png' : 'image/jpeg', quality),
  )
}

const blobToDataURL = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(blob)
  })

/**
 * Upload an image: it is first compressed in the browser, then sent to Firebase Storage.
 * If Storage rules or the network refuse it, a small data-URL stored in Firestore is used instead.
 */
export async function uploadImage(file, { folder = 'misc', png = false, onProgress } = {}) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Please choose an image (JPG, PNG or WEBP).')
  if (file.size > 25 * 1024 * 1024) throw new Error('The image is too large (maximum 25MB).')
  const usePng = png && file.type !== 'image/jpeg'
  const blob = await compress(file, { max: usePng ? 900 : 1800, quality: 0.82, png: usePng })
  const path = `rda/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${usePng ? 'png' : 'jpg'}`
  try {
    const task = uploadBytesResumable(ref(storage, path), blob, { contentType: blob.type })
    await new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (s) => onProgress && onProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
        reject,
        resolve,
      )
    })
    return await getDownloadURL(task.snapshot.ref)
  } catch (e) {
    console.warn('[RDA] Storage upload failed, using inline image', e)
    for (const [max, q, asPng] of [
      [usePng ? 500 : 1100, 0.72, usePng],
      [800, 0.6, false],
    ]) {
      const small = await compress(file, { max, quality: q, png: asPng })
      const data = await blobToDataURL(small)
      if (data.length < 600000) {
        onProgress && onProgress(100)
        return data
      }
    }
    throw new Error('The image could not be saved. Check your Firebase Storage rules or use a smaller image.')
  }
}

/**
 * Upload a video file to Firebase Storage (no compression, no fallback).
 * Storage rules must allow video uploads under rda/videos (see storage.rules).
 */
export async function uploadVideo(file, { onProgress } = {}) {
  if (!file || !file.type.startsWith('video/')) throw new Error('Please choose a video file (MP4, WebM or MOV).')
  if (file.size > 200 * 1024 * 1024) throw new Error('The video is too large (maximum 200MB). Upload it to YouTube and paste the link instead.')
  const ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'mp4'
  const path = `rda/videos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  try {
    const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type })
    await new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (s) => onProgress && onProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
        reject,
        resolve,
      )
    })
    return await getDownloadURL(task.snapshot.ref)
  } catch (e) {
    console.error('[RDA] video upload failed', e)
    throw new Error('The video could not be uploaded. Make sure your Firebase Storage rules allow videos (see storage.rules), or paste a YouTube link instead.')
  }
}