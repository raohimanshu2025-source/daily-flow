# RozanaPay — Native Android Build (Play Console)

This project is wrapped with **Capacitor 8**. Web build stays unchanged.

## One-time setup (on your own machine)

1. **Export to GitHub** from Lovable (top-right → GitHub → Connect).
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

- `appId`: `app.lovable.6865badc27af49cf84e0571337468027` (change before final Play Store submission to your own reverse-domain ID — once published this **cannot** be changed).
- `appName`: `RozanaPay`
- The dev `server.url` in `capacitor.config.ts` enables hot-reload from the Lovable sandbox. **Remove the `server` block before producing the release `.aab`** so the app loads bundled assets.

## Play Console checklist (RozanaPay-specific)

- [x] PWA manifest + 192/512/maskable icons
- [x] Service worker guarded against Capacitor/iframe/preview
- [x] KYC stored in **private** bucket with signed URL viewer
- [x] Loan disclosure: APR, fees, lender, consent checkbox (Play Personal Loans policy)
- [x] OTP server-side rate limit (audit log + otp_attempts)
- [ ] Replace placeholder NBFC partner name + reg number in `src/pages/Loans.tsx`
- [ ] Privacy Policy + Terms public URLs
- [ ] Data Safety form in Play Console (we collect: phone, name, KYC docs, financial txns)
- [ ] Sensitive permissions justification (none currently requested beyond INTERNET)