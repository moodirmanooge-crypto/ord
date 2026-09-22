import { initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase project: dream-crt  (Firebase Console → Project settings → Your apps → Web app)
// HUBI: apiKey ka koobi si toos ah Firebase Console (copy button) haddii login/xogtu aysan shaqayn.
const firebaseConfig = {
  apiKey: 'AIzaSyDglUrh6FZLth5O2iYImTpRXo_PowOnu_4',
  authDomain: 'dream-crt.firebaseapp.com',
  projectId: 'dream-crt',
  storageBucket: 'dream-crt.firebasestorage.app',
  messagingSenderId: '85071233869',
  appId: '1:85071233869:web:4b4707fd91dda82442ed04',
  measurementId: 'G-1D2MFK0KNM',
}

export const app = initializeApp(firebaseConfig)

// Firestore keeps a local copy of the data on the device (IndexedDB). On the very first visit
// the app still waits for the network; on every visit after that, the hero images, menu and page
// text render immediately from the local copy while Firestore quietly checks for anything newer
// in the background. This is what makes reloads and repeat visits feel instant instead of waiting
// on the network every time. Older or very locked-down browsers (e.g. private browsing in some
// versions of Safari) can refuse this — in that case the site falls back to the normal, always-
// online mode automatically.
let firestoreDb
try {
  firestoreDb = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })
} catch (e) {
  console.warn('[RDA] offline cache unavailable, using the network-only default', e)
  firestoreDb = getFirestore(app)
}
export const db = firestoreDb

export const storage = getStorage(app)
storage.maxUploadRetryTime = 20000

// Dhammaan collections-ka RDA waxay leeyihiin prefix u gaar ah si aysan ugu qasmin xogta dream-crt.
export const COL = {
  admins: 'Rda-Admin', // Super-Admin + sub admins
  settings: 'rda_settings', // doc "site"
  hero: 'rda_hero',
  programs: 'rda_programs',
  regions: 'rda_regions',
  team: 'rda_team',
  news: 'rda_news',
  gallery: 'rda_gallery',
  partners: 'rda_partners',
  messages: 'rda_messages',
  menu: 'rda_menu', // navbar + dropdown-yada
  pages: 'rda_pages', // bogagga cusub ee dropdown-yada (macluumaadkooda)
}