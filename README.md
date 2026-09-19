# Rural Development Aid – Somalia (React + Vite + Firebase)

## Bilow
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production → dist/
npm start          # Railway: vite preview on $PORT
```

## Firebase (project: dream-crt)
1. `src/firebase.js` — hubi `apiKey` (ka koobi Firebase Console → Project settings → Your apps).
2. Firestore → Rules: ku dar `firestore.rules`. Storage → Rules: ku dar `storage.rules`.
3. Admin-ka: `/admin` — waxaa laga akhriyaa `Rda-Admin/Super-Admin` (`username`, `password`, `role`).
   Marka ugu horreysa ee Super Admin soo galo, xogta asalka ah (programs, regions, team, site text) si toos ah ayaa loo geliyaa Firestore.

## Collections (dhammaan prefix `rda_`)
`Rda-Admin`, `rda_settings/site`, `rda_hero`, `rda_programs`, `rda_regions`, `rda_team`, `rda_news`, `rda_gallery`, `rda_partners`, `rda_messages`

## Sawirada
Waxaa lagu yareeyaa browser-ka ka hor, kadibna Firebase Storage (`rda/...`). Haddii Storage rules diidaan,
sawirka yar ayaa lagu kaydiyaa Firestore (fallback) si uusan u istaagin.

## Roles
- `admin` (Super Admin): wax walba + Sub Admins.
- `subadmin`: kaliya qaybaha loo ogolaaday (permissions).
