import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
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
export const db = getFirestore(app)
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