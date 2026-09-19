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
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Sawirka lama shaqayn karo.'))), png ? 'image/png' : 'image/jpeg', quality),
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
 * Sawir kor u qaad: marka hore waa la yaraysaa (compress), kadibna Firebase Storage.
 * Haddii Storage rules ama shabakaddu diidaan, waxaa loo beddelaa data-URL yar oo Firestore lagu kaydiyo.
 */
export async function uploadImage(file, { folder = 'misc', png = false, onProgress } = {}) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Fadlan dooro sawir (JPG, PNG ama WEBP).')
  if (file.size > 25 * 1024 * 1024) throw new Error('Sawirku aad buu u weyn yahay (ugu badnaan 25MB).')
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
    throw new Error('Sawirka lama kaydin karo. Hubi Firebase Storage rules ama isticmaal sawir ka yar.')
  }
}
