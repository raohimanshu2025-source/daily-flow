# RozanaPay — Native Android Build (Play Console)

This project is wrapped with **Capacitor 8**. Web build stays unchanged.

## One-time setup (on your own machine)

2. `git clone <your-repo>` and `cd` into it.
3. `npm install`
4. `npx cap add android` (and `npx cap add ios` if on a Mac with Xcode).

## Every time you pull new web changes

```bash
git pull
npm install
npm run build
npx cap sync android
```

## Run on emulator / device

```bash
npx cap run android         # needs Android Studio installed
# or open the project in Android Studio:
npx cap open android
```

## Produce a signed `.aab` for Play Console

1. In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**.
2. Create a new keystore (store it safely — losing it means losing the app).
3. Build variant: **release**.
4. Output: `android/app/release/app-release.aab` → upload to Play Console.

## Important config

- `appId`: `in.rozanapay.app`. It can still be changed until the first Play Store upload; after that it **cannot** be changed.
- `appName`: `RozanaPay`
- There is no `server` block, so the app loads its own bundled build (`dist/`), which talks to the RozanaPay Supabase backend. For live-reload during development only, you can temporarily add `server: { url: 'http://<your-computer-ip>:8080', cleartext: true }` — never ship that.

## Play Console checklist (RozanaPay-specific)

- [x] PWA manifest + 192/512/maskable icons
- [x] Service worker guarded against Capacitor/iframe/preview
- [x] KYC stored in **private** bucket with signed URL viewer
- [x] Loan disclosure: APR, fees, lender, consent checkbox (Play Personal Loans policy)
- [x] OTP server-side rate limit (audit log + otp_attempts)
- [ ] Replace "Lender: not yet assigned" in the KFS (`kfs.lender` in `src/lib/i18n.ts`) with the real NBFC partner name + RBI registration number
- [x] Privacy Policy + Terms public URLs (https://rozanapay.netlify.app/privacy, /terms)
- [ ] Data Safety form in Play Console (we collect: phone, name, KYC docs, financial txns)
- [ ] Sensitive permissions justification (none currently requested beyond INTERNET)