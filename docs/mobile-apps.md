# Kuha Ko on the App Store and Google Play

The apps live in `apps/mobile`. They are the website (`apps/web`), built and bundled inside a native iOS and Android shell with [Capacitor](https://capacitorjs.com) 8. The site runs from files inside the app, so it opens offline. Fonts still load from Google Fonts, so they need a connection; offline, the app falls back to Georgia and Helvetica.

| | iOS | Android |
| --- | --- | --- |
| App name | Kuha Ko | Kuha Ko |
| App ID | `com.kuhako.app` | `com.kuhako.app` |
| Version | 1.0 (build 1) | 1.0 (versionCode 1) |
| Minimum OS | iOS 15 | Android 7 (API 24) |
| Devices | iPhone and iPad | Phones and tablets |

The app ID can be changed freely **until the first upload to either store**. After that it is permanent. To change it, edit `appId` in `apps/mobile/capacitor.config.json`, `PRODUCT_BUNDLE_IDENTIFIER` in Xcode, and `applicationId` and `namespace` in `apps/mobile/android/app/build.gradle`.

## What you need

| | Cost | Notes |
| --- | --- | --- |
| A Mac with **Xcode** | Free | From the Mac App Store. About 15 GB. Open it once to accept the licence and install the iOS platform. |
| **Android Studio** | Free | From developer.android.com/studio. Includes the Java runtime and Android SDK. |
| **Apple Developer Program** | US$99 a year | developer.apple.com/programs. As a business you also need a D-U-N-S number; as an individual, your own name shows as the seller. |
| **Google Play Console** | US$25 once | play.google.com/console. Identity verification takes a few days. |
| A **privacy policy** web page | | Both stores require a link. The site has none yet (see "Before you submit"). |

## Everyday commands (from the repo root)

```sh
npm run mobile:sync      # build the website and copy it into both apps
npm run mobile:ios       # open the iOS project in Xcode
npm run mobile:android   # open the Android project in Android Studio
```

Run `mobile:sync` after **every** website change. The apps only get new content when you sync, build and publish a new version to the stores; they don't update from Vercel.

Icons and splash screens come from `apps/mobile/assets/`. After changing those images, run `npm run assets --workspace @kuhako/mobile`.

## Try it on a phone

- **iPhone:** `npm run mobile:ios`. In Xcode, select the App target → Signing & Capabilities → choose your team. Plug in the phone, pick it in the device menu, press Run.
- **Android:** `npm run mobile:android`. Wait for Gradle to finish, plug in a phone with USB debugging on (or start an emulator), press Run.

## Before you submit

1. **Replace the stock coffee photos** with Kuha Ko's own (`apps/web/src/data/photos.ts`). Store screenshots and the app should show your real drinks.
2. **Publish a privacy policy.** The site and app collect nothing themselves: no accounts, analytics or forms. The only thing stored is the light/dark choice, on the device. The page should still say so, name who runs the app and how to contact you, and mention that fonts load from Google Fonts. Put it on the website (for example `/privacy`) so both stores can link to it.
3. **Fill in what's still "coming soon"**, if you can: Facebook and Instagram links, address, hours (`apps/web/src/data/site.ts`). Reviewers open every link.
4. **Decide on iPad.** The app supports iPad, so App Store Connect will ask for iPad screenshots too. To ship iPhone-only, set Xcode → App target → General → Supported Destinations to iPhone only.
5. **Know the review risk.** Apple guideline 4.2 ("Minimum Functionality") rejects apps that are only a repackaged website. This app bundles its content and works offline, which helps, but Apple may still reject it. Features that make it more app-like improve the odds, for example live-selling notifications, saving favourite pieces, or a claim tracker.

## Release on the App Store

1. In Xcode, set the version under App target → General (Version `1.0`, Build `1`; raise Build for every upload).
2. Choose **Any iOS Device (arm64)** as the destination, then **Product → Archive**.
3. In the Organizer window: **Distribute App → App Store Connect → Upload**.
4. In [App Store Connect](https://appstoreconnect.apple.com): create the app with the same bundle ID. Then:
   - Add the name, subtitle, description, keywords, support URL, privacy policy URL, category (Food & Drink), and screenshots at the sizes App Store Connect asks for.
   - Under **App Privacy**, answer the data-collection questions. "Data Not Collected" applies if nothing has changed since this guide was written.
   - Choose the uploaded build and **Submit for Review**.
5. Test first with **TestFlight** if you like: the uploaded build appears there before review.

## Release on Google Play

1. **Create an upload key once**, and keep it safe and backed up. It isn't in git, and losing it makes updates hard. In Android Studio: **Build → Generate Signed App Bundle or APK → Android App Bundle → Create new…**.
2. Set the version in `apps/mobile/android/app/build.gradle`: `versionName "1.0"`, and raise `versionCode` by 1 for every upload.
3. Build the signed **release** `.aab` with the same menu.
4. In the [Play Console](https://play.google.com/console): create the app, then:
   - Complete the store listing: description, 512×512 icon, 1024×500 feature graphic, phone screenshots.
   - Add the privacy policy URL, content rating questionnaire, target audience, and the **Data safety** form ("No data collected" applies if nothing has changed).
   - Upload the `.aab` to a testing track.
5. **New personal developer accounts** must run a **closed test with at least 12 testers for 14 days in a row** before Google lets them publish to production. Organisation accounts are exempt. Plan for this before the shop opens.
6. Promote the build to **Production** and submit for review.
